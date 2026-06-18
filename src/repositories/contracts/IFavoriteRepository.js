/**
 * Favorite Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class IFavoriteRepository {
  async createFavorite(tenantId, listingId) {
    throw new Error('Method "createFavorite" not implemented');
  }

  async deleteFavorite(tenantId, listingId) {
    throw new Error('Method "deleteFavorite" not implemented');
  }

  async getFavoritesByTenantId(tenantId) {
    throw new Error('Method "getFavoritesByTenantId" not implemented');
  }

  async findFavorite(tenantId, listingId) {
    throw new Error('Method "findFavorite" not implemented');
  }
}

export default IFavoriteRepository;
