import { HcsDidMessage, MessageEnvelope } from "@hashgraph/did-sdk-js";
import { CreateMessageDto } from "../dto/create.message.dto";
import { getMongoose } from "../services";

class MessageSchema {
  Schema = getMongoose().Schema;

  messageSchema = new this.Schema(
    {
      timestamp: Date,
      operation: String,
      did: { type: [String], index: true },
      event: String,
      signature: String,
    },
    { _id: true, timestamps: true }
  );

  message = getMongoose().model("messages", this.messageSchema);

  constructor() {
    console.log("Created new instance of MessageSchema");
  }

  async createMessage(messageFields: CreateMessageDto) {
    const message = new this.message({
      ...messageFields,
      timestamp: messageFields.timestamp.toDate(),
    });
    await message.save();
    return message;
  }

  async createMessages(messagesFields: CreateMessageDto[]) {
    const messages = messagesFields.map(
      (messageFields) =>
        new this.message({
          ...messageFields,
          timestamp: messageFields.timestamp.toDate(),
        })
    );

    return this.message.insertMany(messages);
  }

  async getMessagesByDID(did: string) {
    const result = await this.message
      .find({ did: did })
      .sort("timestamp")
      .exec();
    return result.map((message) => {
      return HcsDidMessage.fromJsonTree(message);
    });
  }

  async getLastMessageForDID(did: string) {
    const result = await this.message
      .findOne({ did: did })
      .sort({ timestamp: -1 })
      .exec();

    return result ? HcsDidMessage.fromJsonTree(result) : null;
  }

  messageToDto(envelope: MessageEnvelope<HcsDidMessage>): CreateMessageDto {
    const message = envelope.open();

    return {
      timestamp: envelope.getConsensusTimestamp(),
      operation: message.getOperation(),
      did: message.getDid(),
      event: message.getEventBase64(),
      signature: envelope.getSignature(),
    };
  }
}

const MessageModel = new MessageSchema();

export { MessageModel };
