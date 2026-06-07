import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

class ListingController {
  /**
   * @param {import('../services/listing.service.js').default} listingService
   */
  constructor(listingService) {
    this.listingService = listingService;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/listings
   * Creates a new rental listing for the authenticated owner.
   */
  createListing = asyncHandler(async (req, res) => {
    const ownerId = req.user.id;
    const listing = await this.listingService.createListing(ownerId, req.body);

    res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          "Listing created successfully",
          listing,
        ),
      );
  });

  // ── Read ─────────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/listings
   * Returns all active (non-deleted) listings.
   * Accepts optional query params forwarded as filter criteria.
   */
  getAllListings = asyncHandler(async (req, res) => {
    // Whitelist allowed filter keys — never pass raw req.query to the DB.
    const { city, propertyType, genderPreference, approvalStatus } = req.query;
    const filter = {};
    if (city)             filter.city             = city;
    if (propertyType)     filter.propertyType     = propertyType;
    if (genderPreference) filter.genderPreference = genderPreference;
    if (approvalStatus)   filter.approvalStatus   = approvalStatus;

    const listings = await this.listingService.getAllListings(filter);

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Listings fetched successfully",
          listings,
        ),
      );
  });

  /**
   * GET /api/v1/listings/:listingId
   * Returns a single listing by its ID.
   */
  getListingById = asyncHandler(async (req, res) => {
    const listing = await this.listingService.getListingById(
      req.params.listingId,
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, "Listing fetched successfully", listing),
      );
  });

  /**
   * GET /api/v1/listings/owner/my-listings
   * Returns all listings belonging to the authenticated owner.
   */
  getMyListings = asyncHandler(async (req, res) => {
    const listings = await this.listingService.getOwnerListings(req.user.id);

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Owner listings fetched successfully",
          listings,
        ),
      );
  });

  // ── Availability Toggle ──────────────────────────────────────────────────────

  /**
   * PATCH /api/v1/listings/:listingId/toggle-availability
   * Flips the availabilityStatus boolean on a listing.
   * Only the owner of the listing may perform this action.
   */
  toggleAvailability = asyncHandler(async (req, res) => {
    const updated = await this.listingService.toggleAvailability(
      req.params.listingId,
      req.user.id,
    );

    const status = updated.availabilityStatus ? "available" : "unavailable";

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          `Listing marked as ${status}`,
          updated,
        ),
      );
  });

  // ── Deletion ─────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/v1/listings/:listingId
   * Soft-deletes the listing (sets isDeleted=true, stamps deletedAt).
   * The record is preserved in the DB for audit and potential recovery.
   * Only the owner may soft-delete their own listing.
   */
  softDeleteListing = asyncHandler(async (req, res) => {
    const result = await this.listingService.softDeleteListing(
      req.params.listingId,
      req.user.id,
    );

    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result.message));
  });

  /**
   * DELETE /api/v1/listings/:listingId/permanent
   * Permanently removes a listing from the database (hard delete).
   * This action is irreversible. Restrict this endpoint to admins or
   * owners with appropriate guards at the route level.
   */
  hardDeleteListing = asyncHandler(async (req, res) => {
    const result = await this.listingService.hardDeleteListing(
      req.params.listingId,
      req.user.id,
    );

    res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result.message));
  });

  // ── Tracking Metrics ─────────────────────────────────────────────────────────

  /**
   * GET /api/v1/listings/owner/metrics
   * Returns aggregated tracking metrics for the authenticated owner's listings.
   *
   * Response:
   * {
   *   listings: [{ title, viewsCount, savesCount, inquiriesCount, ... }],
   *   totals: { views, saves, inquiries, totalListings, activeListings }
   * }
   */
  getOwnerMetrics = asyncHandler(async (req, res) => {
    const metrics = await this.listingService.getOwnerTrackingMetrics(
      req.user.id,
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Owner tracking metrics fetched successfully",
          metrics,
        ),
      );
  });

  /**
   * PATCH /api/v1/listings/:listingId/metrics/:field
   * Increments a specific tracking metric (viewsCount | savesCount | inquiriesCount).
   * Typically called internally by event handlers, not directly by the client.
   */
  incrementMetric = asyncHandler(async (req, res) => {
    const { listingId, field } = req.params;

    const updated = await this.listingService.incrementMetric(listingId, field);

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, `${field} incremented`, {
          [field]: updated[field],
        }),
      );
  });
}

export default ListingController;
