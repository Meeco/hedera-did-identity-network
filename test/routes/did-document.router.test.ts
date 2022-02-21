import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/middleware/error.middleware";
import { notFoundHandler } from "../../src/middleware/not-found.middleware";
import router from "../../src/routes";

const app = express();

app.use("/", router);
app.use(errorHandler);
app.use(notFoundHandler);

describe("DID Document router", () => {
  describe("GET /did/:did", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .get("/did/test-did-id")
        .set("Accept", "application/json");

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "Resolve DID not impemented",
        statusCode: 500,
      });
    });
  });

  xdescribe("POST /did", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .post("/did")
        .set("Accept", "application/json")
        .send({});

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "Register DID not implemented",
        statusCode: 500,
      });
    });
  });

  describe("DELETE /did/:did", () => {
    test("throws errors", async () => {
      const res = await request(app)
        .delete("/did/test-did-id")
        .set("Accept", "application/json");

      expect(res.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: "Remove DID not imoplemented",
        statusCode: 500,
      });
    });
  });
});
