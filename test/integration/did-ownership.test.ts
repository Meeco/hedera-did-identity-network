import { HcsDid } from "@hashgraph/did-sdk-js/dist/identity/hcs/did/hcs-did";
import { Hashing } from "@hashgraph/did-sdk-js/dist/utils/hashing";
import { PrivateKey } from "@hashgraph/sdk";
import supertest from "supertest";
import { app } from "../../src/server";
import { generateAuthHeaders } from "../utils";
import { setupBeforeAndAfter } from "./setup";
import { client } from "../../src/services";

const DID_PUBLIC_KEY_MULTIBASE = process.env.DID_PUBLIC_KEY_MULTIBASE || "";
const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";

describe("DID Service", () => {
  const signer = PrivateKey.fromString(DID_PRIVATE_KEY);

  //setup in memory mongodb and mock mongoose db connection
  setupBeforeAndAfter();

  describe("Claim DID Document ownership back from the AppNet", () => {
    describe("given valid register DID identifier and delegate owner privatekey multibase payload", () => {
      it("should return a 200 with updated DID Document showing ownership changed to owner from AppNet.", async () => {
        // register new DID
        const registeredDidDocument = await supertest(app).post("/did").send({
          publicKeyMultibase: DID_PUBLIC_KEY_MULTIBASE,
        });

        expect(registeredDidDocument.statusCode).toBe(201);
        expect(registeredDidDocument.body).toBeDefined();
        expect(
          registeredDidDocument.body.verificationMethod[1].publicKeyMultibase
        ).toEqual(DID_PUBLIC_KEY_MULTIBASE);

        const pkMultibase = Hashing.multibase.encode(
          PrivateKey.fromString(DID_PRIVATE_KEY).toBytes()
        );
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
          signer,
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

  describe("Register an existing DID Document with AppNet", () => {
    describe("given valid register DID identifier and delegate owner privatekey multibase payload", () => {
      it("should return a 200 with updated DID Document showing ownership changed to AppNet from external owner", async () => {
        // generate DID outside AppNet

        const didPrivateKey = PrivateKey.generate();
        const did = new HcsDid({ privateKey: didPrivateKey, client: client });
        const registeredDid = await did.register();

        // register an existing DID Document with AppNet

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
