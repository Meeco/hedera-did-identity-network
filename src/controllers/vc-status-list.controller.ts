import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Response,
  Route,
  Tags,
} from "tsoa";
import {
  RegisterVcStatusPayload,
  ValidateErrorJSON,
  VcStatusChangePayload,
  VcStatusListInfoResponse,
} from "../models";
import {
  issueVcStatus,
  registerVcStatus,
  resolveVcStatusList,
  resumeVcStatus,
  revokeVcStatus,
  suspendVcStatus,
} from "../services";

enum VCStatus {
  Active = "active",
  Resumed = "resumed",
  Suspended = "suspended",
  Revoked = "revoked",
}

@Route("vc")
@Tags("Verifiable Credential Status List")
export class VerifiableCredentialStatusListController extends Controller {
  /**
   * Register verifiable credential status
   * @summary Register verifiable credential status.
   * @param body
   * @returns Credential status list information
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post("/register")
  public async register(
    @Body() body: RegisterVcStatusPayload
  ): Promise<VcStatusListInfoResponse> {
    this.setStatus(201);
    return registerVcStatus(body).then((statusInfo) => ({
      statusInfo,
    }));
  }

  /**
   * Resolve verifiable credential that encapsulates the status list.
   * @summary Resolve verifiable credential status list.
   * @param statusListFileId
   * @returns Verifiable credential that encapsulates the status list
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Get("/status/{statusListFileId}")
  public async status(@Path() statusListFileId: string): Promise<any> {
    this.setStatus(200);
    return resolveVcStatusList(statusListFileId).then(
      (statusListVc) => statusListVc
    );
  }

  /**
   * Issue, Revoke, Suspend or Resume verifiable credential status
   * @summary Issue, Revoke, Suspend or Resume verifiable credential status.
   * @param statusListFileId
   * @param statusListIndex
   * @returns Issue, Revoke, Suspend or Resume verifiable credential status
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Put("/status/{statusListFileId}/{statusListIndex}")
  public async revoke(
    @Path() statusListFileId: string,
    @Path() statusListIndex: number,
    @Body() body: VcStatusChangePayload
  ): Promise<any> {
    this.setStatus(204);
    switch (body.status) {
      case VCStatus.Revoked:
        revokeVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Resumed:
        resumeVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Suspended:
        suspendVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Active:
        issueVcStatus(statusListFileId, statusListIndex);
        break;
      default:
        throw new Error(`Status not supported : ${body.status}`);
    }
  }
}
