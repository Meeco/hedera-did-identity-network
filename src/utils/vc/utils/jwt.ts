import { PrivateKey } from "@hashgraph/sdk";
import * as bs58 from "bs58";
import canonicalize from "canonicalize";
import { decodeJWT, JWTHeader, JWTPayload } from "did-jwt";
import { Issuer } from "did-jwt-vc";
import shajs from "sha.js";
import * as u8a from "uint8arrays";
import { v4 as uuidv4 } from "uuid";

export function newId(): string {
    return "urn:uuid:" + uuidv4();
}

/** UNIX timestamp used in JWT is seconds since epoch */
export function timestampNow(): number {
    return Math.floor(Date.now() / 1000);
}

export function toJWTTimestamp(d: Date) {
    return Math.floor(d.valueOf() / 1000);
}

/**
 * @param d Assumes strings are already formatted.
 */
export function toW3CTimestamp(d: string | Date): string {
    return typeof d === "string" ? d : d.toISOString();
}

/** Uses canonicalize so that produced JWTs are identical regardless of key order  */
export function stableEncodeJWT(jwt: { header: any; payload: any }, signature?: string): string {
    function encodeSection(s: any): string {
        if (typeof s === "string") {
            return s;
        } else {
            const canonicalJSON = canonicalize(s);
            if (canonicalJSON === undefined) {
                throw new Error("Could not convert object to JSON");
            }

            return u8a.toString(u8a.fromString(canonicalJSON), "base64url");
        }
    }

    if (signature) {
        return [encodeSection(jwt.header), encodeSection(jwt.payload), signature].join(".");
    } else {
        return [encodeSection(jwt.header), encodeSection(jwt.payload)].join(".");
    }
}

/**
 * Checks whether string dates can be parsed and if both are present, that expiry is after issue.
 * Note that this is more permissive than the spec, as it permits any format recognized by Date.parse.
 */
export function validateDates(issue?: string, expiry?: string) {
    if (issue && !Date.parse(issue)) {
        throw new Error("invalid value for issuanceDate: " + issue);
    }

    if (expiry && !Date.parse(expiry)) {
        throw new Error("invalid value for expirationDate: " + issue);
    }

    if (issue && expiry) {
        const iss = Date.parse(issue);
        const exp = Date.parse(expiry);
        if (iss && exp && iss >= exp) {
            throw new Error("expirationDate cannot be after issuanceDate");
        }
    }
}

/**
 * @param did Defaults to the did-root-key of [[key]].
 * @returns A signing function used to create VCs or VPs.
 */
export function createSigner(key: PrivateKey, did: string): Issuer {
    return {
        did,
        signer: (msg: string | Uint8Array) => {
            const input = typeof msg === "string" ? u8a.fromString(msg) : msg;
            const sig = key.sign(input);
            return Promise.resolve(u8a.toString(sig, "base64url"));
        },
        // ref: https://tools.ietf.org/html/rfc8037#appendix-A.4
        alg: "EdDSA",
    };
}

/**
 * @return true if the given object is in JSON canonical form.
 */
export function isCanonical(obj: any): boolean {
    return JSON.stringify(obj) === canonicalize(obj);
}

/**
 * Note JWTs are not required to be canonical by default.
 * @return true if the given JWT has header and payload in JSON canonical form.
 */
export function jwtIsCanonical(jwt: string): boolean {
    const { header, payload } = decodeJWT(jwt);
    return isCanonical(header) && isCanonical(payload);
}

/**
 * @returns The object with its props sorted in canonical order or null if canonicalization fails.
 */
export function toCanonical(obj: any): any {
    return JSON.parse(canonicalize(obj) || "null");
}

export function hashJWTComponents(header: JWTHeader, payload: JWTPayload, signature: string) {
    // but encoding->decode->stringify is not the cleanest implementation

    const jsonString = canonicalize({ header, payload, signature });
    if (jsonString === undefined) {
        throw new Error("Could not convert JWT object to JSON");
    }

    const hashBytes = shajs("sha256").update(jsonString).digest();
    const hash = bs58.encode(hashBytes);
    return hash;
}
