import { HcsDidMessage, MessageEnvelope } from "@hashgraph/did-sdk-js";
import { HcsDidEvent } from "@hashgraph/did-sdk-js/dist/identity/hcs/did/event/hcs-did-event";
import { getMongoose } from "../db/connection.service";
import { CreateMessageDto } from "../dto/create.message.dto";

class MessageSchema {
  Schema = getMongoose().Schema;

  messageSchema = new this.Schema(
    {
      timestamp: Date,
      operation: String,
      did: String,
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

  async getMessagesByDID(did: string) {
    const result = await this.message.find({ did: did }).exec();
    const didMessages = result.map((message) => {
      return HcsDidMessage.fromJsonTree(message);
    });
    console.log(JSON.stringify(didMessages));
    return didMessages;
  }
}

const MessageModel = new MessageSchema();

export { MessageModel };
