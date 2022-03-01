import { app } from "./server";
import { connectWithRetry } from "./services/connection.service";
require("dotenv").config();

const PORT = process.env.PORT || 8000;

//connect to database
process.env.NODE_ENV != "test" ? connectWithRetry() : null;

//start app
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
