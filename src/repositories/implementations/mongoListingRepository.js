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
}

export default MongoListingRepository;
