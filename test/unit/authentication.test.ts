import { PrivateKey } from "@hashgraph/sdk";
import { Request } from "express";
import { expressAuthentication } from "../../src/authentication";
import { generateAuthHeaders } from "../utils";

const TEST_DID_DOCUMENT = {
  verificationMethod: [
    {
      id: "test-key-id",
      publicKeyMultibase: "z6MksTr6nw7fphWvcRb4bvmJbkXAgjbHoWLby4gbaTKakgaH",
    },
  ],
  authentication: ["test-key-id"],
};

jest.mock("../../src/services", () => {
  return {
    ResolverService: jest.fn().mockImplementation(() => ({
      resolveFromDB: () => {
        return TEST_DID_DOCUMENT;
      },
    })),
    getVcStatusIndexControllerByFileIdAndIndex: jest
      .fn()
      .mockImplementation(() => {}),
  };
});

describe("Authorization", () => {
  const SIGNER = PrivateKey.fromString(
    "302e020100300506032b657004220420f402bf318a2ecbe77873e58cebbe6022a883cfcebac25947a3684b8dc27b7704"
  );

  const dateInThePast = new Date(new Date().getTime() - 1000);

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("resolves to null if securityName is not equal to SignedRequestHeader", async () => {
    const result = await expressAuthentication(
      {} as Request,
      "notSignedRequestHeader",
      []
    );
    expect(result).toEqual(null);
  });

  describe("securityName SignedRequestHeader", () => {
    it("returns error if digest is not valid", async () => {
      let error;

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/test/endpoint`,
        method: "POST",
        headers: {},
        body: { test: "data" },
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        SIGNER,
        "test-key-id"
      );

      await expressAuthentication(
        {
          url: `http://localhost:8000/test/endpoint`,
          method: "POST",
          params: { did: "test-did-str" } as any,
          headers: { ...authHeaders } as any,
          body: { test: "different data" },
        } as Request,
        "SignedRequestHeader",
        []
      ).catch((err) => (error = err));

      expect(error).toEqual(new Error("Digest header value is invalid"));
    });

    it("returns error if request is expired", async () => {
      let error;

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/test/endpoint`,
        method: "POST",
        headers: {},
        body: { test: "data" },
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        SIGNER,
        "test-key-id",
        dateInThePast
      );

      await expressAuthentication(
        {
          url: `http://localhost:8000/test/endpoint`,
          method: "POST",
          params: { did: "test-did-str" } as any,
          headers: { ...authHeaders } as any,
          body: { test: "data" },
        } as Request,
        "SignedRequestHeader",
        []
      ).catch((err) => (error = err));

      expect(error).toEqual(new Error("Request has expired"));
    });

    it("returns error if key is not found in DID document", async () => {
      let error;

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/test/endpoint`,
        method: "POST",
        headers: {},
        body: { test: "data" },
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        SIGNER,
        "non-existant-key-id"
      );

      await expressAuthentication(
        {
          url: `http://localhost:8000/test/endpoint`,
          method: "POST",
          params: { did: "test-did-str" } as any,
          headers: { ...authHeaders } as any,
          body: { test: "data" },
        } as Request,
        "SignedRequestHeader",
        []
      ).catch((err) => (error = err));

      expect(error).toEqual(
        new Error("Not authorized to operate on test-did-str DID document")
      );
    });

    it("returns invalid authorization header signature error", async () => {
      let error;

      const requestOptions = {
        json: true,
        url: `http://localhost:8000/test/endpoint`,
        method: "POST",
        headers: {},
        body: { test: "data" },
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        PrivateKey.generate(),
        "test-key-id"
      );

      await expressAuthentication(
        {
          url: `http://localhost:8000/test/endpoint`,
          method: "POST",
          params: { did: "test-did-str" } as any,
          headers: { ...authHeaders } as any,
          body: { test: "data" },
        } as Request,
        "SignedRequestHeader",
        []
      ).catch((err) => (error = err));

      expect(error).toEqual(new Error("Request signature is invalid"));
    });

    it("successfuly resolves to a DID document", async () => {
      const requestOptions = {
        json: true,
        url: `http://localhost:8000/test/endpoint`,
        method: "POST",
        headers: {},
        body: { test: "data" },
      };

      const authHeaders = await generateAuthHeaders(
        requestOptions,
        SIGNER,
        "test-key-id"
      );

      const result = await expressAuthentication(
        {
          url: `http://localhost:8000/test/endpoint`,
          method: "POST",
          params: { did: "test-did-str" } as any,
          headers: { ...authHeaders } as any,
          body: { test: "data" },
        } as Request,
        "SignedRequestHeader",
        []
      );

      expect(result).toEqual(TEST_DID_DOCUMENT);
    });
  });
});
