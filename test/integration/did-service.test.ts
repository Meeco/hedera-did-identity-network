import { PrivateKey } from "@hashgraph/sdk";
import supertest from "supertest";
import { app } from "../../src";
import { generateAuthHeaders } from "../utils";
import { setupBeforeAndAfter } from "./setup";

const DID_PUBLIC_KEY_MULTIBASE = process.env.DID_PUBLIC_KEY_MULTIBASE || "";
const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";
describe("DID Service", () => {
  let registeredDidDocument: any = null;

  const serviceIdentifier =
    "did:hedera:testnet:z6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231#service-1";

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

  describe("Register, Update and Revoke service to the DID Document", () => {
    describe("given valid register DID identifier and service payload", () => {
      it("should return a 200 with updated DID Document.", async () => {
        const body = {
          service: {
            id: serviceIdentifier,
            type: "LinkedDomains",
            serviceEndpoint: "https://example.com/vcs",
          },
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/services`,
          method: "POST",
          headers: {},
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        // register new did service
        const result = await supertest(app)
          .post(`/did/${registeredDidDocument.body.id}/services`)
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        expect(result.body.service).toBeDefined();
        expect(result.body.service.length).toBe(1);
        expect(result.body.service[0]).toEqual(body.service);
        registeredDidDocument = result;
      });
    });
  });

  describe("Update service information on the DID Document", () => {
    describe("given valid register DID identifier, service ID and service payload", () => {
      it("should return a 200 with updated DID Document.", async () => {
        const body = {
          service: {
            type: "LinkedDomains",
            serviceEndpoint: "https://example.com/test",
          },
        };

        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/services/${serviceIdentifier}`,
          method: "PUT",
          headers: {},
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        // register new did service
        const result = await supertest(app)
          .put(
            `/did/${registeredDidDocument.body.id}/services/${serviceIdentifier}`
          )
          .set({ ...requestOptions.headers, ...authHeaders })
          .send(body);

        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();
        expect(result.body.service).toBeDefined();
        expect(result.body.service.length).toBe(1);
        expect(result.body.service[0].serviceEndpoint).toEqual(
          body.service.serviceEndpoint
        );
      });
    });
  });

  describe("Remove service information from the DID Document", () => {
    describe("given valid register DID identifier and service ID", () => {
      it("should return a 200 with updated DID document", async () => {
        const requestOptions = {
          json: true,
          url: `http://localhost:8000/did/${registeredDidDocument.body.id}/services/${serviceIdentifier}`,
          method: "DELETE",
          headers: {},
        };

        const authHeaders = await generateAuthHeaders(
          requestOptions,
          signer,
          registeredDidDocument.body.verificationMethod[1].id
        );

        // register new did service
        const result = await supertest(app)
          .delete(
            `did/${registeredDidDocument.body.id}/services/${serviceIdentifier}`
          )
          .set({ ...requestOptions.headers, ...authHeaders })
          .send();

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        expect(result.body.service).toBeUndefined();
      });
    });
  });
});
