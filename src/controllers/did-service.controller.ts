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
  IServiceRegisterPayload,
  IServiceUpdatePayload,
  ValidateErrorJSON,
} from "../models";
import { registerService, revokeService, updateService } from "../services";

@Route("did")
@Tags("Service")
export class DidServiceController extends Controller {
  /**
   * Register a new service to the DID Document
   * @summary Register a new service to the DID Document
   * @param did Identifier as defined in DID specification
   * @param body Register service payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security("SignedRequestHeader")
  @Post("/{did}/services")
  public async register(
    @Path() did: string,
    @Body() body: IServiceRegisterPayload,
    @Request() request: any
  ): Promise<DidDocument> {
    return registerService(did, request.body);
  }

  /**
   * Update service information on the DID Document
   * @summary Update service information on the DID Document
   * @param did Identifier as defined in DID specification
   * @param id Service ID string
   * @param body Update service payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security("SignedRequestHeader")
  @Put("/{did}/services/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IServiceUpdatePayload,
    @Request() request: any
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
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security("SignedRequestHeader")
  @Delete("/{did}/services/{id}")
  public async revoke(
    @Path() did: string,
    @Path() id: string,
    @Request() request: any
  ): Promise<DidDocument> {
    return revokeService(did, id);
  }
}
