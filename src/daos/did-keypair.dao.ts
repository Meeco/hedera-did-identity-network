import { CreateDidKeypairDto } from "../dto/create.did-keypair.dto";
import { getMongoose } from "../services/connection.service";

class DidKeypairSchema {
  Schema = getMongoose().Schema;

  didKeypairSchema = new this.Schema(
    {
      _id: String,
      privateKey: String,
    },
    { _id: true, timestamps: true }
  );

  didKeypair = getMongoose().model("did_keypairs", this.didKeypairSchema);

  constructor() {
    console.log("Created new instance of DidKeypairSchema");
  }

  async createDidKeypair(didKeypairFields: CreateDidKeypairDto) {
    const didKeypair = new this.didKeypair({
      _id: didKeypairFields.did,
      privateKey: didKeypairFields.privateKey.toStringDer(),
    });
    await didKeypair.save();
    return didKeypair;
  }

  async deleteById(did: string) {
    return this.didKeypair.deleteOne({ _id: did });
  }

  async findById(did: string) {
    return this.didKeypair.findById(did);
  }
}

const DidKeypairModel = new DidKeypairSchema();

export { DidKeypairModel };
