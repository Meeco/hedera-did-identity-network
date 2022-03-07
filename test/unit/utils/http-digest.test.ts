import { createHeaderValue, verifyHeaderValue } from "../../../src/utils";

describe("HTTP Digest util", () => {
  describe("#createHeaderValue", () => {
    const data = JSON.stringify({
      test: "data",
      one: new Date("Mon, 18 Dec 1995 17:28:35 GMT"),
      three: 3,
    });

    it("generates digest", async () => {
      const digest = await createHeaderValue({
        data,
        algorithm: "sha256",
        useMultihash: false,
      });
      expect(digest).toEqual(
        "SHA-256=vE7oe5ltnIU6vwcVTBhiSwhGbfczJQxGcbqKVjoI1VM="
      );
    });

    it("generates digest multihash", async () => {
      const digest = await createHeaderValue({
        data,
        algorithm: "sha256",
        useMultihash: true,
      });
      expect(digest).toEqual(
        "mh=uEiC8Tuh7mW2chTq_BxVMGGJLCEZt9zMlDEZxuopWOgjVUw"
      );
    });

    it("throws error if algorithm is not supported", async () => {
      let error = null;

      await createHeaderValue({
        data,
        algorithm: "invalid",
        useMultihash: true,
      }).catch((err) => (error = err));

      expect(error).toEqual(new Error('Algorithm "invalid" is not supported.'));
    });
  });

  describe("#verifyHeaderValue", () => {
    const data = JSON.stringify({
      test: "data",
      one: new Date("Mon, 18 Dec 1995 17:28:35 GMT"),
      three: 3,
    });

    it("successfully verifies header value", async () => {
      expect(
        await verifyHeaderValue({
          data,
          headerValue: "SHA-256=vE7oe5ltnIU6vwcVTBhiSwhGbfczJQxGcbqKVjoI1VM=",
        })
      ).toEqual({ verified: true });
    });

    it("returns verification failed result", async () => {
      const data = "data-to-fail";

      expect(
        await verifyHeaderValue({
          data,
          headerValue: "SHA-256=vE7oe5ltnIU6vwcVTBhiSwhGbfczJQxGcbqKVjoI1VM=",
        })
      ).toEqual({ verified: false });
    });

    it("returns verification failed result with error", async () => {
      expect(
        await verifyHeaderValue({
          data,
          headerValue: "SHA-=vE7oe5ltnIU6vwcVTBhiSwhGbfczJQxGcbqKVjoI1VM=",
        })
      ).toEqual({
        verified: false,
        error: new Error('Algorithm "sha" is not supported.'),
      });
    });
  });
});
