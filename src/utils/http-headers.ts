import { PrivateKey } from "@hashgraph/sdk";
import { createHeaderValue } from "./http-digest";

const httpSignature = require("@digitalbazaar/http-signature-header");

export const generateAuthHeaders = async (
  requestOptions: any,
  signer: PrivateKey,
  keyId: string
) => {
  let headers: any = {
    host: "localhost:8000",
    date: new Date().toUTCString(),
  };

  const requestBody = requestOptions.body;

  const serializedRequestBody = requestBody
    ? JSON.stringify(requestBody)
    : JSON.stringify({});
  const digestHeader: string = await createHeaderValue({
    data: serializedRequestBody,
    algorithm: "sha256",
    useMultihash: false,
  });

  /**
   * Build signed HTTP request headers
   */
  const includeHeaders = ["date", "host", "(request-target)"];

  if (["post", "put", "patch"].includes(requestOptions.method.toLowerCase())) {
    includeHeaders.push("digest");
    headers["digest"] = digestHeader;
  }

  const plaintext = httpSignature.createSignatureString({
    includeHeaders,
    requestOptions: {
      ...requestOptions,
      headers: { ...requestOptions.headers, ...headers },
    },
  });

  const data = new TextEncoder().encode(plaintext);
  const signature = Buffer.from(signer.sign(data)).toString("base64");

  const authorization = httpSignature.createAuthzHeader({
    includeHeaders,
    keyId,
    signature,
  });

  return {
    ...headers,
    Authorization: authorization,
  };
};
