import { FileId } from "@hashgraph/sdk";
import { getMongoose } from "../services";

const MAX_INDEX_SIZE = 20;

class VcStatusIndexControllerSchema {
  Schema = getMongoose().Schema;

  vcStatusIndexControllerSchema = new this.Schema(
    {
      fileId: {
        type: String,
        required: true,
      },
      fileIndex: {
        type: Number,
        required: true,
      },
      controllerDID: {
        type: String,
        required: true,
        index: true,
      },
    },
    { _id: true, timestamps: true }
  );

  vcStatusIndexController = getMongoose().model(
    "vc_status_index_controller",
    this.vcStatusIndexControllerSchema
  );

  constructor() {
    console.log("Created new instance of VcStatusIndexControllerSchema");
  }

  async createVcStatusIndexController(
    fileId: FileId,
    fileIndex: Number,
    controllerDID: string
  ) {
    const vcStatusIndexController = new this.vcStatusIndexController({
      fileId,
      fileIndex,
      controllerDID,
    });
    await vcStatusIndexController.save();
    return vcStatusIndexController;
  }
}

const VcStatusIndexControllerModel = new VcStatusIndexControllerSchema();

export { VcStatusIndexControllerModel };
