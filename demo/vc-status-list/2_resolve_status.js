const http = require("http");
const path = require("path");
const rl = require("vc-revocation-list");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const STATUS_LIST_FILE_ID = process.env.STATUS_LIST_FILE_ID;

  const options = {
    hostname: "localhost",
    port: 8000,
    path: `/vc/status/${STATUS_LIST_FILE_ID}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log(`=============RESPONSE=============== `);
  let vcStatusList = null;

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode} \n`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)} \n`);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      console.log(`BODY:`);

      vcStatusList = JSON.parse(chunk);
      console.log(vcStatusList);
    });
    res.on("end", async () => {
      console.log("No more data in response.");

      console.log(`=============Decoded status list=============== `);
      const decodedList = await rl.decodeList({
        encodedList: vcStatusList.credentialSubject.encodedList,
      });
      console.log(decodedList);
    });
  });

  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // Write data to request body
  req.end();
}

main();
