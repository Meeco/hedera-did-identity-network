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
  IVerificationRelationshipRegisterPayload,
  IVerificationRelationshipUpdatePayload,
  RelationshipTypeType,
  ValidateErrorJSON,
} from "../models";
import {
  registerVerificationRelationship,
  revokeVerificationRelationship,
  updateVerificationRelationship,
} from "../services";

@Route("did")
@Tags("Verification Relationship")
export class DidVerificationRelationshipController extends Controller {
  /**
   * Register a new verification relationship to the DID document
   * @summary Register a new verification relationship to the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param body Register verification relationship payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Post("/{did}/verification-relationships")
  public async register(
    @Path() did: string,
    @Body() body: IVerificationRelationshipRegisterPayload
  ): Promise<DidDocument> {
    return registerVerificationRelationship(decodeURIComponent(did), body);
  }

  /**
   * Update verification relationship on the DID document
   * @summary Update verification relationship on the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id A percent-escaped Service ID string <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231%23key-1
   * @param body Update verification relationship payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Put("/{did}/verification-relationships/{relationshipType}/{id}")
  public async update(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string,
    @Body() body: IVerificationRelationshipUpdatePayload
  ): Promise<DidDocument> {
    return updateVerificationRelationship(
      decodeURIComponent(did),
      relationshipType,
      decodeURIComponent(id),
      body
    );
  }

  /**
   * Remove verification relationship from the DID document
   * @summary Remove verification relationship from the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id A percent-escaped Service ID string <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231%23key-1
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Delete("/{did}/verification-relationships/{relationshipType}/{id}")
  public async revoke(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeVerificationRelationship(
      decodeURIComponent(did),
      relationshipType,
      decodeURIComponent(id)
    );
  }
}
