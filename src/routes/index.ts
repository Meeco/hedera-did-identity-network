import express from "express";
import DidDocumentRouter from "./did-document.router";
import DidServiceRouter from "./did-service.router";
import DidVerificationMethodRouter from "./did-verification-method.router";
import DidVerificationRelationshipRouter from "./did-verification-relationship.router";

const router = express.Router();

router.use("/did", DidDocumentRouter);
router.use("/did/:did/services", DidServiceRouter);
router.use("/did/:did/verification-methods", DidVerificationMethodRouter);
router.use(
  "/did/:did/verification-relationships",
  DidVerificationRelationshipRouter
);

export default router;
