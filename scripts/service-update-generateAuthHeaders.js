const { generateAuthHeaders } = require("./http-headers");
const { PrivateKey } = require("@hashgraph/sdk");

async function main() {
  const didIdentifier =
    "did:hedera:testnet:z6MkqMb2zPN8zzqSA9tV2iia957kRpKNnZBQSRuLBFw9hutu_0.0.30835913";
  const serviceIdentifier =
    "did:hedera:testnet:z6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231#service-1";
  const signer = PrivateKey.fromString(
    "302e020100300506032b6570042204200e83b24dd97d9ebf267c095ed73a99cde94f6b3863d1cd484a3db25c055a626e"
  );

  const body = {
    service: {
      type: "LinkedDomains",
      serviceEndpoint: "https://test.com/test",
    },
  };

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/did/${encodeURIComponent(
      didIdentifier
    )}/services/${encodeURIComponent(serviceIdentifier)}`,
    method: "PUT",
    headers: {},
    body: body,
  };

  const authHeaders = await generateAuthHeaders(
    requestOptions,
    signer,
    "did:hedera:testnet:z6MkqMb2zPN8zzqSA9tV2iia957kRpKNnZBQSRuLBFw9hutu_0.0.30835913#key-1"
  );

  console.log(didIdentifier);
  console.log(`${serviceIdentifier}`);
  console.log({ ...requestOptions.headers, ...authHeaders });
  console.log("body: " + JSON.stringify(body));
}

main();
