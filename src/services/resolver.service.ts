import {
  DidDocument,
  HcsDid,
  HcsDidEventMessageResolver,
  HcsDidMessage,
  MessageEnvelope,
} from "@hashgraph/did-sdk-js";
import { Timestamp } from "@hashgraph/sdk";
import { MessageModel } from "../daos/message.dao";
import { client } from "./hedera-client";

export class ResolverService {
  private did: HcsDid;

  constructor(did: string) {
    this.did = new HcsDid({ identifier: did, client });
  }

  public async resolve() {
    const lastMessage = await MessageModel.getLastMessageForDID(
      this.did.getIdentifier()
    );

    const readNewMessagesStartingAt = lastMessage
      ? lastMessage.getTimestamp().plusNanos(1000000) // 1ms
      : new Timestamp(0, 0);

    const newMessages = await this.loadHcsMessages(readNewMessagesStartingAt);
    await this.writeMessagesToDB(newMessages);

    return this.resolveFromDB();
  }

  public async resolveFromDB() {
    const messages = await MessageModel.getMessagesByDID(
      this.did.getIdentifier()
    );
    return new DidDocument(this.did.getIdentifier(), messages).toJsonTree();
  }

  private async loadHcsMessages(
    startAt: Timestamp
  ): Promise<MessageEnvelope<HcsDidMessage>[]> {
    return new Promise((resolve, reject) => {
      new HcsDidEventMessageResolver(this.did.getTopicId(), startAt)
        .setTimeout(HcsDid.READ_TOPIC_MESSAGES_TIMEOUT)
        .whenFinished(resolve)
        .onError(reject)
        .execute(client);
    });
  }

  private async writeMessagesToDB(messages: MessageEnvelope<HcsDidMessage>[]) {
    return MessageModel.createMessages(messages.map(MessageModel.messageToDto));
  }
}
