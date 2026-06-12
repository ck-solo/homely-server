import express from "express";

import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../../controllers/listing.controller.js";

import AuthMiddleware from "../../middlewares/auth.middleware.js";
import ListingValidator from "../../middlewares/validators/listing.validator.js";

const router = express.Router();

/**
 * Public Routes
 */
router.get("/", getAllListings);
router.get("/:id", getListingById);

/**
 * Owner Routes
 */
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  ListingValidator.createListing(),
  ListingValidator.validate,
  createListing
);

router.put(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  ListingValidator.updateListing(),
  ListingValidator.validate,
  updateListing
);

router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  deleteListing
);

export default router;