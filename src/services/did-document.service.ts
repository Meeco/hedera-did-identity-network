import HttpException from "../common/http-exception";
import { DidDocument } from "../models";

export interface IDidDocumentRegisterPayload {
  publicKeyMultibase: "string";
}

export const resolve = async (did: string): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "Resolve DID not impemented",
      "Resolve DID not impemented"
    )
  );
};

export const register = async (
  payload: IDidDocumentRegisterPayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "Register DID not implemented",
      "Register DID not implemented"
    )
  );
};

export const remove = async (did: string): Promise<void> => {
  return Promise.reject(
    new HttpException(
      500,
      "Remove DID not imoplemented",
      "Remove DID not imoplemented"
    )
  );
};
