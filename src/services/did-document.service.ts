import { Hashing, HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import HttpException from "../common/http-exception";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import { MessageModel } from "../daos/message.dao";
import { DidDocument } from "../models";
import { client } from "../services/hedera-client";

export interface IDidDocumentRegisterPayload {
  publicKeyMultibase: "string";
}

export const resolve = async (did: string): Promise<DidDocument> => {
  return Promise.reject(
    new HttpException(
      500,
      "Resolve DID not impemented",
      "Resolve DID not impemented"
    )
  );
};

export const register = async (
  payload: IDidDocumentRegisterPayload
): Promise<DidDocument> => {
  const privateKey = PrivateKey.generate();

  const hcsDid = new HcsDid({
    privateKey: privateKey,
    client: client,
    onMessageConfirmed: (envelope) => {
      const message = envelope.open();

      // async
      MessageModel.createMessage({
        timestamp: envelope.getConsensusTimestamp(),
        operation: message.getOperation(),
        did: message.getDid(),
        event: message.getEventBase64(),
        signature: envelope.getSignature(),
      });
    },
  });

  await hcsDid.register();

  await DidKeypairModel.createDidKeypair({
    did: hcsDid.getIdentifier(),
    privateKey: privateKey,
  });

  await hcsDid.addVerificationRelationship({
    id: hcsDid.getIdentifier() + "#key-1",
    relationshipType: "authentication",
    controller: hcsDid.getIdentifier(),
    type: "Ed25519VerificationKey2018",
    publicKey: PublicKey.fromBytes(
      Hashing.multibase.decode(payload.publicKeyMultibase)
    ),
  });

  const doc = await hcsDid.resolve();

  return doc.toJsonTree();
};

export const remove = async (did: string): Promise<void> => {
  return Promise.reject(
    new HttpException(
      500,
      "Remove DID not imoplemented",
      "Remove DID not imoplemented"
    )
  );
};
