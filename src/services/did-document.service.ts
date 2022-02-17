import { DidDocument } from "../models";

export interface IDidDocumentRegisterPayload {
  publicKeyMultibase: "string";
}

export const resolve = async (did: string): Promise<DidDocument> => {
  return Promise.reject(new Error("Method not implemented."));
};

export const register = async (
  payload: IDidDocumentRegisterPayload
): Promise<DidDocument> => {
  return Promise.reject(new Error("Method not implemented."));
};

export const remove = async (did: string): Promise<DidDocument | null> => {
  return Promise.reject(new Error("Method not implemented."));
};
