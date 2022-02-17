import { Body, Delete, Path, Post, Put, Route, Tags } from "tsoa";
import { DidDocument } from "../models";
import {
  IVerificationMethodRegisterPayload,
  IVerificationMethodUpdatePayload,
  register,
  remove,
  update,
} from "../services/did-verification-method.service";

@Route("did")
@Tags("Verification Method")
export default class DidVerificationMethodController {
  /**
   * Register a new verification method to the DID document
   * @summary Register a new verification method to the DID document
   * @param did Identifier as defined in DID specification
   * @param body Register verification method payload
   * @returns DidDocument
   */
  @Post("/{did}/verification-methods")
  public async register(
    @Path() did: string,
    @Body() body: IVerificationMethodRegisterPayload
  ): Promise<DidDocument> {
    return register(did, body);
  }

  /**
   * Update verification method on a DID document
   * @summary Update verification method on a DID document
   * @param did Identifier as defined in DID specification
   * @param id Verification method ID string
   * @param body Update verification method payload
   * @returns DidDocument
   */
  @Put("/{did}/verification-methods/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IVerificationMethodUpdatePayload
  ): Promise<DidDocument> {
    return update(did, id, body);
  }

  /**
   * Remove verification method from the DID document
   * @summary Remove verification method from the DID document
   * @param did Identifier as defined in DID specification
   * @param id Verification method ID string
   * @returns DidDocument
   */
  @Delete("/{did}/verification-methods/{id}")
  public async remove(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    return remove(did, id);
  }
}
