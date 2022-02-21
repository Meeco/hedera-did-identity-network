import mongoose from "mongoose";
require("dotenv").config();

const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = process.env;

export const getMongoose = () => {
  return mongoose;
};

export const connectWithRetry = async () => {
  console.log(
    `Attempting MongoDB connection (will retry if needed) mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  );

  await mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  );
};
