import express from "express";
import DidServiceController from "../controllers/did-service.controller";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const controller = new DidServiceController();
  return controller
    .register(req.params.did, req.body)
    .then(res.send)
    .catch(next);
});

router.put("/:id", async (req, res, next) => {
  const controller = new DidServiceController();
  return controller
    .update(req.params.did, req.params.id, req.body)
    .then(res.send)
    .catch(next);
});

router.delete("/:id", async (req, res, next) => {
  const controller = new DidServiceController();
  return controller
    .remove(req.params.did, req.params.id)
    .then(res.send)
    .catch(next);
});

export default router;
