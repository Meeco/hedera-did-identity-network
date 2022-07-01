import {
  Body,
  Controller,
  Path,
  Post,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import { DidDocument, ValidateErrorJSON } from "../models";
import {
  IDidOwnershipClaimPayload,
  IDidOwnershipRegisterPayload,
} from "../models/ownership-endpoint-payloads.interface";
import { claimDidOwnership, registerDidWithIdentityNetwork } from "../services";

@Route("did")
@Tags("DID - Ownership")
export class DidOwnershipController extends Controller {
  /**
   * Claim DID Document ownership back from the identity-network. Changes DID root key to the one provided via `privateKeyMultibase` parameter.
   * DID controller remains the same.
   * @summary Claim DID Document ownership back from the identity-network
   * @param did A DID Identifier as defined in DID specification
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Post("/{did}/claim")
  public async claim(
    @Path() did: string,
    @Body() body: IDidOwnershipClaimPayload
  ): Promise<DidDocument> {
    return claimDidOwnership(did, body);
  }

  /**
   * Register an existing DID Document with identity-network. Gives away control of the document to the identity-network component.
   * Previous DID root (`privateKeyMultibase` parameter) key becomes a delegate key. <br /><br />
   * <em>* Based on your use case you should consider securing this endpoint. Endpoint communicates to Hedera Consensus Services.</em>
   * @summary Register an existing DID Document with identity-network
   * @param did A DID Identifier as defined in DID specification
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post("/{did}/register")
  public async register(
    @Path() did: string,
    @Body() body: IDidOwnershipRegisterPayload
  ): Promise<DidDocument> {
    return registerDidWithIdentityNetwork(did, body);
  }
}
