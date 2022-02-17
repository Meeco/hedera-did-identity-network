import express from "express";
import PostRouter from "./did-document.router";

const router = express.Router();

router.use("/posts", PostRouter);

export default router;
