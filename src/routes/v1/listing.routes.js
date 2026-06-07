import { Router } from "express";
import ListingController from "../../controllers/listing.controller.js";
import ListingService from "../../services/listing.service.js";
import AuthMiddleware from "../../middlewares/auth.middleware.js";

// ─── Dependency Injection ────────────────────────────────
const listingService = new ListingService();
const listingController = new ListingController(listingService);

// ─── Router ──────────────────────────────────────────────
const router = Router();

// ── Public routes ────────────────────────────────────────

// GET /api/v1/listings?city=&propertyType=&genderPreference=&approvalStatus=
router.get("/", listingController.getAllListings);

// ── Owner-specific named routes ──────────────────────────
// NOTE: These MUST be registered before /:listingId to prevent
// Express from treating 'owner' as a listingId param.

// GET /api/v1/listings/owner/my-listings
router.get(
  "/owner/my-listings",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.getMyListings,
);

// GET /api/v1/listings/owner/metrics
router.get(
  "/owner/metrics",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.getOwnerMetrics,
);

// ── Param routes ─────────────────────────────────────────

// GET /api/v1/listings/:listingId
router.get("/:listingId", listingController.getListingById);

// ── Protected routes (require authentication) ─────────────

// POST /api/v1/listings
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.createListing,
);

// PATCH /api/v1/listings/:listingId/toggle-availability
router.patch(
  "/:listingId/toggle-availability",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.toggleAvailability,
);

// PATCH /api/v1/listings/:listingId/metrics/:field
router.patch(
  "/:listingId/metrics/:field",
  AuthMiddleware.authenticate,
  listingController.incrementMetric,
);

// DELETE /api/v1/listings/:listingId  (soft delete)
router.delete(
  "/:listingId",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.softDeleteListing,
);

// DELETE /api/v1/listings/:listingId/permanent  (hard delete)
router.delete(
  "/:listingId/permanent",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("OWNER"),
  listingController.hardDeleteListing,
);

export default router;
