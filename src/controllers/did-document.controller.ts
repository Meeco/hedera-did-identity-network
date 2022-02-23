import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Route,
  Tags,
  Response,
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
  @Post("/")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  public async register(
    @Body() body: IDidDocumentRegisterPayload
  ): Promise<DidDocument> {
    this.setStatus(200);
    return registerDid(body);
  }

  /**
   * Resolve DID Document
   * @summary Resolve DID Document
   * @param did Identifier as defined in DID specification
   * @returns DidDocument
   */
  @Get("/{did}")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  public async resolve(@Path() did: string): Promise<DidDocument> {
    return resolveDid(did);
  }

  /**
   * Permanently remove DID Document from Appnet registry. In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did DID Identifier as defined in DID specification
   * @returns void
   */
  @Delete("/{did}")
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  public async revoke(@Path() did: string): Promise<void> {
    this.setStatus(204);
    return revokeDid(did);
  }
}
