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
import { uploadListingImages } from "../../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * Helper middleware to parse stringified JSON fields from FormData requests.
 */
const parseListingFormData = (req, res, next) => {
  if (req.body.location && typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (e) {
      // Validator will flag if invalid
    }
  }
  if (req.body.amenities && typeof req.body.amenities === "string") {
    try {
      req.body.amenities = JSON.parse(req.body.amenities);
    } catch (e) {
      // Fallback: handle comma-separated strings
      req.body.amenities = req.body.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }
  next();
};

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
  uploadListingImages,
  parseListingFormData,
  ListingValidator.createListing(),
  ListingValidator.validate,
  createListing
);

router.put(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  uploadListingImages,
  parseListingFormData,
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