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
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
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
    return registerVerificationMethod(did, body);
  }

  /**
   * Update verification method on a DID document
   * @summary Update verification method on a DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
   * @param id A utf-8 encoded base64 Verification ID string <br /> <br />
   * Example: ZGlkOmhlZGVyYTp0ZXN0bmV0Ono2TWtmemExNlBxbnlNeXhQWmQ3ZFZoczZ5U1VldHRVUlR6dGpOSjhxQkt3eUhnNV8wLjAuMzA4MzU3MTkja2V5LTE=
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
      did,
      Buffer.from(id, "base64").toString(),
      body
    );
  }

  /**
   * Remove verification method from the DID document
   * @summary Remove verification method from the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
   * @param id A utf-8 encoded base64 Verification ID string <br /> <br />
   * Example: ZGlkOmhlZGVyYTp0ZXN0bmV0Ono2TWtmemExNlBxbnlNeXhQWmQ3ZFZoczZ5U1VldHRVUlR6dGpOSjhxQkt3eUhnNV8wLjAuMzA4MzU3MTkja2V5LTE=
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}/verification-methods/{id}")
  public async revoke(
    @Path() did: string,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeVerificationMethod(did, Buffer.from(id, "base64").toString());
  }
}
