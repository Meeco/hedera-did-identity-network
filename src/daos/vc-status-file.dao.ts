import { FileId } from "@hashgraph/sdk";
import { getMongoose } from "../services";

const MAX_INDEX_SIZE = 20;

class VcStatusFileSchema {
  Schema = getMongoose().Schema;

  vcStatusFileSchema = new this.Schema(
    {
      _id: String,
      lastIndexInUse: {
        type: Number,
        default: 0,
      },
    },
    { _id: true, timestamps: true }
  );

  vcStatusFile = getMongoose().model(
    "vc_status_files",
    this.vcStatusFileSchema
  );

  constructor() {
    console.log("Created new instance of VcStatusFileSchema");
  }

  async createVcStatusFile(id: FileId) {
    const vcStatusFile = new this.vcStatusFile({
      _id: id.toString(),
    });
    await vcStatusFile.save();
    return vcStatusFile;
  }

  async getCurrent() {
    return this.vcStatusFile.findOne({
      lastIndexInUse: { $lt: MAX_INDEX_SIZE },
    });
  }

  async increaseIndex(id: FileId) {
    return this.vcStatusFile.findOneAndUpdate(
      { _id: id.toString() },
      { $inc: { lastIndexInUse: 2 } }
    );
  }
}

const VcStatusFileModel = new VcStatusFileSchema();

export { VcStatusFileModel };
