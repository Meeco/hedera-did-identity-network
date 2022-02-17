import { DidDocument } from "../models";

export interface IDidDocumentRegisterPayload {
  publicKeyMultibase: "string";
}

export const resolve = async (did: string): Promise<DidDocument> => {
  throw new Error("Method not implemented.");
};

export const register = async (
  payload: IDidDocumentRegisterPayload
): Promise<DidDocument> => {
  throw new Error("Method not implemented.");
};

export const remove = async (did: string): Promise<DidDocument | null> => {
  throw new Error("Method not implemented.");
};
