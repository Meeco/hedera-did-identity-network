import express from "express";
import DidVerificationRelationshipController from "../controllers/did-verification-relationship.controller";

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .register(req.params.did, req.body)
    .then((doc) => {
      res.status(201);
      res.send(doc);
    })
    .catch(next);
});

router.put("/:relationshipType/:id", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .update(
      req.params.did,
      // TODO: fix
      req.params.relationshipType as any,
      req.params.id,
      req.body
    )
    .then((doc) => {
      res.status(200);
      res.send(doc);
    })
    .catch(next);
});

router.delete("/:relationshipType/:id", async (req, res, next) => {
  const controller = new DidVerificationRelationshipController();
  return controller
    .revoke(
      req.params.did,
      // TODO: fix
      req.params.relationshipType as any,
      req.params.id
    )
    .then((doc) => {
      res.status(200);
      res.send(doc);
    })
    .catch(next);
});

export default router;
