import { Body, Controller, Post, Response, Route, Tags } from "tsoa";
import {
  RegisterVcStatusPayload,
  ValidateErrorJSON,
  VcStatusListInfoResponse,
} from "../models";
import { registerVcStatus } from "../services";

@Route("vc")
@Tags("Verifiable Credential Status List")
export class VerifiableCredentialiStatusListController extends Controller {
  /**
   * Register verifiable cerdential status
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
}
