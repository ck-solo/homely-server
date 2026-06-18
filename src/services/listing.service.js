import MongoListingRepository from "../repositories/implementations/mongoListingRepository.js";

class ListingService {
  constructor() {
    this.listingRepository = new MongoListingRepository();
  }

  async createListing(data, ownerId) {
    return this.listingRepository.create({
      ...data,
      ownerRef: ownerId,
    });
  }

  async getListingById(id) {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new Error("Listing not found");
    }

    return listing;
  }

  async getAllListings(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const listings = await this.listingRepository.findAll();

    return {
      page,
      limit,
      total: listings.length,
      data: listings.slice(skip, skip + limit),
    };
  }

  async updateListing(id, ownerId, updateData) {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerRef._id.toString() !== ownerId.toString()) {
      throw new Error("Unauthorized");
    }

    return this.listingRepository.updateById(id, updateData);
  }

  async deleteListing(id, ownerId) {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerRef._id.toString() !== ownerId.toString()) {
      throw new Error("Unauthorized");
    }

    return this.listingRepository.deleteById(id);
  }

  /**
   * Search and filter listings with query parameters.
   * Supports: keyword search, city, rent range, property type, gender preference.
   * @param {Object} queryParams - Query parameters from req.query
   * @returns {Promise<{ data: Array, total: number, page: number, limit: number }>}
   */
  async searchListings(queryParams) {
    const { search, city, minRent, maxRent, type, gender, page, limit } =
      queryParams;

    const filters = {};

    // Keyword search (uses MongoDB text index on title, description, city)
    if (search) {
      filters.keyword = search;
    }

    // City filter (used when no keyword search is active)
    if (city) {
      filters.city = city;
    }

    // Rent budget range
    if (minRent !== undefined) {
      filters.minBudget = minRent;
    }
    if (maxRent !== undefined) {
      filters.maxBudget = maxRent;
    }

    // Property type filter (comma-separated: "PG,Flat")
    if (type) {
      filters.propertyType = type.split(",").map((t) => t.trim());
    }

    // Gender preference filter (comma-separated: "Male,Co-ed")
    if (gender) {
      filters.genderPreference = gender.split(",").map((g) => g.trim());
    }

    const pagination = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 12,
    };

    return this.listingRepository.search(filters, pagination);
  }
}

export default new ListingService();
