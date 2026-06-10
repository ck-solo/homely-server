import MongoFavoriteRepository from "../repositories/implementations/mongoFavoriteRepository.js";
import { AppError } from "../utils/errors.js";

class FavoriteService {
  constructor() {
    this.favoriteRepository = new MongoFavoriteRepository();
  }

  async saveProperty(tenantId, listingId) {
    try {
      return await this.favoriteRepository.createFavorite(tenantId, listingId);
    } catch (error) {
      // Catching either the repository's custom error message or direct MongoDB duplicate key error
      if (error.message === "This property is already bookmarked by the tenant" || error.code === 11000) {
        throw new AppError("Property already saved", 409);
      }
      throw error;
    }
  }

  async removeSavedProperty(tenantId, listingId) {
    const deletedFavorite = await this.favoriteRepository.deleteFavorite(tenantId, listingId);
    
    if (!deletedFavorite) {
      throw new AppError("Saved property not found", 404);
    }
    
    return deletedFavorite;
  }

  async getSavedProperties(tenantId) {
    return await this.favoriteRepository.getFavoritesByTenantId(tenantId);
  }
}

export default FavoriteService;
