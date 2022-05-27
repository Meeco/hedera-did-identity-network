const http = require("http");
const { Hashing } = require("@hashgraph/did-sdk-js");
const { PrivateKey } = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";

  const postData = JSON.stringify({
    publicKeyMultibase: Hashing.multibase.encode(
      PrivateKey.fromString(DID_PRIVATE_KEY).publicKey.toBytes()
    ),
  });
  const options = {
    hostname: "localhost",
    port: 8000,
    path: "/did",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

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
