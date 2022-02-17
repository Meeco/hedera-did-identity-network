import { Body, Delete, Get, Path, Post, Route, Tags } from "tsoa";
import { DidDocument } from "../models";
import {
  IDidDocumentRegisterPayload,
  register,
  remove,
  resolve,
} from "../services/did-document.service";

@Route("did")
@Tags("Document")
export default class DidDocumentController {
  /**
   * Register a new DID document. User provides public key that is going to be added as a delegate key that allows user to modify created DID document later.
   * @summary Register a new DID Document.
   * @param body
   * @returns DidDocument
   */
  @Post("/")
  public async register(
    @Body() body: IDidDocumentRegisterPayload
  ): Promise<DidDocument> {
    return register(body);
  }

  /**
   * Resolve DID Document
   * @summary Resolve DID Document
   * @param did Identifier as defined in DID specification
   * @returns DidDocument
   */
  @Get("/{did}")
  public async resolve(@Path() did: string): Promise<DidDocument> {
    return resolve(did);
  }

  /**
   * Permanently remove DID Document from Appnet registry. In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did DID Identifier as defined in DID specification
   * @returns void
   */
  @Delete("/{did}")
  public async remove(@Path() did: string): Promise<void> {
    return remove(did);
  }
}
