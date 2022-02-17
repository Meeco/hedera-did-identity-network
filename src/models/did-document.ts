import { Service } from "./service.interface";
import { VerificationMethod } from "./verification-method.interface";

export class DidDocument {
  "@context": string[];
  controller?: string;
  verificationMethod!: VerificationMethod[];
  authentication!: string[];
  assertionMethod!: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: Service[];
  id!: string;
}
