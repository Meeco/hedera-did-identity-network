import { HcsDidMessage, MessageEnvelope } from "@hashgraph/did-sdk-js";
import { MessageModel } from "../daos/message.dao";

export class HcsMessageCollectorService {
  private envelopes: MessageEnvelope<HcsDidMessage>[] = [];

  public getEnvelopes() {
    return this.envelopes;
  }

  public listener = (envelope: MessageEnvelope<HcsDidMessage>): void => {
    this.envelopes.push(envelope);
  };

  public async writeToDB() {
    if (!this.envelopes.length) {
      return [];
    }

    return MessageModel.createMessages(
      this.envelopes.map(MessageModel.messageToDto)
    );
  }
}
