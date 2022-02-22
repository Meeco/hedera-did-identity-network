export type RelationshipTypeType =
  | "authentication"
  | "assertionMethod"
  | "keyAgreement"
  | "capabilityDelegation"
  | "capabilityInvocation";

export interface IVerificationRelationship {
  id: string;
  controller: string;
  type: "Ed25519VerificationKey2018";
  relationshipType: RelationshipTypeType;
  publicKeyMultibase: string;
}

export interface IVerificationRelationshipRegisterPayload {
  verificationRelationship: IVerificationRelationship;
}

export interface IVerificationRelationshipUpdateBody {
  controller: string;
  type: "Ed25519VerificationKey2018";
  publicKeyMultibase: string;
}

export interface IVerificationRelationshipUpdatePayload {
  verificationRelationship: IVerificationRelationshipUpdateBody;
}
