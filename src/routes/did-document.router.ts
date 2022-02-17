import express from "express";
import DidDocumentController from "../controllers/did-document.controller";

const router = express.Router();

router.get("/", async (_req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.resolve();
  return res.send(response);
});

router.post("/", async (req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.register(req.body);
  return res.send(response);
});

router.get("/:id", async (req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.remove(req.params.id);
  if (!response) res.status(404).send({ message: "No post found" });
  return res.send(response);
});

export default router;
