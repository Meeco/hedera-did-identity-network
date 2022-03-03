const { generateAuthHeaders } = require("./http-headers");
const { PrivateKey } = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function main() {
  const DID_IDENTIFIER = process.env.DID_IDENTIFIER || "";
  const DID_PRIVATE_KEY = process.env.DID_PRIVATE_KEY || "";

  const serviceIdentifier =
    "did:hedera:testnet:z6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231#service-1";
  const signer = PrivateKey.fromString(DID_PRIVATE_KEY);

  const body = {
    service: {
      type: "LinkedDomains",
      serviceEndpoint: "https://test.com/test",
    },
  };

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/did/${encodeURIComponent(
      DID_IDENTIFIER
    )}/services/${encodeURIComponent(serviceIdentifier)}`,
    method: "PUT",
    headers: {},
    body: body,
  };

  const authHeaders = await generateAuthHeaders(
    requestOptions,
    signer,
    `${DID_IDENTIFIER}#key-1`
  );

  console.log(DID_IDENTIFIER);
  console.log(`${serviceIdentifier}`);
  console.log({ ...requestOptions.headers, ...authHeaders });
  console.log("body: " + JSON.stringify(body));
}

main();
