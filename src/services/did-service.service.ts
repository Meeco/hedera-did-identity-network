import { HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey } from "@hashgraph/sdk";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import {
  DidDocument,
  IServiceRegisterPayload,
  IServiceUpdatePayload,
} from "../models";
import { client } from "../services";
import { HcsMessageCollectorService } from "./hcs-message-collector.service";
import { ResolverService } from "./resolver.service";

/**
 * Register new service with an existing DID document
 * @returns Updated DID document information
 */
export const register = async (
  did: string,
  body: IServiceRegisterPayload
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

  await hcsDid.addService(body.service);
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Update existing service on an existing DID document
 * @returns Updated DID document information
 */
export const update = async (
  did: string,
  id: string,
  body: IServiceUpdatePayload
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

  await hcsDid.updateService({ ...body.service, id });
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
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  await hcsDid.revokeService({ id });
  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};
