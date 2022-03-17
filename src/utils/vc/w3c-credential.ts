import { createJWS, decodeJWT, JWTHeader } from "did-jwt";
import {
  CredentialPayload,
  Issuer,
  JwtCredentialPayload,
  transformCredentialInput,
  validateJwtCredentialPayload,
  Verifiable,
  VerifiableCredential,
  W3CCredential as W3CCredentialExternal,
  normalizeCredential as W3CNormalizeCredential,
} from "did-jwt-vc";
import {
  hashJWTComponents,
  isCanonical,
  newId,
  stableEncodeJWT,
  timestampNow,
  toJWTTimestamp,
  toW3CTimestamp,
  validateDates,
} from "./utils/jwt";
import { JWTDecoded } from "./jwt";

const copiedProperties = [
  "@context",
  "id",
  "type",
  "credentialSubject",
  "proof",
  "issuer",
  "issuanceDate",
  "expirationDate",
];

interface AnyCredentialSubject {
  id?: string;
  [x: string]: any;
}

export class W3CCredential<T extends AnyCredentialSubject>
  implements Verifiable<CredentialPayload>
{
  "@context" = ["https://www.w3.org/2018/credentials/v1"];
  id?: string;
  type = ["VerifiableCredential"];
  issuer: { id: string; [x: string]: any } | string;
  issuanceDate: string | Date;
  expirationDate?: string | Date;
  credentialSubject: T;
  proof: {
    type?: string;
    [x: string]: any;
  };

  // evidence?: any;
  // credentialSchema?: any;
  // refreshService?: any;
  // termsOfUse?: any;

  private additionalProps: { [x: string]: any } = {};
  // stores the JWT used in fromJWT or toJWT to limit chances for bugs
  private _jwt?: string;

  public static fromJSON(json: string): W3CCredential<any> {
    const obj = JSON.parse(json);
    // test datetimes because did-jwt-vc silently fails while converting them
    validateDates(obj.issuanceDate, obj.expirationDate);

    const vcPartial = normalizeCredential(obj);
    // TODO: validate

    return new W3CCredential(vcPartial);
  }

  public static fromJWT(jwt: string): W3CCredential<any> {
    const { header, payload, signature } = decodeJWT(jwt);

    if (!isCanonical(header) || !isCanonical(payload)) {
      throw new Error(
        "decoded JWT not in canonical form, conversion to W3C format will break the signature"
      );
    }

    if (header.alg !== "EdDSA") {
      throw new Error("Unrecognized JWT signature algorithm: " + header.alg);
    }

    // must be a credential
    if (!payload.vc || !payload.vc.credentialSubject) {
      throw new Error(
        'VC JWT did not contain a "credentialSubject" -- is it a VP?'
      );
    }

    const vcPartial = normalizeCredential(payload);

    const result = {
      ...vcPartial,
      proof: {
        type: "Ed25519Signature2018",
        proofPurpose: "assertionMethod",
        created: vcPartial.issuanceDate,
        verificationMethod:
          header?.kid || vcPartial.issuer.id + "#did-root-key",
        jws: signature,
      },
    };

    // additional VC metadata props:
    for (const prop of Object.getOwnPropertyNames(payload.vc)) {
      if (!copiedProperties.includes(prop)) {
        (<any>result)[prop] = payload.vc[prop];
      }
    }

    // ensure no spurious objects
    delete (<any>result)["vc"];

    return new W3CCredential(result, jwt);
  }

  /**
   * Create a new VC by signing claims and metadata.
   * @returns The JWT encoded credential.
   */
  public static async createJWT(
    {
      id,
      credentialSubject,
      expiration,
      contexts = ["https://www.w3.org/2018/credentials/v1"],
      evidence,
      type,
      credentialSchema,
      credentialStatus,
    }: {
      id?: string;
      credentialSubject: any;
      expiration?: Date;
      contexts?: string[];
      evidence?: any;
      type?: string[];
      credentialSchema?:
        | { id: string; type: string }
        | Array<{ id: string; type: string }>;
      credentialStatus?: {
        id: string;
        type: string;
        revocationListIndex: string;
        revocationListCredential: string;
      };
    },
    signer: Issuer
  ): Promise<string> {
    // TODO: in w3c payload, top-level props are NOT moved into VC...
    // hence credential is partially transformed to decoded JWT format
    const payload = {
      iss: signer.did,
      sub: credentialSubject.id,
      id: id,
      vc: {
        id: id,
        "@context": contexts,
        type: type || "VerifiableCredential",
        credentialSubject: {
          ...credentialSubject,
        },
        credentialSchema,
      },
      nbf: timestampNow(),
      jti: newId(),
    };

    if (evidence) {
      (<any>payload.vc)["evidence"] = evidence;
    }

    if (credentialStatus) {
      (<any>payload.vc)["credentialStatus"] = credentialStatus;
    }

    if (expiration) {
      (<any>payload)["exp"] = toJWTTimestamp(expiration);
    }

    delete payload.vc.credentialSubject.id; // otherwise it gets copied!

    const parsedPayload = transformCredentialInput(payload);

    validateJwtCredentialPayload(parsedPayload);
    return createJWS(
      parsedPayload,
      signer.signer,
      { alg: "EdDSA", typ: "JWT" },
      { canonicalize: true }
    );
  }

  /**
   * Create a new VC by signing claims and metadata.
   */
  public static async create<S extends AnyCredentialSubject>(
    args: {
      id?: string;
      credentialSubject: S;
      expiration?: Date;
      contexts?: string[];
      evidence?: any;
      type?: string[];
      credentialSchema?:
        | { id: string; type: string }
        | Array<{ id: string; type: string }>;
    },
    signer: Issuer
  ): Promise<W3CCredential<S>> {
    const jwt = await W3CCredential.createJWT(args, signer);

    return W3CCredential.fromJWT(jwt);
  }

  /**
   * @param originalJWT Record original JWT if any. Used to ensure claim orderings remain consistent.
   */
  constructor(
    credential: Verifiable<W3CCredentialExternal | CredentialPayload>,
    originalJWT?: string
  ) {
    const normalized = normalizeCredential(credential);

    this["@context"] = normalized["@context"];
    this.id = normalized.id;
    this.type = normalized.type;
    this.issuer = normalized.issuer;
    this.issuanceDate = normalized.issuanceDate;
    this.expirationDate = normalized.expirationDate;
    this.credentialSubject = normalized.credentialSubject as any;
    this.proof = normalized.proof;

    for (const prop of Object.getOwnPropertyNames(credential)) {
      if (!copiedProperties.includes(prop)) {
        this.additionalProps[prop] = credential[prop];
        (<any>this)[prop] = credential[prop];
      }
    }

    this._jwt = originalJWT;
  }

  // smooths over the union type of issuer
  get issuerDid(): string {
    return typeof this.issuer === "string" ? this.issuer : this.issuer.id;
  }

  hash(): string {
    const jwt = this.toJWT();
    return hashJWTComponents(jwt.header, jwt.payload, jwt.signature);
  }

  /**
   * @returns JWT components and stable encoded JWT string in [[jwt]].
   * Note that [[data]] is just the [[jwt]] string without the signature suffix (matches output of [[decodeJWT]]).
   */
  toJWT(): JWTDecoded & { jwt: string } {
    // use original JWT if any
    if (this._jwt) {
      const decoded = decodeJWT(this._jwt);
      return {
        ...decoded,
        jwt: this._jwt,
      };
    }

    // note: even though transformCredentialinput does normalization, it doesn't do a deep copy
    // that means extra properties need to be manually copied across (same applies in issue())

    const normalized = normalizeCredential(this.basePropsClean);
    const payload = transformCredentialInput(normalized, true);

    /**
     * Because did-jwt has a specific order for creating the payload, and
     * don't use a stable stringify when creating their JWT payload
     * we need to replicate that order here - unfortunately.
     *
     * Likewise the VC itself has a specific ordering.
     */
    const { exp, iss, sub, nbf, jti, vc: payloadVc, ...rest } = payload;
    const orderedPayload = {
      exp,
      vc: {
        "@context": payloadVc["@context"],
        type: payloadVc.type,
        credentialSubject: payloadVc.credentialSubject,
        credentialSchema: payloadVc.credentialSchema,
        evidence: payloadVc.evidence,
        ...this.additionalProps,
      },
      ...rest,
      iss,
      sub,
      nbf,
      jti,
    };

    // special cases
    delete (<any>orderedPayload).proof;

    const header: JWTHeader = { alg: "EdDSA", typ: "JWT" };
    const signature = this.proof.jws;

    const jwtExpanded = { header, payload: orderedPayload };
    const data = stableEncodeJWT(jwtExpanded);
    const jwt = `${data}.${signature}`;
    this._jwt = jwt;

    return {
      header,
      payload: orderedPayload,
      signature,
      data,
      jwt,
    };
  }

  /** @returns an object matching the W3C spec */
  toCredential(): any {
    const result = this.basePropsClean;

    for (const entry of Object.entries(this.additionalProps)) {
      const [prop, value] = entry;
      if (value !== undefined) {
        (<any>result)[prop] = value;
      }
    }

    return result;
  }

  // returns class properties as an object not including any undefined
  // does not include additional props
  private get basePropsClean() {
    // TODO deep copy
    const result = {
      ["@context"]: this["@context"],
      type: this.type,
      issuer: this.issuer,
      credentialSubject: { ...this.credentialSubject },
      proof: this.proof,
    };

    // note that even though issuanceDate is not optional, it may not be called when basePropsClean is called.
    if (this.issuanceDate) {
      (<any>result)["issuanceDate"] = toW3CTimestamp(this.issuanceDate);
    }

    // guard against undefined optional props
    if (this.id) {
      (<any>result)["id"] = this.id;
    }

    if (this.expirationDate) {
      (<any>result)["expirationDate"] = toW3CTimestamp(this.expirationDate);
    }

    return result;
  }
}

/** Replacement for buggy did-jwt-vc normalizePresentation */
export function normalizeCredential(
  input: Partial<VerifiableCredential> | Partial<JwtCredentialPayload>,
  removeOriginalFields = true
): Verifiable<W3CCredentialExternal> {
  const result = W3CNormalizeCredential(input, removeOriginalFields);

  return normalizeFix(input, result);
}

/** Fix normalization bug by comparing to original. Mutates input objects. */
export function normalizeFix(original: any, normalized: any): any {
  for (let field of ["evidence", "credentialStatus", "termsOfUse"]) {
    if (field in normalized && normalized[field] === undefined) {
      if (original[field]) {
        normalized[field] = original[field];
      } else {
        delete normalized[field];
      }
    }
  }

  return normalized;
}
