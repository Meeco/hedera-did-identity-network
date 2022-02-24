import supertest from "supertest";
import { app } from "../../src";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { resolve } from "path";

describe("DID Document", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    jest.mock("../../src/services/connection.service", () => {
      const originalModule = jest.requireActual(
        "../../src/services/connection.service"
      );

      return {
        __esModule: true,
        ...originalModule,
        connectWithRetry: new Promise(() => resolve()),
        getMongoose: mongoose,
      };
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    jest.resetAllMocks();
  });

  describe("resolve DID Document", () => {
    describe("given invalid DID Identifier", () => {
      it("should return a 500 with error incorrect format", async () => {
        const invalidDidIdentifier =
          "did:hedera:testnet:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT4_0.0.30787373";
        const result = await supertest(app).get(`/did/${invalidDidIdentifier}`);

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({
          error: "DID string is invalid. ID holds incorrect format.",
          message: "Internal Server Error",
        });
      });

      it("should return a 500 with error invalid prefix.", async () => {
        const invalidDidIdentifier =
          "invalid:hedera:testnet:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT4_0.0.30787373";
        const result = await supertest(app).get(`/did/${invalidDidIdentifier}`);

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({
          error: "DID string is invalid: invalid prefix.",
          message: "Internal Server Error",
        });
      });

      it("should return a 500 with error invalid method name.", async () => {
        const invalidDidIdentifier =
          "did:invalid:testnet:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT4_0.0.30787373";
        const result = await supertest(app).get(`/did/${invalidDidIdentifier}`);

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({
          error: "DID string is invalid: invalid method name: invalid",
          message: "Internal Server Error",
        });
      });

      it("should return a 500 with error invalid network.", async () => {
        const invalidDidIdentifier =
          "did:hedera:invalid:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT4_0.0.30787373";
        const result = await supertest(app).get(`/did/${invalidDidIdentifier}`);

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({
          error: "DID string is invalid. Invalid Hedera network.",
          message: "Internal Server Error",
        });
      });

      it("should return a 500 with error did parsing error.", async () => {
        const invalidDidIdentifier =
          "did:hedera:testnet:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT4_0.0";
        const result = await supertest(app).get(`/did/${invalidDidIdentifier}`);

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({
          error: "failed to parse entity id: 0.0",
          message: "Internal Server Error",
        });
      });
    });

    describe("given DID identifier without events", () => {
      it("should return a 200 with empty DID Document.", async () => {
        const identifier =
          "did:hedera:testnet:z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT47_0.0.3";
        const result = await supertest(app).get(`/did/${identifier}`);

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({
          "@context": "https://www.w3.org/ns/did/v1",
          assertionMethod: [],
          authentication: [],
          id: identifier,
          verificationMethod: [],
        });
      });
    });

    describe("given newly register DID identifier", () => {
      it("should return a 200 with DID Document.", async () => {
        // register new did
        const newDIDDocument = await supertest(app).post("/did").send({
          publicKeyMultibase:
            "z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT47",
        });

        // resolve did
        const identifier = newDIDDocument.body.id;
        const result = await supertest(app).get(`/did/${identifier}`);

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(newDIDDocument.body);
      });
    });
  });

  describe("register DID Document", () => {
    describe("given invalid request body object", () => {
      it("should return a 422 with validation error ", async () => {
        const result = await supertest(app).post("/did").send({
          invalid: "abcd",
        });
        expect(result.statusCode).toBe(422);
        expect(result.body).toEqual({
          details: {
            "body.invalid": {
              message:
                '"invalid" is an excess property and therefore is not allowed',
              value: "invalid",
            },
            "body.publicKeyMultibase": {
              message: "'publicKeyMultibase' is required",
            },
          },
          message: "Validation Failed",
        });
      });

      it("should return a 422 with validation error ", async () => {
        const result = await supertest(app).post("/did").send({
          publicKeyMultibase:
            "z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT47",
          extra: "invalid prop",
        });
        expect(result.statusCode).toBe(422);
        expect(result.body).toEqual({
          details: {
            "body.extra": {
              message:
                '"extra" is an excess property and therefore is not allowed',
              value: "extra",
            },
          },
          message: "Validation Failed",
        });
      });
    });

    describe("given valid request body", () => {
      it("should return a 201 with newly registered DID Document ", async () => {
        const result = await supertest(app).post("/did").send({
          publicKeyMultibase:
            "z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT47",
        });
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();
        expect(result.body.verificationMethod).toBeDefined();
        expect(result.body.verificationMethod.length).toBe(2);
        expect(result.body.verificationMethod[1].publicKeyMultibase).toEqual(
          "z6MkreRjoWnX5sCbQRxJUbcCneSqfbbzuTWh62wUmqrSoT47"
        );
      });
    });
  });

  describe("delete DID Document", () => {});
});
