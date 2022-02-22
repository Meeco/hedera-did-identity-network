import { Hashing, HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import {
  DidDocument,
  IVerificationRelationshipRegisterPayload,
  IVerificationRelationshipUpdatePayload,
  RelationshipTypeType,
} from "../models";
import { client } from "../services";
import { HcsMessageCollectorService } from "./hcs-message-collector.service";
import { ResolverService } from "./resolver.service";

/**
 * Register new verification relationship with an existing DID document
 * @returns Updated DID document information
 */
export const register = async (
  did: string,
  body: IVerificationRelationshipRegisterPayload
): Promise<DidDocument> => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  const decodedMultiBasePubKey = Hashing.multibase.decode(
    body.verificationRelationship.publicKeyMultibase
  );
  const publicKey = PublicKey.fromBytes(decodedMultiBasePubKey);

  await hcsDid.addVerificationRelationship({
    ...body.verificationRelationship,
    publicKey,
  });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Update existing verification relationship on an existing DID document
 * @returns Updated DID document information
 */
export const update = async (
  did: string,
  relationshipType: RelationshipTypeType,
  id: string,
  body: IVerificationRelationshipUpdatePayload
): Promise<DidDocument> => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  const decodedMultiBasePubKey = Hashing.multibase.decode(
    body.verificationRelationship.publicKeyMultibase
  );
  const publicKey = PublicKey.fromBytes(decodedMultiBasePubKey);

  await hcsDid.updateVerificationRelationship({
    ...body.verificationRelationship,
    relationshipType,
    publicKey,
    id,
  });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Revoke existing verification relationship from an existing DID document
 * @returns Updated DID document information
 */
export const revoke = async (
  did: string,
  relationshipType: RelationshipTypeType,
  id: string
) => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  await hcsDid.revokeVerificationRelationship({ id, relationshipType });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};
