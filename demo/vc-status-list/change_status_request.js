const { generateAuthHeaders } = require("../../scripts/http-headers");
const http = require("http");
const { PrivateKey } = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function changeStatus(status) {
  const ISSUER_DID = process.env.ISSUER_DID || "";
  const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY || "";
  const STATUS_LIST_FILE_ID = process.env.STATUS_LIST_FILE_ID;
  const STATUS_LIST_INDEX = process.env.STATUS_LIST_INDEX;

  const signer = PrivateKey.fromString(ISSUER_PRIVATE_KEY);

  const body = {
    status,
  };

  const postData = JSON.stringify(body);

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/vc/status/${STATUS_LIST_FILE_ID}/${STATUS_LIST_INDEX}`,
    method: "PUT",
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
    path: `/vc/status/${STATUS_LIST_FILE_ID}/${STATUS_LIST_INDEX}`,
    method: "PUT",
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

module.exports = {
  changeStatus,
};
