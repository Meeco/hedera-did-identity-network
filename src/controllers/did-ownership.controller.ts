import {
  Body,
  Controller,
  Path,
  Post,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { DidDocument, ValidateErrorJSON } from "../models";
import {
  IDidOwnershipClaimPayload,
  IDidOwnershipRegisterPayload,
} from "../models/ownership-endpoint-payloads.interface";
import { claimDidOwnership, registerDidWithAppNet } from "../services";

@Route("did")
@Tags("Ownership")
export class DidOwnershipController extends Controller {
  /**
   * Claim DID Document ownership back from the AppNet. Changes DID root key to the one provided via parameters. DID controller remains the same.
   * @summary Claim DID Document ownership back from the AppNet
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Post("/{did}/claim")
  public async claim(
    @Path() did: string,
    @Body() body: IDidOwnershipClaimPayload
  ): Promise<DidDocument> {
    return claimDidOwnership(decodeURIComponent(did), body);
  }

  /**
   * Register an existing DID Document with AppNet. Gives away control of the document to the AppNet component.
   * @summary Register an existing DID Document with AppNet
   * @param did A percent-escaped DID Identifier as defined in DID specification<br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @returns void
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post("/{did}/register")
  public async register(
    @Path() did: string,
    @Body() body: IDidOwnershipRegisterPayload
  ): Promise<DidDocument> {
    return registerDidWithAppNet(decodeURIComponent(did), body);
  }
}
