import express from "express";
import multer from "multer";
import AuthMiddleware from "../../middlewares/auth.middleware.js";
import ListingController from "../../controllers/listing.controller.js";
import ListingService from "../../services/listing.service.js";
import MongoListingRepository from "../../repositories/implementations/mongoListingRepository.js";
import ListingValidator from "../../middlewares/validators/listing.validator.js";
import { ROLES } from "../../utils/constants.js";

// ─── Dependency Injection ────────────────────────────────
const listingRepository = new MongoListingRepository();
const listingService = new ListingService(listingRepository);
const listingController = new ListingController(listingService);

// ─── Multer Config (memory storage for ImageKit upload) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
  },
});

// ─── Router ──────────────────────────────────────────────
const listingRoutes = express.Router();

// Protected route — OWNER (get my listings)
// NOTE: Must be BEFORE /:id to avoid "my-listings" matching as an :id param
listingRoutes.get(
  "/owner/my-listings",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(ROLES.OWNER),
  listingController.getMyListings,
);

// Public routes (any user / unauthenticated)
listingRoutes.get("/", listingController.getAllListings);

listingRoutes.get(
  "/:id",
  ListingValidator.listingIdParam(),
  ListingValidator.validate,
  listingController.getListingById,
);

// Protected routes — OWNER only
listingRoutes.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(ROLES.OWNER),
  upload.array("images", 10),
  ListingValidator.createListing(),
  ListingValidator.validate,
  listingController.createListing,
);

listingRoutes.put(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(ROLES.OWNER),
  upload.array("images", 10),
  ListingValidator.updateListing(),
  ListingValidator.validate,
  listingController.updateListing,
);

export default listingRoutes;
