import express from "express";
import DidVerificationMethodController from "../controllers/did-verification-method.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const controller = new DidVerificationMethodController();
  return controller
    .register(req.params.did, req.body)
    .then(res.send)
    .catch(next);
});

router.put("/:id", async (req, res, next) => {
  const controller = new DidVerificationMethodController();
  return controller
    .update(req.params.did, req.params.id, req.body)
    .then(res.send)
    .catch(next);
});

router.delete("/:id", async (req, res, next) => {
  const controller = new DidVerificationMethodController();
  return controller
    .remove(req.params.did, req.params.id)
    .then(res.send)
    .catch(next);
});

export default router;
