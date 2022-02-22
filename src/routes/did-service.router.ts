import express from "express";
import DidServiceController from "../controllers/did-service.controller";

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res, next) => {
  const controller = new DidServiceController();

  return controller
    .register(req.params.did, req.body)
    .then((doc) => {
      res.status(201);
      res.send(doc);
    })
    .catch(next);
});

router.put("/:id", async (req, res, next) => {
  const controller = new DidServiceController();
  return controller
    .update(req.params.did, req.params.id, req.body)
    .then((doc) => {
      res.status(200);
      res.send(doc);
    })
    .catch(next);
});

router.delete("/:id", async (req, res, next) => {
  const controller = new DidServiceController();
  return controller
    .revoke(req.params.did, req.params.id)
    .then((doc) => {
      res.status(200);
      res.send(doc);
    })
    .catch(next);
});

export default router;
