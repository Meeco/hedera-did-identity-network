const { generateAuthHeaders } = require("../../scripts/http-headers");
const http = require("http");
const { PrivateKey } = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const ISSUER_DID = process.env.ISSUER_DID || "";
  const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY || "";

  const signer = PrivateKey.fromString(ISSUER_PRIVATE_KEY);

  const body = {
    issuerDID: ISSUER_DID,
  };

  const postData = JSON.stringify(body);

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/vc/register`,
    method: "POST",
    headers: {},
    body: body,
  };

  const authHeaders = await generateAuthHeaders(
    requestOptions,
    signer,
    `${ISSUER_DID}#key-1`
  );

  const options = {
    hostname: "localhost",
    port: 8000,
    path: `/vc/register`,
    method: "POST",
    headers: {
      ...requestOptions.headers,
      ...authHeaders,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
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

  // Write data to request body
  req.write(postData);
  req.end();
}

main();
