export type RelationshipTypeType =
  | "authentication"
  | "assertionMethod"
  | "keyAgreement"
  | "capabilityDelegation"
  | "capabilityInvocation";

export interface IVerificationRelationship {
  /**
   * Verification relationship ID. References a key in verification methods list.
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#key-1"
   */
  id: string;
  /**
   * @example "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   */
  controller: string;
  type: "Ed25519VerificationKey2018";
  relationshipType: RelationshipTypeType;
  /**
   * @example "z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5"
   */
  publicKeyMultibase: string;
}

export interface IVerificationRelationshipRegisterPayload {
  verificationRelationship: IVerificationRelationship;
}

export interface IVerificationRelationshipUpdateBody {
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

export interface IVerificationRelationshipUpdatePayload {
  verificationRelationship: IVerificationRelationshipUpdateBody;
}
