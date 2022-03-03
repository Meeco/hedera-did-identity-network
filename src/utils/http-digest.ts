import { fromUint8Array as base64Encode } from "js-base64";

const { webcrypto } = require("crypto");
const base64Url = require("base64url-universal");

/**
 * Functions are taken from:
 * https://github.com/digitalbazaar/http-digest-header/blob/main/lib/httpDigest.js
 */

export async function createHeaderValue({
  data,
  algorithm = "sha256",
  useMultihash = true,
}: {
  data: string;
  algorithm: string;
  useMultihash: boolean;
}) {
  const { key, encodedDigest } = await _createHeaderValueComponents({
    data,
    algorithm,
    useMultihash,
  });
  return `${key}=${encodedDigest}`;
}

export async function verifyHeaderValue({
  data,
  headerValue,
}: {
  data: string;
  headerValue: string;
}) {
  try {
    const { key, algorithm, encodedDigest } = _parseHeaderValue(headerValue);
    const { encodedDigest: expectedDigest } =
      await _createHeaderValueComponents({
        data,
        algorithm,
        useMultihash: key === "mh",
      });
    return { verified: encodedDigest === expectedDigest };
  } catch (error) {
    return { verified: false, error };
  }
}

async function _createHeaderValueComponents({
  data,
  algorithm = "sha256",
  useMultihash = true,
}: {
  data: string;
  algorithm?: string;
  useMultihash?: boolean;
}) {
  if (algorithm !== "sha256") {
    throw new Error(`Algorithm "${algorithm}" is not supported.`);
  }
  const digest = await _getDigest({ data, algorithm });
  if (useMultihash) {
    return { key: "mh", encodedDigest: _createMultihash({ digest }) };
  }
  return { key: "SHA-256", encodedDigest: base64Encode(digest) };
}

function _parseHeaderValue(headerValue: string) {
  const [key, encodedDigest] = headerValue.split(/=(.+)/);

  let algorithm;
  if (key === "mh") {
    // if `encodedDigest` starts with `uEi`, then it is a base64url-encoded
    // sha-256 multihash
    if (encodedDigest.startsWith("uEi")) {
      algorithm = "sha256";
    } else {
      throw new Error(
        `Only base64url-encoded, sha-256 multihash is supported.`
      );
    }
  } else {
    algorithm = key.replace("-", "").toLowerCase();
    if (algorithm !== "sha256") {
      throw new Error(`Algorithm "${algorithm}" is not supported.`);
    }
  }
  return { key, algorithm, encodedDigest };
}

async function _getDigest({
  data,
  algorithm,
}: {
  data: string;
  algorithm: string;
}) {
  const encodedData = new TextEncoder().encode(data);
  if (algorithm === "sha256") {
    return new Uint8Array(
      await webcrypto.subtle.digest({ name: "SHA-256" }, encodedData)
    );
  }
  throw new Error(`Algorithm "${algorithm}" is not unsupported.`);
}

function _createMultihash({ digest }: { digest: Uint8Array }) {
  // format as multihash digest
  // sha2-256: 0x12, length: 32 (0x20), digest value
  const mh = new Uint8Array(34);
  mh[0] = 0x12;
  mh[1] = 0x20;
  mh.set(digest, 2);
  // encode multihash using multibase, base64url: `u`
  return `u${base64Url.encode(mh)}`;
}
