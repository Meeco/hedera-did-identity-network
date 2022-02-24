import bodyParser from "body-parser";
import express, { Application } from "express";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { errorHanlder, notFoundHandler } from "./middleware";
import { RegisterRoutes } from "./routes";
import { connectWithRetry } from "./services/connection.service";
require("dotenv").config();

const PORT = process.env.PORT || 8000;

export const app: Application = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

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
app.use(errorHanlder);
app.use(notFoundHandler);

//connect to database
process.env.NODE_ENV != "test" ? connectWithRetry() : null;

//start app
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
