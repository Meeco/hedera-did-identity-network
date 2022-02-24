import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Request,
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
   * Register a new DID document. User provides public key that is going to be added as a delegate key that allows user to modify created DID document later.
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
   * Resolve DID Document
   * @summary Resolve DID Document
   * @param did Identifier as defined in DID specification
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Get("/{did}")
  public async resolve(@Path() did: string): Promise<DidDocument> {
    return resolveDid(did);
  }

  /**
   * Permanently remove DID Document from Appnet registry. In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did DID Identifier as defined in DID specification
   * @returns void
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [] })
  @Delete("/{did}")
  public async revoke(
    @Path() did: string,
    @Request() request: any
  ): Promise<void> {
    this.setStatus(204);
    return revokeDid(did);
  }
}
