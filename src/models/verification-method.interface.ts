export class VerificationMethod {
  /**
   * Verification method ID consists of two parts: <br />
   * 1) DID document ID verification method belongs to <br />
   * 2) Unique verification method identifier in a format "#key-{number}"
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#key-1"
   */
  id!: string;
  /**
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   */
  controller!: string;
  type!: "Ed25519VerificationKey2018";
  /**
   * @example "z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5"
   */
  publicKeyMultibase!: string;
}
