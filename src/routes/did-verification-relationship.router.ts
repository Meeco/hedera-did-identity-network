import express from "express";
import DidVerificationRelationshipController from "../controllers/did-verification-relationship.controller";

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .register(req.params.did, req.body)
    .then(res.send)
    .catch(next);
});

router.put("/:id", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .update(req.params.did, req.params.id, req.body)
    .then(res.send)
    .catch(next);
});

router.delete("/:id", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .remove(req.params.did, req.params.id)
    .then(res.send)
    .catch(next);
});

export default router;
