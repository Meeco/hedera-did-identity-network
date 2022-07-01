import { Hashing, HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey } from "@hashgraph/sdk";
import supertest from "supertest";
import { app } from "../../src/server";
import { client } from "../../src/services";
import { generateAuthHeaders, getPublicKeyMultibase } from "../utils";
import { setupBeforeAndAfter } from "./setup";

describe("DID Service", () => {
  const DID_PRIVATE_KEY = PrivateKey.fromString(
    process.env.DID_PRIVATE_KEY || ""
  );
  const DID_PUBLIC_KEY_MULTIBASE = getPublicKeyMultibase(DID_PRIVATE_KEY);

  const dateInThePast = new Date(new Date().getTime() - 1000);

  //setup in memory mongodb and mock mongoose db connection
  setupBeforeAndAfter();

  describe("Claim DID Document ownership back from the identity-network", () => {
    describe("given valid register DID identifier and delegate owner privatekey multibase payload", () => {
      it("returns error about expired request", async () => {
        // register new DID
        const registeredDidDocument = await supertest(app).post("/did").send({
          publicKeyMultibase: DID_PUBLIC_KEY_MULTIBASE,
        });

        expect(registeredDidDocument.statusCode).toBe(201);
        expect(registeredDidDocument.body).toBeDefined();
        expect(
          registeredDidDocument.body.verificationMethod[1].publicKeyMultibase
        ).toEqual(DID_PUBLIC_KEY_MULTIBASE);

        const pkMultibase = Hashing.multibase.encode(DID_PRIVATE_KEY.toBytes());
        const body = {
          privateKeyMultibase: pkMultibase,
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/claim`,
          method: "POST",
          headers: {},
          body: body,
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          DID_PRIVATE_KEY,
          registeredDidDocument.body.verificationMethod[1].id,
          dateInThePast
        );

        // claim ownership
        const result = await supertest(app)
          .post(`/did/${registeredDidDocument.body.id}/claim`)
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(500);
        expect(result.body).toBeDefined();
        expect(result.body).toEqual({
          error: "Request has expired",
          message: "Internal Server Error",
        });
      });

      it("should return a 200 with updated DID Document showing ownership changed to owner from identity-network.", async () => {
        // register new DID
        const registeredDidDocument = await supertest(app).post("/did").send({
          publicKeyMultibase: DID_PUBLIC_KEY_MULTIBASE,
        });

        expect(registeredDidDocument.statusCode).toBe(201);
        expect(registeredDidDocument.body).toBeDefined();
        expect(
          registeredDidDocument.body.verificationMethod[1].publicKeyMultibase
        ).toEqual(DID_PUBLIC_KEY_MULTIBASE);

        const pkMultibase = Hashing.multibase.encode(DID_PRIVATE_KEY.toBytes());
        const body = {
          privateKeyMultibase: pkMultibase,
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/claim`,
          method: "POST",
          headers: {},
          body: body,
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          DID_PRIVATE_KEY,
          registeredDidDocument.body.verificationMethod[1].id
        );

        // claim ownership
        const result = await supertest(app)
          .post(`/did/${registeredDidDocument.body.id}/claim`)
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        let didOwnerDidRootKey = result.body.verificationMethod.find(
          (m: any) => m.id == registeredDidDocument.body.id + "#did-root-key"
        );
        expect(didOwnerDidRootKey.publicKeyMultibase).toEqual(
          DID_PUBLIC_KEY_MULTIBASE
        );
        expect(didOwnerDidRootKey.controller).toEqual(
          registeredDidDocument.body.id
        );
      });
    });
  });

  describe("Register an existing DID Document with identity-network", () => {
    describe("given valid register DID identifier and delegate owner privatekey multibase payload", () => {
      it("should return a 200 with updated DID Document showing ownership changed to identity-network from external owner", async () => {
        // generate DID outside identity-network

        const didPrivateKey = PrivateKey.generate();
        const did = new HcsDid({ privateKey: didPrivateKey, client: client });
        const registeredDid = await did.register();

        // register an existing DID Document with identity-network

        const registeredDidPkMultibase = Hashing.multibase.encode(
          didPrivateKey.toBytes()
        );
        const body = {
          privateKeyMultibase: registeredDidPkMultibase,
        };

        const result = await supertest(app)
          .post(`/did/${registeredDid.getIdentifier()}/register`)

          .send(body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();

        //verify ownership
        const didOwnerDidRootKey = result.body.verificationMethod.find(
          (m: any) => m.id == registeredDid.getIdentifier() + "#did-root-key"
        );

        const didOwnerDelegateKey = result.body.verificationMethod.find(
          (m: any) => m.id == registeredDid.getIdentifier() + "#key-1"
        );

        const registeredDidPubKeyMultibase = Hashing.multibase.encode(
          didPrivateKey.publicKey.toBytes()
        );
        expect(didOwnerDelegateKey.publicKeyMultibase).toEqual(
          registeredDidPubKeyMultibase
        );
        expect(didOwnerDidRootKey.publicKeyMultibase).not.toEqual(
          registeredDidPubKeyMultibase
        );
        expect(didOwnerDidRootKey.controller).toEqual(
          registeredDid.getIdentifier()
        );
      });
    });
  });
});
