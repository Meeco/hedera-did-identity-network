import { Body, Delete, Path, Post, Put, Route, Tags } from "tsoa";
import { DidDocument } from "../models";
import {
  IVerificationRelationshipRegisterPayload,
  IVerificationRelationshipUpdatePayload,
  register,
  remove,
  update,
} from "../services/did-verification-relationship.service";

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
    return register(did, body);
  }

  /**
   * Update verification relationship on the DID document
   * @summary Update verification relationship on the DID document
   * @param did Identifier as defined in DID specification
   * @param id Verification relationship ID string
   * @param body Update verification relationship payload
   * @returns DidDocument
   */
  @Put("/{did}/verification-relationships/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IVerificationRelationshipUpdatePayload
  ): Promise<DidDocument> {
    return update(did, id, body);
  }

  /**
   * Remove verification relationship from the DID document
   * @summary Remove verification relationship from the DID document
   * @param did Identifier as defined in DID specification
   * @param id Verification relationship ID string
   * @returns DidDocument
   */
  @Delete("/{did}/verification-relationships/{id}")
  public async remove(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    return remove(did, id);
  }
}
