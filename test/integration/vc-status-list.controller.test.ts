import { PrivateKey } from "@hashgraph/sdk";
import supertest, { Response } from "supertest";
import { app } from "../../src/server";
import { generateAuthHeaders, getPublicKeyMultibase } from "../utils";
import { setupBeforeAndAfter } from "./setup";

describe("VC Status List", () => {
  const DID_PRIVATE_KEY = PrivateKey.fromString(
    process.env.DID_PRIVATE_KEY || ""
  );
  const DID_PUBLIC_KEY_MULTIBASE = getPublicKeyMultibase(DID_PRIVATE_KEY);
  const ISSUER_DID = process.env.ISSUER_DID;

  let registeredDidDocument: Response;

  const dateInThePast = new Date(new Date().getTime() - 1000);

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

  describe("registers VC status", () => {
    it("returns error about expired request", async () => {
      const body = { issuerDID: registeredDidDocument.body.id };

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/vc/register`,
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

      const result = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(500);
      expect(result.body).toBeDefined();
      expect(result.body).toEqual({
        error: "Request has expired",
        message: "Internal Server Error",
      });
    });

    it("returns error if issuerDID is not passed", async () => {
      const body = { issuerDID: null };

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/vc/register`,
        method: "POST",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(500);
      expect(result.body).toBeDefined();
      expect(result.body).toEqual({
        error:
          "Validation Failed: either 'did' param or 'issuerDID' in payload is required",
        message: "Internal Server Error",
      });
    });

    it("successfully registers two credentials with different indices", async () => {
      const body = { issuerDID: registeredDidDocument.body.id };

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/vc/register`,
        method: "POST",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result1 = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      const result2 = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result1.statusCode).toBe(201);
      expect(result1.body).toBeDefined();
      expect(result1.body).toEqual({
        statusInfo: {
          id: expect.stringMatching(
            /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+\/0/
          ),
          statusListCredential: expect.stringMatching(
            /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+/
          ),
          statusListIndex: 0,
          type: "RevocationList2021Status",
        },
      });

      expect(result2.statusCode).toBe(201);
      expect(result2.body).toBeDefined();
      expect(result2.body).toEqual({
        statusInfo: {
          id: expect.stringMatching(
            /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+\/2/
          ),
          statusListCredential: expect.stringMatching(
            /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+/
          ),
          statusListIndex: 2,
          type: "RevocationList2021Status",
        },
      });
    });
  });

  describe("updates VC status", () => {
    let registeredVcStatusInfo: Response;

    beforeAll(async () => {
      const body = { issuerDID: registeredDidDocument.body.id };

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/vc/register`,
        method: "POST",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      registeredVcStatusInfo = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(registeredVcStatusInfo.statusCode).toBe(201);
      expect(registeredVcStatusInfo.body).toBeDefined();
    });

    it("returns error about expired request", async () => {
      const body = { status: "revoked" };

      const url = registeredVcStatusInfo.body.statusInfo.id;
      const path = new URL(registeredVcStatusInfo.body.statusInfo.id).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "PUT",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id,
        dateInThePast
      );

      const result = await supertest(app)
        .put(path)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(500);
      expect(result.body).toBeDefined();
      expect(result.body).toEqual({
        error: "Request has expired",
        message: "Internal Server Error",
      });
    });

    it("returns error about invalid state", async () => {
      const body = { status: "invalid" };

      const url = registeredVcStatusInfo.body.statusInfo.id;
      const path = new URL(registeredVcStatusInfo.body.statusInfo.id).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "PUT",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .put(path)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(422);
      expect(result.body).toBeDefined();
      expect(result.body).toEqual({
        details: {
          "body.status": {
            message:
              'Could not match the union against any of the items. Issues: [{"body.status":{"message":"should be one of the following; [\'revoked\']","value":"invalid"}},{"body.status":{"message":"should be one of the following; [\'suspended\']","value":"invalid"}},{"body.status":{"message":"should be one of the following; [\'resumed\']","value":"invalid"}},{"body.status":{"message":"should be one of the following; [\'active\']","value":"invalid"}}]',
            value: "invalid",
          },
        },
        message: "Validation Failed",
      });
    });

    it("sets state to to revoked", async () => {
      const body = { status: "revoked" };

      const url = registeredVcStatusInfo.body.statusInfo.id;
      const path = new URL(registeredVcStatusInfo.body.statusInfo.id).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "PUT",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .put(path)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(204);
      expect(result.body).toEqual({});
    });

    it("sets state to to suspended", async () => {
      const body = { status: "suspended" };

      const url = registeredVcStatusInfo.body.statusInfo.id;
      const path = new URL(registeredVcStatusInfo.body.statusInfo.id).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "PUT",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .put(path)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(204);
      expect(result.body).toEqual({});
    });

    it("sets state to to resumed", async () => {
      const body = { status: "resumed" };

      const url = registeredVcStatusInfo.body.statusInfo.id;
      const path = new URL(registeredVcStatusInfo.body.statusInfo.id).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "PUT",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .put(path)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(result.statusCode).toBe(204);
      expect(result.body).toEqual({});
    });
  });

  describe("fetches VC status list verifiable credential", () => {
    let registeredVcStatusInfo: Response;

    beforeAll(async () => {
      const body = { issuerDID: registeredDidDocument.body.id };

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/vc/register`,
        method: "POST",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      registeredVcStatusInfo = await supertest(app)
        .post(`/vc/register`)
        .set({ ...requestOptions.headers, ...authHeaders })
        .send(body);

      expect(registeredVcStatusInfo.statusCode).toBe(201);
      expect(registeredVcStatusInfo.body).toBeDefined();
    });

    it("returns signed status list verifiable credential", async () => {
      const body = null;

      const url = registeredVcStatusInfo.body.statusInfo.statusListCredential;
      const path = new URL(
        registeredVcStatusInfo.body.statusInfo.statusListCredential
      ).pathname;

      const requestOptions = {
        json: true,
        url: url,
        method: "GET",
        headers: {},
        body: body,
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        DID_PRIVATE_KEY,
        registeredDidDocument.body.verificationMethod[1].id
      );

      const result = await supertest(app)
        .get(path)
        .set({ ...requestOptions.headers, ...authHeaders });

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/vc-status-list-2021/v1",
        ],
        _jwt: expect.stringMatching(/eyJ.+/),
        additionalProps: {
          jti: expect.stringMatching(/urn:uuid:.+/),
        },
        credentialSubject: {
          encodedList: expect.any(String),
          id: expect.stringMatching(
            /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+\#list/
          ),
          type: "RevocationList2021",
        },
        expirationDate: expect.any(String),
        id: expect.stringMatching(
          /https:\/\/localhost:8000\/vc\/status\/0\.0\.\d+/
        ),
        issuanceDate: expect.any(String),
        issuer: {
          id: ISSUER_DID,
        },
        jti: expect.stringMatching(/urn:uuid:.+/),
        proof: {
          created: expect.any(String),
          jws: expect.any(String),
          proofPurpose: "assertionMethod",
          type: "Ed25519Signature2018",
          verificationMethod: `${ISSUER_DID}#did-root-key`,
        },
        type: ["VerifiableCredential", "StatusList2021Credential"],
      });
    });
  });
});
