import HttpException from "../common/http-exception";
import { DidDocument } from "../models/did-document";

export interface IVerificationRelationship {
  id: string;
  controller: string;
  type: string;
  relationshipType: string;
  publicKeyMultibase: string;
}

export interface IVerificationRelationshipRegisterPayload {
  verificationRelationship: IVerificationRelationship;
}

export interface IVerificationRelationshipUpdateBody {
  controller: string;
  type: string;
  relationshipType: string;
  publicKeyMultibase: string;
}

export interface IVerificationRelationshipUpdatePayload {
  verificationRelationship: IVerificationRelationshipUpdateBody;
}

export const register = async (
  did: string,
  body: IVerificationRelationshipRegisterPayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "create verification relationship not implemented",
      "create verification relationship not implemented"
    )
  );
};

export const update = async (
  did: string,
  id: string,
  body: IVerificationRelationshipUpdatePayload
): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "get verification relationship not implemented",
      "get verification relationship not implemented"
    )
  );
};

export const remove = async (did: string, id: string) => {
  return Promise.reject(
    new HttpException(
      500,
      "remove verification relationship not implemented",
      "remove verification relationship not implemented"
    )
  );
};
