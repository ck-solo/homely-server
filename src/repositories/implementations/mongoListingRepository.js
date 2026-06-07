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
   * Updates a listing by its MongoDB ObjectId.
   * @param {string} id - Listing ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} Updated listing document or null
   */
  async update(id, updateData) {
    return Listing.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("ownerRef", "name email phone");
  }

  /**
   * Finds all listings owned by a specific user.
   * @param {string} ownerRefId - Owner's User ObjectId
   * @returns {Promise<Array>} Array of listing documents
   */
  async findByOwner(ownerRefId) {
    return Listing.find({ ownerRef: ownerRefId }).populate(
      "ownerRef",
      "name email phone",
    );
  }
}

export default MongoListingRepository;
