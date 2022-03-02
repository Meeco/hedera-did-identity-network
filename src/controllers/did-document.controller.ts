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
   * @param did A percent-escaped DID Identifier as defined in DID specification <br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @returns DidDocument
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Get("/{did}")
  public async resolve(@Path() did: string): Promise<DidDocument> {
    return resolveDid(decodeURIComponent(did));
  }

  /**
   * Permanently remove DID Document from Appnet registry. In addition to that, new messages will be written to the DID topic stating that document has been removed.
   * @summary Remove DID Document from registry
   * @param did A percent-escaped DID Identifier as defined in DID specification<br /> <br />
   * Example: did%3Ahedera%3Atestnet%3Az6MkubW6fwkWSA97RbKs17MtLgWGHBtShQygUc5SeHueFCaG_0.0.29656231
   * @returns void
   */
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Delete("/{did}")
  public async revoke(@Path() did: string): Promise<void> {
    this.setStatus(204);
    return revokeDid(decodeURIComponent(did));
  }
}
