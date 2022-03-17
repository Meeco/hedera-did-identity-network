import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import {
  DidDocument,
  IDidDocumentRegisterPayload,
  ValidateErrorJSON,
} from "../models";
import { registerDid, resolveDid, revokeDid } from "../services";

@Route("did")
@Tags("Document")
export class DidDocumentController extends Controller {
  /**
   * Register a new DID document. User provides public key that is going to be added as a delegate key.
   * That allows user to modify created DID document later. <br /><br />
   * <em>* Based on your use case you should consider securing this endpoint. Endpoint communicates to Hedera Consensus Services.</em>
   * @summary Register a new DID Document.
   * @param body
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post("/")
  public async register(
    @Body() body: IDidDocumentRegisterPayload
  ): Promise<DidDocument> {
    this.setStatus(201);
    return registerDid(body);
  }

  /**
   * Resolve DID Document <br /><br />
   * <em>* Based on your use case you might consider securing this endpoint. Endpoint communicates to mirror nodes to resolve DID documents.</em>
   * @summary Resolve DID Document
   * @param did A DID Identifier as defined in DID specification
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Get("/{did}")
  public async resolve(@Path() did: string): Promise<DidDocument> {
    return resolveDid(did);
  }

  /**
   * Permanently remove DID Document from Appnet registry.
   * In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did DID Identifier as defined in DID specification
   * @example did "did:hedera:testnet:z6Mkfza16PqnyMyxPZd7dVhs6ySUettURTztjNJ8qBKwyHg5_0.0.30835719"
   * @returns void
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}")
  public async revoke(@Path() did: string): Promise<void> {
    this.setStatus(204);
    return revokeDid(did);
  }
}
