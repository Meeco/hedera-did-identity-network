import { Hashing, HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey } from "@hashgraph/sdk";
import { ResolverService } from ".";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import {
  IDidOwnershipClaimPayload,
  IDidOwnershipRegisterPayload,
} from "../models/ownership-endpoint-payloads.interface";
import { HcsMessageCollectorService } from "./hcs-message-collector.service";
import { client } from "./hedera-client";

/**
 * Changes DID root key to the one passed via parameters. identity-network loses ownership of the document.
 * @returns Update DID document information
 */
export const claim = async (did: string, body: IDidOwnershipClaimPayload) => {
  const hcsMessages = new HcsMessageCollectorService();
  const didKeypair = await DidKeypairModel.findById(did);

  if (!didKeypair) {
    throw new Error("DID is not controller by the identity-network");
  }

  const privateKey = PrivateKey.fromString(didKeypair.privateKey!);

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  const decodedNewMultiBasePrivKey = Hashing.multibase.decode(
    body.privateKeyMultibase
  );
  const newPrivateKey = PrivateKey.fromBytes(decodedNewMultiBasePrivKey);

  await hcsDid.changeOwner({
    controller: hcsDid.getIdentifier(),
    newPrivateKey: newPrivateKey,
  });
  await hcsMessages.writeToDB();
  await DidKeypairModel.deleteById(hcsDid.getIdentifier());

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};

/**
 * Makes identity-network an owner of the did document. Public key of an old root keypair is later added as a delegate to the document.
 * @returns Update DID document information
 */
export const register = async (
  did: string,
  body: IDidOwnershipRegisterPayload
) => {
  const existingDidKeypair = await DidKeypairModel.findById(did);

  if (existingDidKeypair) {
    throw new Error("DID is already registered with identity-network");
  }

  const hcsMessages = new HcsMessageCollectorService();
  const newPrivateKey = PrivateKey.generate();

  const decodedMultiBasePrivKey = Hashing.multibase.decode(
    body.privateKeyMultibase
  );
  const oldPrivateKey = PrivateKey.fromBytes(decodedMultiBasePrivKey);

  const didDocument = await new ResolverService(did).resolve();
  const keyIds = didDocument?.verificationMethod.map((verMethod: any) => {
    const [_identifier, keyId] = verMethod.id.split("#");

    if (keyId) {
      const [_str, keyNr] = keyId.split("-");
      return parseInt(keyNr) || null;
    }
    return null;
  });
  const newDelegateKeyId = (Math.max(...keyIds) || 0) + 1;

  const hcsDid = new HcsDid({
    identifier: did,
    privateKey: oldPrivateKey,
    client: client,
    onMessageConfirmed: hcsMessages.listener,
  });

  await hcsDid.changeOwner({
    controller: hcsDid.getIdentifier(),
    newPrivateKey: newPrivateKey,
  });

  await DidKeypairModel.createDidKeypair({
    did: hcsDid.getIdentifier(),
    privateKey: newPrivateKey,
  });

  await hcsDid.addVerificationRelationship({
    id: hcsDid.getIdentifier() + `#key-${newDelegateKeyId}`,
    relationshipType: "authentication",
    controller: hcsDid.getIdentifier(),
    type: "Ed25519VerificationKey2018",
    publicKey: oldPrivateKey.publicKey,
  });

  await hcsMessages.writeToDB();

  return new ResolverService(hcsDid.getIdentifier()).resolve();
};
