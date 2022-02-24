module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "test/(.*)": "<rootDir>/test/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}"],
  verbose: true,
  forceExit: true,
  setupFilesAfterEnv: ["./jest.setupAfterEnv.js"],
  setupFiles: ["./jest.setup.js"],
};
