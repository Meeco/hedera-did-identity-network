import { VerificationMethod } from "./verification-method.interface";

export interface IVerificationMethodRegisterPayload {
  verificationMethod: VerificationMethod;
}

export interface IVerificationMethodUpdateBody {
  /**
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   */
  controller: string;
  type: "Ed25519VerificationKey2018";
  /**
   * @example "z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5"
   */
  publicKeyMultibase: string;
}

export interface IVerificationMethodUpdatePayload {
  verificationMethod: IVerificationMethodUpdateBody;
}
