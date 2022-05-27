const http = require("http");
const httpSignature = require("@digitalbazaar/http-signature-header");
const { createHeaderValue } = require("./http-digest");
const { PrivateKey } = require("@hashgraph/sdk");

async function main() {
  /**
   * Request signing key
   */
  const signer = PrivateKey.fromString(
    "302e020100300506032b657004220420f402bf318a2ecbe77873e58cebbe6022a883cfcebac25947a3684b8dc27b7704"
  );

  /**
   * Request body (optional)
   */
  const requestBody = {
    service: {
      id: "did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334#service-2",
      type: "LinkedDomains",
      serviceEndpoint: "https://asdfasdf.asdf",
    },
  };
  const serializedRequestBody = requestBody
    ? JSON.stringify(requestBody)
    : JSON.stringify({});
  const digestHeader = await createHeaderValue({
    data: serializedRequestBody,
    algorithm: "sha256",
    useMultihash: false,
  });

  /**
   * AppNet request definition
   */
  let now = new Date();
  let thirtyMinutesFromNow = now.setMinutes(now.getMinutes() + 30);
  let requestOptions = {
    json: true,
    url: "http://localhost:8000/did/did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334/services",
    method: "POST",
    body: requestBody,
    headers: {
      expires: new Date(thirtyMinutesFromNow).toUTCString(),
    },
  };

  /**
   * Build signed HTTP request headers
   */
  const includeHeaders = ["expires", "host", "(request-target)"];

  if (["post", "put", "patch"].includes(requestOptions.method.toLowerCase())) {
    includeHeaders.push("digest");
    requestOptions.headers.digest = digestHeader;
  }

  const plaintext = httpSignature.createSignatureString({
    includeHeaders,
    requestOptions,
  });

  const data = new TextEncoder().encode(plaintext);
  const signature = Buffer.from(signer.sign(data)).toString("base64");

  const authorization = httpSignature.createAuthzHeader({
    includeHeaders,
    keyId:
      "did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334#key-1",
    signature,
  });

  /**
   * Make a request
   */
  const callback = function (response) {
    let str = "";

    response.on("data", function (chunk) {
      str += chunk;
    });

    response.on("end", function () {
      console.log(str);
    });
  };

  console.log({
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: authorization,
      "Content-Type": "application/json",
      "Content-Length": requestOptions.body
        ? Buffer.byteLength(serializedRequestBody)
        : 0,
    },
  });

  const req = http.request(
    requestOptions.url,
    {
      ...requestOptions,
      headers: {
        ...requestOptions.headers,
        Authorization: authorization,
        "Content-Type": "application/json",
        "Content-Length": requestOptions.body
          ? Buffer.byteLength(serializedRequestBody)
          : 0,
      },
    },
    callback
  );

  if (requestOptions.body) {
    req.write(serializedRequestBody);
  }

  req.end();
}

main();
