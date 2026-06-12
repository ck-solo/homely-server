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
}

export default new ListingService();