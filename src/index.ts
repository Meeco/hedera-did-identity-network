import "reflect-metadata";

import express, { Application } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import Router from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";

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

// const specs = swaggerJsdoc(options);
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

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
