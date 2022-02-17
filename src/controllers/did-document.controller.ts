import { Get, Route, Tags, Post, Body, Path, Delete } from "tsoa";
import { DidDocument } from "../models";
import {
  register,
  resolve,
  IDidDocumentRegisterPayload,
  remove,
} from "../services/did-document.service";

@Route("did")
@Tags("Document")
export default class DidDocumentController {
  /**
   *
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
   * @param did
   * @returns DidDocument
   */
  @Get("/{did}")
  public async resolve(
    /**
     * DID Identifier as defined in DID specification
     */
    @Path() did: string
  ): Promise<DidDocument> {
    return resolve(did);
  }

  /**
   * Permanently remove DID Document from Appnet registry. In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did
   * @returns DidDocument | null
   */
  @Delete("/{did}")
  public async remove(
    /**
     * DID Identifier as defined in DID specification
     */
    @Path() did: string
  ): Promise<DidDocument | null> {
    return remove(did);
  }
}
