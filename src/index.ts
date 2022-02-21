import express, { Application } from "express";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { connectWithRetry } from "./db/connection.service";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import Router from "./routes";
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const app: Application = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hedera Appnet API",
      version: "1.0.0",
      description: "This is a hedera appnet API application",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Meeco",
        url: "https://meeco.me",
        email: "‍support@meeco.me",
      },
    },
    servers: [
      {
        url: "http://localhost:8000/",
      },
    ],
  },
  apis: ["./routes/index.js"],
};

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(Router);
app.use(errorHandler);
app.use(notFoundHandler);

//connect to database
connectWithRetry();

//start app
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
