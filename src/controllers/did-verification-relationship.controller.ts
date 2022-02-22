import { Body, Delete, Path, Post, Put, Route, Tags } from "tsoa";
import {
  DidDocument,
  IVerificationRelationshipRegisterPayload,
  IVerificationRelationshipUpdatePayload,
  RelationshipTypeType,
} from "../models";
import {
  registerVerificationRelationship,
  revokeVerificationRelationship,
  updateVerificationRelationship,
} from "../services";

@Route("did")
@Tags("Verification Relationship")
export default class DidVerificationRelationshipController {
  /**
   * Register a new verification relationship to the DID document
   * @summary Register a new verification relationship to the DID document
   * @param did Identifier as defined in DID specification
   * @param body Register verification relationship payload
   * @returns DidDocument
   */
  @Post("/{did}/verification-relationships")
  public async register(
    @Path() did: string,
    @Body() body: IVerificationRelationshipRegisterPayload
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
  @Put("/{did}/verification-relationships/{relationshipType}/{id}")
  public async update(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string,
    @Body() body: IVerificationRelationshipUpdatePayload
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
  @Delete("/{did}/verification-relationships/{relationshipType}/{id}")
  public async revoke(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeVerificationRelationship(did, relationshipType, id);
  }
}
