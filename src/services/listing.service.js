import mongoose from "mongoose";
import MongoListingRepository from "../repositories/implementations/mongoListingRepository.js";
import ApiError from "../utils/ApiError.js";

/** Validates a listingId and throws 400 if it is not a valid MongoDB ObjectId. */
function assertValidObjectId(id, label = "listing ID") {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} format`);
  }
}

class ListingService {
  constructor() {
    this.listingRepository = new MongoListingRepository();
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  /**
   * Creates a new rental listing.
   * Associates the listing with the authenticated owner (ownerRef).
   *
   * @param {string} ownerId - The authenticated user's ID (must be an OWNER)
   * @param {Object} listingData - Validated listing payload from the controller
   * @returns {Promise<Object>} Newly created listing document
   */
  async createListing(ownerId, listingData) {
    const payload = { ...listingData, ownerRef: ownerId };
    return this.listingRepository.create(payload);
  }

  // ── Read ─────────────────────────────────────────────────────────────────────

  /**
   * Fetches a single listing by ID.
   * Throws 404 if the listing does not exist or has been soft-deleted.
   *
   * @param {string} listingId
   * @returns {Promise<Object>}
   */
  async getListingById(listingId) {
    assertValidObjectId(listingId);
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    return listing;
  }

  /**
   * Returns all active listings, with optional filter criteria.
   *
   * @param {Object} [filter={}]
   * @returns {Promise<Object[]>}
   */
  async getAllListings(filter = {}) {
    return this.listingRepository.findAll(filter);
  }

  /**
   * Returns all non-deleted listings for a specific owner.
   *
   * @param {string} ownerId
   * @returns {Promise<Object[]>}
   */
  async getOwnerListings(ownerId) {
    return this.listingRepository.findByOwner(ownerId);
  }

  // ── Availability Toggle ──────────────────────────────────────────────────────

  /**
   * Toggles the availabilityStatus boolean on a listing.
   *
   * Only the owner of the listing is permitted to toggle it. This is an
   * atomic operation — no race conditions between read and write.
   *
   * @param {string} listingId
   * @param {string} requestingOwnerId - The ID of the user making the request
   * @returns {Promise<Object>} Updated listing with flipped availabilityStatus
   */
  async toggleAvailability(listingId, requestingOwnerId) {
    assertValidObjectId(listingId);
    // Confirm listing exists and belongs to this owner before mutating
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    if (listing.ownerRef._id.toString() !== requestingOwnerId.toString()) {
      throw new ApiError(
        403,
        "Forbidden: You do not own this listing",
      );
    }

    const updated = await this.listingRepository.toggleAvailability(listingId);
    return updated;
  }

  // ── Deletion ─────────────────────────────────────────────────────────────────

  /**
   * Soft-deletes a listing by marking it as deleted without removing the DB record.
   * Preserves the document for audit trails and potential recovery.
   *
   * @param {string} listingId
   * @param {string} requestingOwnerId
   * @returns {Promise<{ message: string }>}
   */
  async softDeleteListing(listingId, requestingOwnerId) {
    assertValidObjectId(listingId);
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    if (listing.ownerRef._id.toString() !== requestingOwnerId.toString()) {
      throw new ApiError(403, "Forbidden: You do not own this listing");
    }

    // Check the result — null means it was already soft-deleted between our
    // findById check and the update (race condition) or the filter missed it.
    const result = await this.listingRepository.softDelete(listingId);
    if (!result) {
      throw new ApiError(404, "Listing not found or has already been deleted");
    }

    return { message: "Listing deactivated and soft-deleted successfully" };
  }

  /**
   * Permanently removes a listing from the database.
   * This action is irreversible and should be restricted to admins or
   * the owner when soft-delete is insufficient (e.g. GDPR erasure).
   *
   * @param {string} listingId
   * @param {string} requestingOwnerId
   * @returns {Promise<{ message: string }>}
   */
  async hardDeleteListing(listingId, requestingOwnerId) {
    assertValidObjectId(listingId);
    // Use findByIdIncludingDeleted so we can permanently erase records that
    // have already been soft-deleted — the normal findById excludes them.
    const listing = await this.listingRepository.findByIdIncludingDeleted(listingId);

    if (!listing) {
      throw new ApiError(404, "Listing not found or has already been permanently deleted");
    }

    if (listing.ownerRef._id.toString() !== requestingOwnerId.toString()) {
      throw new ApiError(403, "Forbidden: You do not own this listing");
    }

    await this.listingRepository.hardDelete(listingId);
    return { message: "Listing permanently deleted" };
  }

  // ── Tracking Metrics ─────────────────────────────────────────────────────────

  /**
   * Returns aggregated tracking metrics for all of an owner's listings.
   *
   * Response shape:
   * {
   *   listings: [{ _id, title, viewsCount, savesCount, inquiriesCount, ... }],
   *   totals: { views, saves, inquiries, totalListings, activeListings }
   * }
   *
   * @param {string} ownerId
   * @returns {Promise<Object>}
   */
  async getOwnerTrackingMetrics(ownerId) {
    return this.listingRepository.getOwnerTrackingMetrics(ownerId);
  }

  /**
   * Increments a single tracking metric on a listing by 1.
   * Used internally by other services/events (e.g. view event, save event).
   *
   * @param {string} listingId
   * @param {"viewsCount"|"savesCount"|"inquiriesCount"} field
   * @returns {Promise<Object>} Updated listing document
   */
  async incrementMetric(listingId, field) {
    assertValidObjectId(listingId);

    // Validate field here (service layer) so invalid input produces a clean
    // ApiError(400) rather than a plain Error from the repo.
    const ALLOWED_METRICS = ["viewsCount", "savesCount", "inquiriesCount"];
    if (!ALLOWED_METRICS.includes(field)) {
      throw new ApiError(
        400,
        `Invalid metric field: "${field}". Allowed values: ${ALLOWED_METRICS.join(", ")}`,
      );
    }

    const listing = await this.listingRepository.incrementMetric(listingId, field);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    return listing;
  }
}

export default ListingService;
