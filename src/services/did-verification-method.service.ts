import { Hashing, HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import {
  DidDocument,
  IVerificationMethodRegisterPayload,
  IVerificationMethodUpdatePayload,
} from "../models";
import { client } from "../services";
import { HcsMessageCollectorService } from "./hcs-message-collector.service";
import { ResolverService } from "./resolver.service";

/**
 * Register new verification method with an existing DID document
 * @returns Updated DID document information
 */
export const register = async (
  did: string,
  body: IVerificationMethodRegisterPayload
): Promise<DidDocument> => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  if (!didKeypair || !didKeypair.privateKey) {
    throw new Error(`DID is not controller by the AppNet`);
  }
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  const decodedMultiBasePubKey = Hashing.multibase.decode(
    body.verificationMethod.publicKeyMultibase
  );
  const publicKey = PublicKey.fromBytes(decodedMultiBasePubKey);

  await hcsDid.addVerificationMethod({ ...body.verificationMethod, publicKey });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Update existing service information on an existing DID document
 * @returns Update DID document information
 */
export const update = async (
  did: string,
  id: string,
  body: IVerificationMethodUpdatePayload
): Promise<DidDocument> => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  if (!didKeypair || !didKeypair.privateKey) {
    throw new Error(`DID is not controller by the AppNet`);
  }
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  const decodedMultiBasePubKey = Hashing.multibase.decode(
    body.verificationMethod.publicKeyMultibase
  );
  const publicKey = PublicKey.fromBytes(decodedMultiBasePubKey);

  await hcsDid.updateVerificationMethod({
    ...body.verificationMethod,
    publicKey,
    id,
  });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Revoke existing service from an existing DID document
 * @returns Updated DID document information
 */
export const revoke = async (did: string, id: string) => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);
  if (!didKeypair || !didKeypair.privateKey) {
    throw new Error(`DID is not controller by the AppNet`);
  }
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  await hcsDid.revokeVerificationMethod({ id });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};
