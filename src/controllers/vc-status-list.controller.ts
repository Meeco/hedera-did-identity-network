import { Verifiable, W3CCredential } from "did-jwt-vc";
import {
  Body,
  Controller,
  Example,
  Get,
  Path,
  Post,
  Put,
  Response,
  Route,
  Security,
  Tags,
} from "tsoa";
import {
  RegisterVcStatusPayload,
  ValidateErrorJSON,
  VcStatusChangePayload,
  VcStatusListInfoResponse,
} from "../models";
import {
  issueVcStatus,
  registerVcStatus,
  resolveVcStatusList,
  resumeVcStatus,
  revokeVcStatus,
  suspendVcStatus,
} from "../services";

enum VCStatus {
  Active = "active",
  Resumed = "resumed",
  Suspended = "suspended",
  Revoked = "revoked",
}

@Route("vc")
@Tags("Verifiable Credential Status List")
export class VerifiableCredentialStatusListController extends Controller {
  /**
   * Register verifiable credential status
   * @summary Register verifiable credential status.
   * @param body
   * @returns Credential status list information
   */
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post("/register")
  public async register(
    @Body() body: RegisterVcStatusPayload
  ): Promise<VcStatusListInfoResponse> {
    this.setStatus(201);
    return registerVcStatus(body).then((statusInfo) => ({
      statusInfo,
    }));
  }

  /**
   * Resolve verifiable credential that encapsulates the status list.
   * @summary Resolve verifiable credential status list.
   * @param statusListFileId
   * @returns Verifiable credential that encapsulates the status list
   */
  @Example<Verifiable<W3CCredential>>({
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc-status-list-2021/v1",
    ],
    type: ["VerifiableCredential", "StatusList2021Credential"],
    additionalProps: {
      jti: "urn:uuid:a98e123b-17dd-4d85-afbc-a67b2637f733",
    },
    id: "https://localhost:8000/vc/status/0.0.33965935",
    issuer: {
      id: "did:hedera:testnet:z6MkgYkY291VKXD6JvToXHaF13qg1fY9rSsmC9hWTtxsYfoB_0.0.33965881",
    },
    issuanceDate: "2022-03-17T14:47:32.000Z",
    expirationDate: "2022-03-17T14:47:32.000Z",
    credentialSubject: {
      encodedList:
        "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA",
      type: "RevocationList2021",
      id: "https://localhost:8000/vc/status/0.0.33965935#list",
    },
    proof: {
      type: "Ed25519Signature2018",
      proofPurpose: "assertionMethod",
      created: "2022-03-17T14:47:32.000Z",
      verificationMethod:
        "did:hedera:testnet:z6MkgYkY291VKXD6JvToXHaF13qg1fY9rSsmC9hWTtxsYfoB_0.0.33965881#did-root-key",
      jws: "4WV8waZlbHyEo8o-Pq7wkyz0l1u0HQT_cZp3tgWPTW2l3gbW1lo6-8OLyDNn28YdUPf6AcUyXXnbrB1J8d8HDQ",
    },
    jti: "urn:uuid:a98e123b-17dd-4d85-afbc-a67b2637f733",
    _jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDc1Mjg0NTIsImlkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6ODAwMC92Yy9zdGF0dXMvMC4wLjMzOTY1OTM1IiwiaXNzIjoiZGlkOmhlZGVyYTp0ZXN0bmV0Ono2TWtnWWtZMjkxVktYRDZKdlRvWEhhRjEzcWcxZlk5clNzbUM5aFdUdHhzWWZvQl8wLjAuMzM5NjU4ODEiLCJqdGkiOiJ1cm46dXVpZDphOThlMTIzYi0xN2RkLTRkODUtYWZiYy1hNjdiMjYzN2Y3MzMiLCJuYmYiOjE2NDc1Mjg0NTIsInN1YiI6Imh0dHBzOi8vbG9jYWxob3N0OjgwMDAvdmMvc3RhdHVzLzAuMC4zMzk2NTkzNSNsaXN0IiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJodHRwczovL3czaWQub3JnL3ZjLXN0YXR1cy1saXN0LTIwMjEvdjEiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZW5jb2RlZExpc3QiOiJINHNJQUFBQUFBQUFBLTNCTVFFQUFBRENvUFZQYlFzdm9BQUFBQUFBQUFBQUFBQUFBUDRHY3dNOTJ0UXdBQUEiLCJ0eXBlIjoiUmV2b2NhdGlvbkxpc3QyMDIxIn0sImlkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6ODAwMC92Yy9zdGF0dXMvMC4wLjMzOTY1OTM1IiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlN0YXR1c0xpc3QyMDIxQ3JlZGVudGlhbCJdfX0.4WV8waZlbHyEo8o-Pq7wkyz0l1u0HQT_cZp3tgWPTW2l3gbW1lo6-8OLyDNn28YdUPf6AcUyXXnbrB1J8d8HDQ",
  })
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Get("/status/{statusListFileId}")
  public async status(
    @Path() statusListFileId: string
  ): Promise<Verifiable<W3CCredential>> {
    this.setStatus(200);
    return resolveVcStatusList(statusListFileId).then(
      (statusListVc) => statusListVc
    );
  }

  /**
   * active, revoked, suspended or resumed verifiable credential status
   * @summary active, revoked, suspended or resumed verifiable credential status.
   * @param statusListFileId
   * @param statusListIndex
   * @returns active, revoked, suspended or resumed verifiable credential status
   */
  @Security({ SignedRequestHeader: [], DigestHeader: [], ExpiresHeader: [] })
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Put("/status/{statusListFileId}/{statusListIndex}")
  public async revoke(
    @Path() statusListFileId: string,
    @Path() statusListIndex: number,
    @Body() body: VcStatusChangePayload
  ): Promise<void> {
    this.setStatus(204);
    switch (body.status) {
      case VCStatus.Revoked:
        revokeVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Resumed:
        resumeVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Suspended:
        suspendVcStatus(statusListFileId, statusListIndex);
        break;
      case VCStatus.Active:
        issueVcStatus(statusListFileId, statusListIndex);
        break;
      default:
        throw new Error(`Status not supported : ${body.status}`);
    }
  }
}
