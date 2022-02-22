import {
  Hashing,
  HcsDid,
  HcsDidMessage,
  DidDocument as DidSDKDidDocument,
} from "@hashgraph/did-sdk-js";
import { PrivateKey, PublicKey, Timestamp } from "@hashgraph/sdk";
import { DidDocument } from "src/models/did-document";
import HttpException from "../common/http-exception";
import { DidKeypairModel } from "../daos/did-keypair.dao";
import { MessageModel } from "../daos/message.dao";
import { client } from "../services/hedera-client";

export interface IDidDocumentRegisterPayload {
  publicKeyMultibase: "string";
}

export const resolve = async (did: string): Promise<DidDocument> => {
  try {
    console.log("resolving did: " + did);

    console.log(`read messages from DB`);
    const savedHcsDidMessages = await MessageModel.getMessagesByDID(did);
    const lastMessageArrivalTime =
      savedHcsDidMessages && savedHcsDidMessages.length > 0
        ? savedHcsDidMessages[savedHcsDidMessages.length - 1].getTimestamp()
        : null;

    // TODO: read remaining from mirror node based on timestamp
    const hcsDid = new HcsDid({ identifier: did, client: client });
    const newHcsMessages = await hcsDid.readMessages(
      lastMessageArrivalTime ? lastMessageArrivalTime : new Timestamp(0, 0)
    );

    let result: HcsDidMessage[] = [];

    if (
      savedHcsDidMessages &&
      savedHcsDidMessages.length > 0 &&
      newHcsMessages &&
      newHcsMessages.length > 0
    ) {
      result = savedHcsDidMessages.concat(newHcsMessages);
    } else if (
      !savedHcsDidMessages &&
      newHcsMessages &&
      newHcsMessages.length > 0
    ) {
      result = newHcsMessages;
    } else if (
      savedHcsDidMessages &&
      savedHcsDidMessages.length > 0 &&
      !newHcsMessages
    ) {
      result = savedHcsDidMessages;
    }

    //TODO: save new messages to DB
    //   newHcsMessages.forEach((msg) => {
    //     MessageModel.createMessage({
    //       timestamp: msg.getTimestamp(),
    //       operation: msg.getOperation(),
    //       did: msg.getDid(),
    //       event: msg.getEventBase64(),
    //       signature: msg.get,
    //     });
    // });

    //resolve doc
    const doc = new DidSDKDidDocument(did, result);
    return doc.toJsonTree();
  } catch (err: any) {
    console.log(err);
    return Promise.reject(new HttpException(500, err.message, err.message));
  }
};

export const register = async (
  payload: IDidDocumentRegisterPayload
): Promise<DidDocument> => {
  try {
    let messages: HcsDidMessage[] = [];
    console.log(
      `decode payload multibase public key ${payload.publicKeyMultibase}`
    );
    const decodedMultiBasePubKey = Hashing.multibase.decode(
      payload.publicKeyMultibase
    );
    const publicKey = PublicKey.fromBytes(decodedMultiBasePubKey);

    console.log(`generate private key`);
    const privateKey = PrivateKey.generate();

    console.log(`creating did`);
    const hcsDid = new HcsDid({
      privateKey: privateKey,
      client: client,
      onMessageConfirmed: (envelope) => {
        const message = envelope.open();
        messages.push(message);

        //NOTE: VS - should we be saving it to DB before adding authentication verification method ??
        // async :
        MessageModel.createMessage({
          timestamp: envelope.getConsensusTimestamp(),
          operation: message.getOperation(),
          did: message.getDid(),
          event: message.getEventBase64(),
          signature: envelope.getSignature(),
        });
      },
    });

    console.log(`register did`);
    await hcsDid.register();

    console.log(`create keypair`);
    await DidKeypairModel.createDidKeypair({
      did: hcsDid.getIdentifier(),
      privateKey: privateKey,
    });

    console.log(`add verification method`);
    await hcsDid.addVerificationRelationship({
      id: hcsDid.getIdentifier() + "#key-1",
      relationshipType: "authentication",
      controller: hcsDid.getIdentifier(),
      type: "Ed25519VerificationKey2018",
      publicKey: publicKey,
    });

    console.log(`read messages from DB`);
    const savedHcsDidMessages = await MessageModel.getMessagesByDID(
      hcsDid.getIdentifier()
    );

    const doc = new DidSDKDidDocument(
      hcsDid.getIdentifier(),
      savedHcsDidMessages
    );

    return doc.toJsonTree();
  } catch (err: any) {
    console.log(err);
    return Promise.reject(new HttpException(500, err.message, err.message));
  }
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
