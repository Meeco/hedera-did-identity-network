import HttpException from "../common/http-exception";
import { DidDocument } from "../models/did-document";
import { VerificationMethod } from "../models/verification-method.interface";

export interface IVerificationMethodRegisterPayload {
  verificationMethod: VerificationMethod;
}

export interface IVerificationMethodUpdateBody {
  controller: string;
  type: string;
  publicKeyMultibase: string;
}

export interface IVerificationMethodUpdatePayload {
  verificationMethod: IVerificationMethodUpdateBody;
}

export const register = async (
  did: string,
  body: IVerificationMethodRegisterPayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "create verification method not implemented",
      "create verification method not implemented"
    )
  );
};

export const update = async (
  did: string,
  id: string,
  body: IVerificationMethodUpdatePayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "get verification method not implemented",
      "get verification method not implemented"
    )
  );
};

export const remove = async (did: string, id: string) => {
  return Promise.reject(
    new HttpException(
      500,
      "remove verification method not implemented",
      "remove verification method not implemented"
    )
  );
};
