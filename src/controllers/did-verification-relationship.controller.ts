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
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
   * @param body Register verification relationship payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @SuccessResponse(201, "Created")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
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
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id A utf-8 encoded base64 Verification ID string <br /> <br />
   * Example: ZGlkOmhlZGVyYTp0ZXN0bmV0Ono2TWtmemExNlBxbnlNeXhQWmQ3ZFZoczZ5U1VldHRVUlR6dGpOSjhxQkt3eUhnNV8wLjAuMzA4MzU3MTkja2V5LTE=
   * @param body Update verification relationship payload
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Put("/{did}/verification-relationships/{relationshipType}/{id}")
  public async update(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string,
    @Body() body: IVerificationRelationshipUpdatePayload
  ): Promise<DidDocument> {
    return updateVerificationRelationship(
      did,
      relationshipType,
      Buffer.from(id, "base64").toString(),
      body
    );
  }

  /**
   * Remove verification relationship from the DID document
   * @summary Remove verification relationship from the DID document
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719
   * @param relationshipType String to specify which relationship type key belongs to
   * @param id A utf-8 encoded base64 Verification ID string <br /> <br />
   * Example: ZGlkOmhlZGVyYTp0ZXN0bmV0Ono2TWtmemExNlBxbnlNeXhQWmQ3ZFZoczZ5U1VldHRVUlR6dGpOSjhxQkt3eUhnNV8wLjAuMzA4MzU3MTkja2V5LTE=
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}/verification-relationships/{relationshipType}/{id}")
  public async revoke(
    @Path() did: string,
    @Path() relationshipType: RelationshipTypeType,
    @Path() id: string
  ): Promise<DidDocument> {
    return revokeVerificationRelationship(
      did,
      relationshipType,
      Buffer.from(id, "base64").toString()
    );
  }
}
