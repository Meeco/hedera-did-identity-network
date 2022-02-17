import { Get, Route, Tags, Post as PostMethod, Body, Path } from "tsoa";
import { DidDocument } from "../models";
import {
  register,
  resolve,
  IDidDocumentPayload,
  remove,
} from "../repositories/did-document.repository";

@Route("did")
@Tags("Document")
export default class DidDocumentController {
  @Get("/")
  public async resolve(): Promise<DidDocument> {
    return resolve();
  }

  @PostMethod("/")
  public async register(
    @Body() body: IDidDocumentPayload
  ): Promise<DidDocument> {
    return register(body);
  }

  @Get("/:id")
  public async remove(@Path() id: string): Promise<DidDocument | null> {
    return remove(Number(id));
  }
}
