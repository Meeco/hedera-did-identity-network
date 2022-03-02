import {
  Body,
  Controller,
  Delete,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
import {
  DidDocument,
  IVerificationMethodRegisterPayload,
  IVerificationMethodUpdatePayload,
  ValidateErrorJSON,
} from "../models";
import {
  registerVerificationMethod,
  revokeVerificationMethod,
  updateVerificationMethod,
} from "../services";

@Route("did")
@Tags("Verification Method")
export class DidVerificationMethodController extends Controller {
  /**
   * Register a new verification method to the DID document
   * @summary Register a new verification method to the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param body Register verification method payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Post("/{did}/verification-methods")
  public async register(
    @Path() did: string,
    @Body() body: IVerificationMethodRegisterPayload
  ): Promise<DidDocument> {
    return registerVerificationMethod(decodeURIComponent(did), body);
  }

  /**
   * Update verification method on a DID document
   * @summary Update verification method on a DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param id A percent-escaped Service ID string <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231%23key-1
   * @param body Update verification method payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Put("/{did}/verification-methods/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IVerificationMethodUpdatePayload
  ): Promise<DidDocument> {
    return updateVerificationMethod(
      decodeURIComponent(did),
      decodeURIComponent(id),
      body
    );
  }

  /**
   * Remove verification method from the DID document
   * @summary Remove verification method from the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param id A percent-escaped Service ID string <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231%23key-1
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}/verification-methods/{id}")
  public async revoke(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeVerificationMethod(
      decodeURIComponent(did),
      decodeURIComponent(id)
    );
  }
}
