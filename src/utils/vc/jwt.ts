import { decodeJWT } from "did-jwt";
import * as util from "./utils/jwt";

// note: the following mirror those in did-jwt/lib/JWT because webpack can't always resolve these module paths
// when using this lib as a submodule.
export interface JWTHeader {
    typ: "JWT";
    alg: string;
    [x: string]: any;
}

export interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    iat?: number;
    nbf?: number;
    type?: string;
    exp?: number;
    rexp?: number;
    [x: string]: any;
}

export interface JWTDecoded {
    header: JWTHeader;
    payload: JWTPayload;
    signature: string;
    data: string;
}

/** Present common transformations of JWTs in the same style as W3C credentials. */
export class JWT {
    public static decode(jwt: string) {
        const { header, payload, signature } = decodeJWT(jwt);
        return new JWT(header, payload, signature, jwt);
    }

    private _jwt?: string;
    constructor(public header: JWTHeader, public payload: JWTPayload, public signature: string, originalJwt?: string) {
        this._jwt = originalJwt;
    }

    hash(): string {
        return util.hashJWTComponents(this.header, this.payload, this.signature);
    }

    toJWT(): JWTDecoded & { jwt: string } {
        // use original JWT if any
        if (this._jwt) {
            const decoded = decodeJWT(this._jwt);
            return {
                ...decoded,
                jwt: this._jwt,
            };
        } else {
            const data = util.stableEncodeJWT({ header: this.header, payload: this.payload });
            this._jwt = `${data}.${this.signature}`;
            return {
                header: this.header,
                payload: this.payload,
                signature: this.signature,
                data,
                jwt: this._jwt,
            };
        }
    }

    isCredential(): boolean {
        return !!this.payload.vc;
    }

    isPresentation(): boolean {
        return !!this.payload.vp;
    }

    isCanonical(): boolean {
        return util.isCanonical(this.header) && util.isCanonical(this.payload);
    }
}
