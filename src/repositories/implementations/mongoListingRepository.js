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

  async update(id, listingData) {
    return this.updateById(id, listingData);
  }

  async updateById(id, listingData) {
    return Listing.findByIdAndUpdate(id, listingData, { new: true, runValidators: true });
  }

  async delete(id) {
    return this.deleteById(id);
  }

  async deleteById(id) {
    return Listing.findByIdAndDelete(id);
  }

  /**
   * Searches listings with filters and pagination.
   * @param {Object} filters - Search filters
   * @param {Object} pagination - { page, limit }
   * @returns {Promise<{ data: Array, total: number, page: number, limit: number }>}
   */
  async search(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = {};

    // Full-text search across title, description, city (uses text index)
    if (filters.keyword) {
      query.$text = { $search: filters.keyword };
    }

    // City filter (case-insensitive partial match as fallback when no keyword)
    if (filters.city && !filters.keyword) {
      query.city = { $regex: new RegExp(filters.city, "i") };
    }

    // Rent budget range
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      query.rentBudget = {};
      if (filters.minBudget !== undefined) {
        query.rentBudget.$gte = Number(filters.minBudget);
      }
      if (filters.maxBudget !== undefined) {
        query.rentBudget.$lte = Number(filters.maxBudget);
      }
    }

    // Property type filter (supports multiple: "PG,Flat")
    if (filters.propertyType) {
      const types = Array.isArray(filters.propertyType)
        ? filters.propertyType
        : [filters.propertyType];
      query.propertyType = { $in: types };
    }

    // Gender preference filter (supports multiple: "Male,Co-ed")
    if (filters.genderPreference) {
      const genders = Array.isArray(filters.genderPreference)
        ? filters.genderPreference
        : [filters.genderPreference];
      query.genderPreference = { $in: genders };
    }

    // Only show available & approved listings in search
    query.availabilityStatus = true;
    query.approvalStatus = "APPROVED";

    const [data, total] = await Promise.all([
      Listing.find(query)
        .populate("ownerRef", "name email phone")
        .sort(filters.keyword ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }
}

export default MongoListingRepository;
