const { generateAuthHeaders } = require("./http-headers");
const { PrivateKey } = require("@hashgraph/sdk");

async function main() {
  const didIdentifier =
    "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719";
  const publicKeyMultiBase = "z6Mktu7jtMFJLE53nNEA7jdp9FGCVsDRqhNrzbkM3JHLDinC";
  const serviceIdentifier =
    "did:hedera:testnet:z6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231#service-1";
  const signer = PrivateKey.fromString(
    "302e020100300506032b6570042204200e83b24dd97d9ebf267c095ed73a99cde94f6b3863d1cd484a3db25c055a626e"
  );

  const body = {
    service: {
      id: serviceIdentifier,
      type: "LinkedDomains",
      serviceEndpoint: "https://example.com/vcs",
    },
  };

  const requestOptions = {
    json: true,
    url: `http://localhost:8000/did/${encodeURIComponent(
      didIdentifier
    )}/services`,
    method: "POST",
    headers: {},
    body: body,
  };

  const authHeaders = await generateAuthHeaders(
    requestOptions,
    signer,
    encodeURIComponent(
      "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#key-1"
    )
  );

  console.log("did: " + encodeURIComponent(didIdentifier));
  console.log({ ...requestOptions.headers, ...authHeaders });
  console.log("body: " + JSON.stringify(body));
}

main();
