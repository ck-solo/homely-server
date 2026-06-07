import mongoose from "mongoose";
import IListingRepository from "../contracts/IListingRepository.js";
import Listing from "../../models/listing.model.js";

class MongoListingRepository extends IListingRepository {
  /**
   * Creates and persists a new listing.
   * @param {Object} listingData
   * @returns {Promise<Object>}
   */
  async create(listingData) {
    const listing = new Listing(listingData);
    return listing.save();
  }

  /**
   * Finds a single non-deleted listing by ID, populating owner details.
   * @param {string} listingId
   * @returns {Promise<Object|null>}
   */
  async findById(listingId) {
    return Listing.findOne({ _id: listingId, isDeleted: false }).populate(
      "ownerRef",
      "name email phone",
    );
  }

  /**
   * Finds a listing by ID regardless of soft-delete state.
   * Used exclusively by hardDeleteListing to perform the ownership check
   * before permanent erasure — even on already-soft-deleted records.
   * @param {string} listingId
   * @returns {Promise<Object|null>}
   */
  async findByIdIncludingDeleted(listingId) {
    return Listing.findById(listingId).populate("ownerRef", "name email phone");
  }

  /**
   * Returns all non-deleted listings, optionally filtered.
   * @param {Object} [filter={}]
   * @returns {Promise<Object[]>}
   */
  async findAll(filter = {}) {
    return Listing.find({ ...filter, isDeleted: false })
      .populate("ownerRef", "name email phone")
      .sort({ createdAt: -1 });
  }

  /**
   * Returns all non-deleted listings belonging to a specific owner.
   * @param {string} ownerId
   * @returns {Promise<Object[]>}
   */
  async findByOwner(ownerId) {
    return Listing.find({ ownerRef: ownerId, isDeleted: false })
      .populate("ownerRef", "name email phone")
      .sort({ createdAt: -1 });
  }

  /**
   * Atomically flips the availabilityStatus boolean on a listing.
   * Uses a MongoDB aggregation pipeline update to read the current value
   * and invert it in a single, race-condition-safe operation.
   * @param {string} listingId
   * @returns {Promise<Object|null>} Updated listing document
   */
  async toggleAvailability(listingId) {
    return Listing.findOneAndUpdate(
      { _id: listingId, isDeleted: false },
      [{ $set: { availabilityStatus: { $not: "$availabilityStatus" } } }],
      { new: true },
    ).populate("ownerRef", "name email phone");
  }

  /**
   * Soft-deletes a listing: sets isDeleted=true and stamps deletedAt.
   * The document remains in the DB for audit / recovery purposes.
   * @param {string} listingId
   * @returns {Promise<Object|null>} Updated listing document
   */
  async softDelete(listingId) {
    return Listing.findOneAndUpdate(
      { _id: listingId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );
  }

  /**
   * Permanently removes a listing from the database (hard delete).
   * @param {string} listingId
   * @returns {Promise<Object|null>} The deleted document
   */
  async hardDelete(listingId) {
    return Listing.findByIdAndDelete(listingId);
  }

  /**
   * Aggregation pipeline that computes per-listing and aggregate tracking
   * metrics (views, saves, inquiries) for all listings owned by `ownerId`.
   *
   * Pipeline stages:
   *  1. $match  – filter to this owner's non-deleted listings
   *  2. $project – expose only the metric fields + identifiers
   *  3. $group   – accumulate totals across all listings
   *  4. $lookup  – re-attach the per-listing breakdown
   *
   * @param {string} ownerId
   * @returns {Promise<Object>} { listings: [...], totals: { views, saves, inquiries } }
   */
  async getOwnerTrackingMetrics(ownerId) {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const result = await Listing.aggregate([
      // Stage 1 – narrow to this owner's active listings
      {
        $match: {
          ownerRef: ownerObjectId,
          isDeleted: false,
        },
      },

      // Stage 2 – shape each document for the summary
      {
        $project: {
          _id: 1,
          title: 1,
          city: 1,
          propertyType: 1,
          availabilityStatus: 1,
          approvalStatus: 1,
          rentBudget: 1,
          viewsCount: 1,
          savesCount: 1,
          inquiriesCount: 1,
          createdAt: 1,
        },
      },

      // Stage 3 – aggregate totals while keeping per-listing array
      {
        $group: {
          _id: null,
          listings: { $push: "$$ROOT" },
          totalViews: { $sum: "$viewsCount" },
          totalSaves: { $sum: "$savesCount" },
          totalInquiries: { $sum: "$inquiriesCount" },
          totalListings: { $sum: 1 },
          activeListings: {
            $sum: { $cond: ["$availabilityStatus", 1, 0] },
          },
        },
      },

      // Stage 4 – flatten the output into a clean shape
      {
        $project: {
          _id: 0,
          listings: 1,
          totals: {
            views: "$totalViews",
            saves: "$totalSaves",
            inquiries: "$totalInquiries",
            totalListings: "$totalListings",
            activeListings: "$activeListings",
          },
        },
      },
    ]);

    // If the owner has no listings at all, return safe defaults
    return (
      result[0] ?? {
        listings: [],
        totals: {
          views: 0,
          saves: 0,
          inquiries: 0,
          totalListings: 0,
          activeListings: 0,
        },
      }
    );
  }

  /**
   * Atomically increments a single tracking metric by 1.
   * Safely ignores increments on soft-deleted listings.
   * @param {string} listingId
   * @param {"viewsCount"|"savesCount"|"inquiriesCount"} field
   * @returns {Promise<Object|null>}
   */
  async incrementMetric(listingId, field) {
    const ALLOWED_METRICS = ["viewsCount", "savesCount", "inquiriesCount"];
    if (!ALLOWED_METRICS.includes(field)) {
      throw new Error(`Invalid metric field: ${field}`);
    }

    return Listing.findOneAndUpdate(
      { _id: listingId, isDeleted: false },
      { $inc: { [field]: 1 } },
      { new: true },
    );
  }
}

export default MongoListingRepository;
