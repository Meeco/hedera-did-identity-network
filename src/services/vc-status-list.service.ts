import { FileId, PrivateKey } from "@hashgraph/sdk";
import { HfsVcSl } from "@hashgraph/vc-sl-sdk-js";
import { VcStatusIndexControllerModel } from "../daos/vc-status-index-controller.dao";
import { VcStatusFileModel } from "../daos/vc-status-file.dao";
import { RegisterVcStatusPayload, VcStatusListInfo } from "../models";
import { client } from "./hedera-client";

/**
 * TODO: goes to env vars I assume
 */
const HOST = "localhost:8000";
const FILE_KEY = PrivateKey.fromString(
  "302e020100300506032b6570042204204c657138981d342db74776ffd80cf724eb6a04a8c98a5738f0414472ec104f82"
);

export const register = async (
  body: RegisterVcStatusPayload
): Promise<VcStatusListInfo> => {
  const { fileId, statusListIndex } = await getNewVcStatusIndex(body.issuerDID);

  return Promise.resolve({
    id: `https://${HOST}/vc/status/${fileId}/${statusListIndex}`,
    type: "RevocationList2021Status",
    statusListIndex: statusListIndex,
    statusListCredential: `https://${HOST}/vc/status/${fileId}`,
  });
};

export const getNewVcStatusIndex = async (controllerDID: string) => {
  let statusFile = await VcStatusFileModel.getCurrent();

  if (!statusFile) {
    const vcSl = new HfsVcSl(client, FILE_KEY);
    const fileId = await vcSl.createRevocationListFile();
    statusFile = await VcStatusFileModel.createVcStatusFile(fileId);
  }

  statusFile = await VcStatusFileModel.increaseIndex(
    FileId.fromString(statusFile._id)
  );

  VcStatusIndexControllerModel.createVcStatusIndexController(
    statusFile._id,
    statusFile.lastIndexInUse,
    controllerDID
  );

  {
    return {
      fileId: statusFile._id,
      statusListIndex: statusFile.lastIndexInUse,
    };
  }
};
