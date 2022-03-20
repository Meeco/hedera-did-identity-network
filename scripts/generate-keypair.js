const { Hashing } = require("@hashgraph/did-sdk-js");
const { PrivateKey } = require("@hashgraph/sdk");

const pk = PrivateKey.generate();
console.log(`privateKey: ${pk.toString()}`);
console.log(`publicKey: ${pk.publicKey.toString()}`);
console.log(`privateKeyMultibase: ${Hashing.multibase.encode(pk.toBytes())}`);
console.log(
  `publicKeyMultibase: ${Hashing.multibase.encode(pk.publicKey.toBytes())}`
);
