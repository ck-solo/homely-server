import IListingRepository from "../contracts/IListingRepository.js";
import Listing from "../../models/listing.model.js";

class MongoListingRepository extends IListingRepository {
  /**
   * Creates a new listing document.
   * @param {Object} listingData - Listing fields
   * @returns {Promise<Object>} Created listing document
   */
  async create(listingData) {
    const listing = new Listing(listingData);
    return listing.save();
  }

  /**
   * Finds a listing by its MongoDB ObjectId.
   * @param {string} id
   * @returns {Promise<Object|null>} Listing document or null
   */
  async findById(id) {
    return Listing.findById(id).populate("ownerRef", "name email phone");
  }

  /**
   * Finds all listings matching the query.
   * @param {Object} query - Mongoose query object
   * @returns {Promise<Array>} Array of listing documents
   */
  async findAll(query = {}) {
    return Listing.find(query).populate("ownerRef", "name email phone");
  }

  /**
   * Search listings using a dynamic lookup query and aggregation pipeline.
   * Builds a clean Mongoose query object for the match stage and uses $facet
   * to combine data and metadata (total count) concurrent queries into one
   * paginated array database response.
   * 
   * @param {Object} filters - Filter parameters (city, minBudget, maxBudget, propertyType, genderPreference)
   * @param {Object} pagination - Pagination options (page, limit)
   * @returns {Promise<Array>} Paginated array database response from $facet
   */
  async search(filters = {}, pagination = {}) {
    // Build a clean Mongoose query object
    const query = { availabilityStatus: true };

    if (filters.city) {
      query.city = { $regex: new RegExp(filters.city, "i") };
    }

    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      query.rentBudget = {};
      if (filters.minBudget !== undefined) query.rentBudget.$gte = Number(filters.minBudget);
      if (filters.maxBudget !== undefined) query.rentBudget.$lte = Number(filters.maxBudget);
    }

    if (filters.propertyType) {
      const types = Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType];
      if (types.length > 0) {
        query.propertyType = { $in: types };
      }
    }

    if (filters.genderPreference) {
      const genders = Array.isArray(filters.genderPreference) ? filters.genderPreference : [filters.genderPreference];
      if (genders.length > 0) {
        query.genderPreference = { $in: genders };
      }
    }

    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // High-performance search pipeline query
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [
            { $count: "totalCount" },
            {
              $addFields: {
                page: page,
                limit: limit,
                totalPages: { $ceil: { $divide: ["$totalCount", limit] } }
              }
            }
          ],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "ownerRef",
                foreignField: "_id",
                as: "ownerRef"
              }
            },
            {
              $unwind: {
                path: "$ownerRef",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "ownerRef.password": 0,
                "ownerRef.role": 0,
                "ownerRef.accountStatus": 0,
                "ownerRef.isEmailVerified": 0,
                "ownerRef.createdAt": 0,
                "ownerRef.updatedAt": 0,
                "ownerRef.__v": 0
              }
            }
          ]
        }
      }
    ];

    return Listing.aggregate(pipeline);
  }
}

export default MongoListingRepository;
