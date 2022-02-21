import express from "express";
import request from "supertest";
// import { errorHandler } from "../../src/middleware/error.middleware";
// import { notFoundHandler } from "../../src/middleware/not-found.middleware";
// import router from "../../src/routes";

const app = express();

// app.use("/", router);
// app.use(errorHandler);
// app.use(notFoundHandler);

xdescribe("DID Verification Method router", () => {
  describe("POST /did/:did/verification-methods", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .post("/did/test-did-id/verification-methods")
        .set("Accept", "application/json")
        .send({});

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "create verification method not implemented",
        statusCode: 500,
      });
    });
  });

  describe("PUT /did/:did/verification-methods/:id", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .put(
          "/did/test-did-id/verification-methods/test-verification-method-id"
        )
        .set("Accept", "application/json")
        .send({});

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "get verification method not implemented",
        statusCode: 500,
      });
    });
  });

  describe("DELETE /did/:did/verification-methods/:id", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .delete(
          "/did/test-did-id/verification-methods/test-verification-method-id"
        )
        .set("Accept", "application/json");

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "remove verification method not implemented",
        statusCode: 500,
      });
    });
  });
});
