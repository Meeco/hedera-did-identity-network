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
   * @param did Identifier as defined in DID specification
   * @param body Register verification relationship payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Post("/{did}/verification-relationships")
  public async register(
    @Path() did: string,
    @Body() body: IVerificationRelationshipRegisterPayload,
    @Request() request: any
  ): Promise<DidDocument> {
    return registerVerificationRelationship(did, body);
  }

  /**
   * Update verification relationship on the DID document
   * @summary Update verification relationship on the DID document
   * @param did Identifier as defined in DID specification
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id Verification relationship ID string
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
    @Body() body: IVerificationRelationshipUpdatePayload,
    @Request() request: any
  ): Promise<DidDocument> {
    return updateVerificationRelationship(did, relationshipType, id, body);
  }

  /**
   * Remove verification relationship from the DID document
   * @summary Remove verification relationship from the DID document
   * @param did Identifier as defined in DID specification
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id Verification relationship ID string
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Delete("/{did}/verification-relationships/{relationshipType}/{id}")
  public async revoke(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string,
    @Request() request: any
  ): Promise<DidDocument> {
    return revokeVerificationRelationship(did, relationshipType, id);
  }
}
