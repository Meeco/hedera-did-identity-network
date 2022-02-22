import { VerificationMethod } from "./verification-method.interface";

export interface IVerificationMethodRegisterPayload {
  verificationMethod: VerificationMethod;
}

export interface IVerificationMethodUpdateBody {
  controller: string;
  type: "Ed25519VerificationKey2018";
  publicKeyMultibase: string;
}

export interface IVerificationMethodUpdatePayload {
  verificationMethod: IVerificationMethodUpdateBody;
}
