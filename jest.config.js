/**
 * Due to problems compiling digitalbazaar for tests:
 * https://github.com/digitalbazaar/ed25519-signature-2020/issues/8#issuecomment-830223507
 */
const packagesToTransform = [
  "@digitalbazaar/bitstring",
  "base64url-universal",
  "vc-revocation-list",
].join("|");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}"],
  verbose: true,
  forceExit: true,
  setupFilesAfterEnv: ["./jest.setupAfterEnv.js"],
  setupFiles: ["./jest.setup.js"],
  /**
   * Due to problems compiling digitalbazaar for tests:
   * https://github.com/digitalbazaar/ed25519-signature-2020/issues/8#issuecomment-830223507
   */
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    `[/\\\\]node_modules[/\\\\](?!(${packagesToTransform})).+\\.(js|jsx)$`,
  ],
  moduleNameMapper: {
    "test/(.*)": "<rootDir>/test/$1",
    /**
     * Due to problems compiling digitalbazaar for tests:
     * https://github.com/digitalbazaar/ed25519-signature-2020/issues/8#issuecomment-830223507
     */
    "@digitalbazaar/bitstring": "@digitalbazaar/bitstring/main.js",
    "base64url-universal": "base64url-universal/lib/base64url.js",
    "vc-revocation-list": "vc-revocation-list/main.js",
  },
};
