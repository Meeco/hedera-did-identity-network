export * from "./connection.service";
export {
  register as registerDid,
  resolve as resolveDid,
  revoke as revokeDid,
} from "./did-document.service";
export {
  claim as claimDidOwnership,
  register as registerDidWithAppNet,
} from "./did-ownership.service";
export {
  register as registerService,
  revoke as revokeService,
  update as updateService,
} from "./did-service.service";
export {
  register as registerVerificationMethod,
  revoke as revokeVerificationMethod,
  update as updateVerificationMethod,
} from "./did-verification-method.service";
export {
  register as registerVerificationRelationship,
  revoke as revokeVerificationRelationship,
  update as updateVerificationRelationship,
} from "./did-verification-relationship.service";
export * from "./hcs-message-collector.service";
export * from "./hedera-client";
export * from "./resolver.service";
export {
  register as registerVcStatus,
  resolveVcStatusList,
  revokeVcStatus,
  resumeVcStatus,
  suspendVcStatus,
  activeVcStatus as issueVcStatus,
} from "./vc-status-list.service";
