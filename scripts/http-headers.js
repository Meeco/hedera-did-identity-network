const { createHeaderValue } = require("./http-digest");

const httpSignature = require("@digitalbazaar/http-signature-header");

const generateAuthHeaders = async (requestOptions, signer, keyId) => {
  let now = new Date();
  let thirtyMinutesFromNow = now.setMinutes(now.getMinutes() + 30);
  let headers = {
    host: "localhost:8000",
    expires: new Date(thirtyMinutesFromNow).toUTCString(),
  };

  const requestBody = requestOptions.body;

  const serializedRequestBody = requestBody
    ? JSON.stringify(requestBody)
    : JSON.stringify({});
  const digestHeader = await createHeaderValue({
    data: serializedRequestBody,
    algorithm: "sha256",
    useMultihash: false,
  });

  /**
   * Build signed HTTP request headers
   */
  const includeHeaders = ["expires", "host", "(request-target)"];

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

module.exports = {
  generateAuthHeaders,
};
