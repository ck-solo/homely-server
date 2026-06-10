import IFavoriteRepository from "../contracts/IFavoriteRepository.js";
import Favorite from "../../models/favorite.model.js";

class MongoFavoriteRepository extends IFavoriteRepository {
  /**
   * Creates a new favorite entry.
   * @param {string} tenantId - Tenant ObjectId
   * @param {string} listingId - Listing ObjectId
   * @returns {Promise<Object>} Created favorite document
   */
  async createFavorite(tenantId, listingId) {
    try {
      const favorite = new Favorite({ tenantId, listingId });
      return await favorite.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("This property is already bookmarked by the tenant");
      }
      throw error;
    }
  }

  /**
   * Removes a favorite using both tenantId and listingId.
   * @param {string} tenantId - Tenant ObjectId
   * @param {string} listingId - Listing ObjectId
   * @returns {Promise<Object|null>} Deleted favorite document or null
   */
  async deleteFavorite(tenantId, listingId) {
    return Favorite.findOneAndDelete({ tenantId, listingId });
  }

  /**
   * Returns all bookmarked listings for a tenant.
   * @param {string} tenantId - Tenant ObjectId
   * @returns {Promise<Array>} Array of favorite documents with populated listingId
   */
  async getFavoritesByTenantId(tenantId) {
    return Favorite.find({ tenantId }).populate("listingId");
  }
}

export default MongoFavoriteRepository;
