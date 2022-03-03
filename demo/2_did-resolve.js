const http = require("http");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const DID_IDENTIFIER = process.env.DID_IDENTIFIER || "";

  const options = {
    hostname: "localhost",
    port: 8000,
    path: `/did/${DID_IDENTIFIER}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log(`=============RESPONSE=============== `);

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode} \n`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)} \n`);
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
  req.end();
}

main();
