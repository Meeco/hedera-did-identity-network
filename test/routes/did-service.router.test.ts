import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/middleware/error.middleware";
import { notFoundHandler } from "../../src/middleware/not-found.middleware";
import router from "../../src/routes";

const app = express();

app.use("/", router);
app.use(errorHandler);
app.use(notFoundHandler);

describe("DID Service router", () => {
  describe("POST /did/:did/services", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .post("/did/test-did-id/services")
        .set("Accept", "application/json")
        .send({});

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "create service not implemented",
        statusCode: 500,
      });
    });
  });

  describe("PUT /did/:did/services/:id", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .put("/did/test-did-id/services/test-service-id")
        .set("Accept", "application/json")
        .send({});

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "get service not implemented",
        statusCode: 500,
      });
    });
  });

  describe("DELETE /did/:did/services/:id", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .delete("/did/test-did-id/services/test-service-id")
        .set("Accept", "application/json");

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "remove service not implemented",
        statusCode: 500,
      });
    });
  });
});
