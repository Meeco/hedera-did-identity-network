import express from "express";
import DidDocumentController from "../controllers/did-document.controller";

const router = express.Router();

router.get("/:did", async (req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.resolve(req.params.did);
  return res.send(response);
});

router.post("/", async (req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.register(req.body);
  return res.send(response);
});

router.delete("/:did", async (req, res) => {
  const controller = new DidDocumentController();
  const response = await controller.remove(req.params.did);
  if (!response) res.status(404).send({ message: "No post found" });
  return res.send(response);
});

export default router;
