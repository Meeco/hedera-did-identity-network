import { HcsDid } from "@hashgraph/did-sdk-js";
import { PrivateKey } from "@hashgraph/sdk";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import { MessageModel } from "../daos/message.dao";
import { DidDocument } from "../models";
import { Service } from "../models/service.interface";
import { client } from "../services/hedera-client";

export interface IServiceRegisterPayload {
  service: Service;
}

export interface IServiceUpdateBody {
  type: "LinkedDomains" | "DIDCommMessaging";
  serviceEndpoint: string;
}

export interface IServiceUpdatePayload {
  service: IServiceUpdateBody;
}

export const register = async (
  did: string,
  body: IServiceRegisterPayload
): Promise<DidDocument> => {
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
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

  await hcsDid.addService(body.service);

  const doc = await hcsDid.resolve();

  return doc.toJsonTree();
};

export const update = async (
  did: string,
  id: string,
  body: IServiceUpdatePayload
): Promise<DidDocument> => {
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
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

  await hcsDid.updateService({ ...body.service, id });

  const doc = await hcsDid.resolve();

  return doc.toJsonTree();
};

export const remove = async (did: string, id: string) => {
  const didKeypair = await DidKeypairModel.findById(did);
  const privateKey = PrivateKey.fromString(didKeypair.privateKey);

  const hcsDid = new HcsDid({
    identifier: did,
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

  await hcsDid.revokeService({ id });

  const doc = await hcsDid.resolve();

  return doc.toJsonTree();
};
