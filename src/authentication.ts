import { Hashing } from "@hashgraph/did-sdk-js";
import { PublicKey } from "@hashgraph/sdk";
import { Request } from "express";
import { ResolverService } from "./services";

const {
  parseSignatureHeader,
  createSignatureString,
  HttpSignatureError,
} = require("@digitalbazaar/http-signature-header");

const INCLUDE_HEADERS = ["date", "host", "(request-target)"];

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "SignedRequestHeader") {
    try {
      const { authorization } = request.headers;
      const signatureHeaderData = parseSignatureHeader(authorization);

      const signatureBuffer = Buffer.from(
        signatureHeaderData.params.signature,
        "base64"
      );
      const verificationData = new TextEncoder().encode(
        createSignatureString({
          includeHeaders: INCLUDE_HEADERS,
          requestOptions: request,
        })
      );

      const resolver = new ResolverService(request.params.did);
      const document = await resolver.resolveFromDB();

      if (
        !document?.authentication?.includes(signatureHeaderData.params.keyId)
      ) {
        return Promise.reject(
          new Error(
            `Not authorized to operate on ${request.params.did} DID document`
          )
        );
      }

      const verificationMethod = document.verificationMethod.find(
        (verificationMethod: any) =>
          verificationMethod.id === signatureHeaderData.params.keyId
      );

      if (!verificationMethod) {
        return Promise.reject(
          new Error(
            `Not authorized to operate on ${request.params.did} DID document`
          )
        );
      }

      const publicKey = PublicKey.fromBytes(
        Hashing.multibase.decode(verificationMethod.publicKeyMultibase)
      );

      if (publicKey.verify(verificationData, signatureBuffer)) {
        return Promise.resolve(document);
      }

      return Promise.reject(new Error(`Request signature is invalid`));
    } catch (err) {
      console.error(err);

      if (err instanceof HttpSignatureError) {
        return Promise.reject(new Error("Invalid request signature"));
      }

      return Promise.reject(new Error("Failed to process request signature"));
    }
  }

  return Promise.resolve(null);
}
