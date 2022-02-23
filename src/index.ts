import express, {
  Application,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes";
import { connectWithRetry } from "./services/connection.service";
import { ValidateError } from "tsoa";
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

RegisterRoutes(app);

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: "application/*+json" }));

// global error handling
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }

  next();
});

app.use(function notFoundHandler(_req, res: ExResponse) {
  res.status(404).send({
    message: "Not Found",
  });
});

//connect to database
connectWithRetry();

//start app
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
