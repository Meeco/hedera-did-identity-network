const { generateAuthHeaders } = require("../scripts/http-headers");
const http = require("http");
const { PrivateKey } = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const DID_IDENTIFIER = process.env.DID_IDENTIFIER || "";
  const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";

  const signer = PrivateKey.fromString(DID_PRIVATE_KEY);

  const serviceId =
    "did:hedera:testnet:z6MkrGm5d1cCtr6YbqxozvsvWN5XnTkNh9CkJDsVWXFfa638_0.0.30791334#service-2";

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/did/${DID_IDENTIFIER}/services/${encodeURIComponent(
      serviceId
    )}`,
    method: "DELETE",
    headers: {},
  };

  const authHeaders = await generateAuthHeaders(
    requestOptions,
    signer,
    `${DID_IDENTIFIER}#key-1`
  );

  const options = {
    hostname: "localhost",
    port: 8000,
    path: `/did/${DID_IDENTIFIER}/services/${encodeURIComponent(serviceId)}`,
    method: "DELETE",
    headers: {
      ...requestOptions.headers,
      ...authHeaders,
      "Content-Type": "application/json",
    },
  };

  console.log(`Signed Request HEADERS: `);
  console.log(options.headers);
  console.log();
  console.log(`=============RESPONSE=============== `);

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      console.log(`BODY:`);
      console.log(JSON.parse(chunk));
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}

main();
