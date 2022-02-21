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

  async getMessages(limit = 25, page = 0) {
    return this.message
      .find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
}

const MessageModel = new MessageSchema();

export { MessageModel };
