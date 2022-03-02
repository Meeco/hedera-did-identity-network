import { PrivateKey } from "@hashgraph/sdk";
import supertest from "supertest";
import { app } from "../../src/server";
import { generateAuthHeaders } from "../utils";
import { setupBeforeAndAfter } from "./setup";

const DID_PUBLIC_KEY_MULTIBASE = process.env.DID_PUBLIC_KEY_MULTIBASE || "";
const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";
describe("DID Verification Method", () => {
  let registeredDidDocument: any = null;

  const verificationMethodIdentifier =
    "did:hedera:testnet:z6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231#key-1";

  const verificationMethodPublicKey =
    "z6Mkkcn1EDXc5vzpmvnQeCKpEswyrnQG7qq59k92gFRm1EGk";

  const signer = PrivateKey.fromString(DID_PRIVATE_KEY);

  //setup in memory mongodb and mock mongoose db connection
  setupBeforeAndAfter();
  beforeAll(async () => {
    // register new DID
    registeredDidDocument = await supertest(app).post("/did").send({
      publicKeyMultibase: DID_PUBLIC_KEY_MULTIBASE,
    });

    expect(registeredDidDocument.statusCode).toBe(201);
    expect(registeredDidDocument.body).toBeDefined();
    expect(
      registeredDidDocument.body.verificationMethod[1].publicKeyMultibase
    ).toEqual(DID_PUBLIC_KEY_MULTIBASE);
  });

  describe("Register verification-method to the DID Document", () => {
    describe("given valid register DID identifier and verification-method payload", () => {
      it("should return a 200 with updated DID Document.", async () => {
        const body = {
          verificationMethod: {
            id: verificationMethodIdentifier,
            type: "Ed25519VerificationKey2018",
            controller: registeredDidDocument.body.id,
            publicKeyMultibase: verificationMethodPublicKey,
          },
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/verification-methods`,
          method: "POST",
          headers: {},
          body: body,
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        const result = await supertest(app)
          .post(`/did/${registeredDidDocument.body.id}/verification-methods`)
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        expect(result.body.verificationMethod).toBeDefined();
        expect(result.body.verificationMethod.length).toBe(3);
        expect(result.body.verificationMethod[2]).toEqual(
          body.verificationMethod
        );
      });
    });
  });

  describe("Update verification-method information on the DID Document", () => {
    describe("given valid register DID identifier, verification-method ID and verification-method payload", () => {
      it("should return a 200 with updated DID Document.", async () => {
        const updatedVerificationMethodPublicKey =
          "z6MkhHbhBBLdKGiGnHPvrrH9GL7rgw6egpZiLgvQ9n7pHt1P";

        const body = {
          verificationMethod: {
            type: "Ed25519VerificationKey2018",
            controller: registeredDidDocument.body.id,
            publicKeyMultibase: updatedVerificationMethodPublicKey,
          },
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${
            registeredDidDocument.body.id
          }/verification-methods/${Buffer.from(
            verificationMethodIdentifier
          ).toString("base64")}`,
          method: "PUT",
          headers: {},
          body: body,
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        const result = await supertest(app)
          .put(
            `/did/${
              registeredDidDocument.body.id
            }/verification-methods/${Buffer.from(
              verificationMethodIdentifier
            ).toString("base64")}`
          )
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        expect(result.body.verificationMethod).toBeDefined();
        expect(result.body.verificationMethod.length).toBe(3);
        expect(result.body.verificationMethod[2].publicKeyMultibase).toEqual(
          body.verificationMethod.publicKeyMultibase
        );
      });
    });
  });

  describe("Remove verification-method information from the DID Document", () => {
    describe("given valid register DID identifier and verification-method ID", () => {
      it("should return a 200 with updated DID document", async () => {
        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${
            registeredDidDocument.body.id
          }/verification-methods/${Buffer.from(
            verificationMethodIdentifier
          ).toString("base64")}`,
          method: "DELETE",
          headers: {},
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        const result = await supertest(app)
          .delete(
            `/did/${
              registeredDidDocument.body.id
            }/verification-methods/${Buffer.from(
              verificationMethodIdentifier
            ).toString("base64")}`
          )
          .set({ ...requestOptions.headers, ...authHeaders })
          .send();

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        expect(result.body.verificationMethod[2]).toBeUndefined();
      });
    });
  });
});
