const http = require("http");
const {
  createAuthzHeader,
  createSignatureString,
} = require("@digitalbazaar/http-signature-header");
const { PrivateKey } = require("@hashgraph/sdk");

/**
 * Request signing key
 */
const signer = PrivateKey.fromString(
  "302e020100300506032b657004220420f402bf318a2ecbe77873e58cebbe6022a883cfcebac25947a3684b8dc27b7704"
);

/**
 * AppNet request definition
 */
const requestOptions = {
  json: true,
  url: "http://localhost:8000/did/did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334/services",
  method: "POST",
  body: {
    service: {
      id: "did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334#service-2",
      type: "LinkedDomains",
      serviceEndpoint: "https://asdfasdf.asdf",
    },
  },
  headers: {
    date: new Date().toUTCString(),
  },
};

/**
 * Build authorization header
 */
const includeHeaders = ["date", "host", "(request-target)"];

const plaintext = createSignatureString({
  includeHeaders,
  requestOptions,
});

const data = new TextEncoder().encode(plaintext);
const signature = Buffer.from(signer.sign(data)).toString("base64");

const authorization = createAuthzHeader({
  includeHeaders,
  keyId:
    "did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334#key-1",
  signature,
});

/**
 * Make a request
 */
const callback = function (response) {
  var str = "";
  response.on("data", function (chunk) {
    str += chunk;
  });

  response.on("end", function () {
    console.log(str);
  });
};

const serializedBody = JSON.stringify(requestOptions.body);

const req = http.request(
  requestOptions.url,
  {
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: authorization,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(serializedBody),
    },
  },
  callback
);

if (requestOptions.body) {
  req.write(serializedBody);
}

req.end();
