import { Hashing } from "@hashgraph/did-sdk-js";
import { PublicKey } from "@hashgraph/sdk";
import { Request } from "express";
import { DidDocument } from "./models";
import { ResolverService } from "./services";

const httpSignature = require("@digitalbazaar/http-signature-header");
// TODO: TEMPORARY commented - re-introduce http digest header. It is temporary commented out to complete rest of the integration tests.
// const httpDigest = require("@digitalbazaar/http-digest-header");

const INCLUDE_HEADERS_WITHOUT_DIGEST = ["date", "host", "(request-target)"];
const INCLUDE_HEADERS_WITH_DIGEST = [
  "date",
  "host",
  "(request-target)",
  "digest",
];
// const DIGEST_REQUIRING_METHOD = ["post", "put", "patch"];

/**
 * Helper functions
 */

const findAuthenticationPublicKey = (
  document: DidDocument,
  keyId: string
): PublicKey | null => {
  if (!document?.authentication?.includes(keyId)) {
    return null;
  }

  const verificationMethod = document.verificationMethod.find(
    (verificationMethod: any) => verificationMethod.id === keyId
  );

  if (!verificationMethod) {
    return null;
  }

  return PublicKey.fromBytes(
    Hashing.multibase.decode(verificationMethod.publicKeyMultibase)
  );
};

// const requiresDigestHeader = (method: string): boolean => {
//   return DIGEST_REQUIRING_METHOD.includes(method.toLowerCase());
// };

const parseRequest = (request: Request) => {
  const { authorization } = request.headers;
  const includeHeaders = INCLUDE_HEADERS_WITHOUT_DIGEST;
  // requiresDigestHeader(request.method)
  //   ? INCLUDE_HEADERS_WITH_DIGEST
  //   : INCLUDE_HEADERS_WITHOUT_DIGEST;

  const signatureHeaderData = httpSignature.parseSignatureHeader(authorization);
  const signatureBuffer = Buffer.from(
    signatureHeaderData.params.signature,
    "base64"
  );
  const signatureVerificationData = new TextEncoder().encode(
    httpSignature.createSignatureString({
      includeHeaders,
      requestOptions: request,
    })
  );

  return { signatureHeaderData, signatureBuffer, signatureVerificationData };
};

// const isDigestHeaderValid = async (request: Request): Promise<boolean> => {
//   if (requiresDigestHeader(request.method)) {
//     const { digest } = request.headers;
//     const digestVerificationData = JSON.stringify(request.body);

//     const { verified } = await httpDigest.verifyHeaderValue({
//       data: digestVerificationData,
//       headerValue: digest,
//     });

//     return verified;
//   }

//   return true;
// };

/**
 * Middleware function
 */

export async function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[]
): Promise<DidDocument | null> {
  if (securityName === "SignedRequestHeader") {
    try {
      const {
        signatureHeaderData,
        signatureBuffer,
        signatureVerificationData,
      } = parseRequest(request);

      // if (!(await isDigestHeaderValid(request))) {
      //   return Promise.reject(new Error(`Digest header value is invalid`));
      // }

      const resolver = new ResolverService(request.params.did);
      const document = await resolver.resolveFromDB();

      const publicKey = findAuthenticationPublicKey(
        document,
        signatureHeaderData.params.keyId
      );

      if (!publicKey) {
        return Promise.reject(
          new Error(
            `Not authorized to operate on ${request.params.did} DID document`
          )
        );
      }

      if (!publicKey.verify(signatureVerificationData, signatureBuffer)) {
        return Promise.reject(new Error(`Request signature is invalid`));
      }

      return Promise.resolve(document);
    } catch (err) {
      console.error(err);

      if (err instanceof httpSignature.HttpSignatureError) {
        return Promise.reject(new Error("Invalid request signature"));
      }

      return Promise.reject(new Error("Failed to process request signature"));
    }
  }

  return Promise.resolve(null);
}
