import { DidDocument } from "../models";

export interface IDidDocumentPayload {
  title: string;
  content: string;
  userId: number;
}

export const resolve = async (): Promise<DidDocument> => {
  throw new Error("Method not implemented.");
};

export const register = async (
  payload: IDidDocumentPayload
): Promise<DidDocument> => {
  throw new Error("Method not implemented.");
};

export const remove = async (id: number): Promise<DidDocument | null> => {
  throw new Error("Method not implemented.");
};
