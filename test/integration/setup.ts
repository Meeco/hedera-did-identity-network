import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { resolve } from "path";

const DID_PUBLIC_KEY_MULTIBASE = process.env.DID_PUBLIC_KEY_MULTIBASE || "";

export function setupBeforeAndAfter() {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    jest.mock("../../src/services/connection.service", () => {
      const originalModule = jest.requireActual(
        "../../src/services/connection.service"
      );

      return {
        __esModule: true,
        ...originalModule,
        connectWithRetry: new Promise(() => resolve()),
        getMongoose: mongoose,
      };
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    jest.resetAllMocks();
  });
}
