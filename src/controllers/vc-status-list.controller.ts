import { Body, Controller, Get, Path, Post, Response, Route, Tags } from "tsoa";
import {
  RegisterVcStatusPayload,
  ValidateErrorJSON,
  VcStatusListInfoResponse,
} from "../models";
import { registerVcStatus, resolveVcStatusList } from "../services";

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
}
