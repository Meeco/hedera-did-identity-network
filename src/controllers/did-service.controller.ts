import { Body, Delete, Path, Post, Put, Route, Tags } from "tsoa";
import {
  DidDocument,
  IServiceRegisterPayload,
  IServiceUpdatePayload,
} from "../models";
import { registerService, revokeService, updateService } from "../services";

@Route("did")
@Tags("Service")
export default class DidServiceController {
  /**
   * Register a new service to the DID Document
   * @summary Register a new service to the DID Document
   * @param did Identifier as defined in DID specification
   * @param body Register service payload
   * @returns DidDocument
   */
  @Post("/{did}/services")
  public async register(
    @Path() did: string,
    @Body() body: IServiceRegisterPayload
  ): Promise<DidDocument> {
    return registerService(did, body);
  }

  /**
   * Update service information on the DID Document
   * @summary Update service information on the DID Document
   * @param did Identifier as defined in DID specification
   * @param id Service ID string
   * @param body Update service payload
   * @returns DidDocument
   */
  @Put("/{did}/services/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IServiceUpdatePayload
  ): Promise<DidDocument> {
    return updateService(did, id, body);
  }

  /**
   * Remove service information from the DID Document
   * @summary Remove service information from the DID Document
   * @param did Identifier as defined in DID specification
   * @param id Service ID string
   * @returns DidDocument
   */
  @Delete("/{did}/services/{id}")
  public async revoke(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeService(did, id);
  }
}
