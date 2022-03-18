import { FileId, PrivateKey } from "@hashgraph/sdk";
import { HfsVcSl } from "@hashgraph/vc-sl-sdk-js";
import { VcStatusIndexControllerModel } from "../daos/vc-status-index-controller.dao";
import { VcStatusFileModel } from "../daos/vc-status-file.dao";
import { RegisterVcStatusPayload, VcStatusListInfo } from "../models";
import { client } from "./hedera-client";
import { VC } from "../utils/vc";

const { FILE_KEY, HOST, ISSUER_KEY, ISSUER_DID } = process.env;
const FILE_KEY_PK = PrivateKey.fromString(FILE_KEY || "");
const ISSUER_KEY_PK = PrivateKey.fromString(ISSUER_KEY || "");

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
    const vcSl = new HfsVcSl(client, FILE_KEY_PK);
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

export const resolveVcStatusList = async (
  statusListFileId: string
): Promise<any> => {
  const verifiableCredential = new VC(ISSUER_DID || "", ISSUER_KEY_PK);

  const vcSl = new HfsVcSl(client, FILE_KEY_PK);
  const statusList = await vcSl.loadRevocationList(
    FileId.fromString(statusListFileId)
  );
  const encodedVcStatusList = await statusList.encode();

  const vcStatusList = await verifiableCredential.issue({
    id: `https://${HOST}/vc/status/${statusListFileId}`,
    contexts: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc-status-list-2021/v1",
    ],
    expiration: new Date(),
    type: ["VerifiableCredential", "StatusList2021Credential"],
    credentialSubject: {
      id: `https://${HOST}/vc/status/${statusListFileId}#list`,
      type: "RevocationList2021",
      encodedList: encodedVcStatusList,
    },
  });

  return vcStatusList;
};

export const revokeVcStatus = async (
  statusListFileId: string,
  statusListIndex: number
): Promise<void> => {
  const vcSl = new HfsVcSl(client, FILE_KEY_PK);
  vcSl.revokeByIndex(FileId.fromString(statusListFileId), statusListIndex);
};

export const suspendVcStatus = async (
  statusListFileId: string,
  statusListIndex: number
): Promise<void> => {
  const vcSl = new HfsVcSl(client, FILE_KEY_PK);
  vcSl.suspendByIndex(FileId.fromString(statusListFileId), statusListIndex);
};

export const resumeVcStatus = async (
  statusListFileId: string,
  statusListIndex: number
): Promise<void> => {
  const vcSl = new HfsVcSl(client, FILE_KEY_PK);
  vcSl.resumeByIndex(FileId.fromString(statusListFileId), statusListIndex);
};

export const activeVcStatus = async (
  statusListFileId: string,
  statusListIndex: number
): Promise<void> => {
  const vcSl = new HfsVcSl(client, FILE_KEY_PK);
  vcSl.issueByIndex(FileId.fromString(statusListFileId), statusListIndex);
};

export const getVcStatusIndexControllerByFileIdAndIndex = async (
  statusListFileId: string,
  statusListIndex: Number
) => {
  return await VcStatusIndexControllerModel.getVcStatusIndexControllerByFileIdAndIndex(
    statusListFileId,
    statusListIndex
  );
};
