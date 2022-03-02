import {
  Body,
  Controller,
  Delete,
  Path,
  Post,
  Put,
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
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @param body Register service payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
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
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @param id Service ID string
   * @example id "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#service-1"
   * @param body Update service payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Put("/{did}/services/{id}")
  public async update(
    @Path() did: string,
    @Path() id: string,
    @Body() body: IServiceUpdatePayload
  ): Promise<DidDocument> {
    console.log(`did: ${did} \n id: ${id} \n body: ${body}`);
    return updateService(did, id, body);
  }

  /**
   * Remove service information from the DID Document
   * @summary Remove service information from the DID Document
   * @param did Identifier as defined in DID specification
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @param id Service ID string
   * @example id "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719#service-1"
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}/services/{id}")
  public async revoke(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    console.log(`did: ${did} \n id: ${id}`);
    return revokeService(did, id);
  }
}
