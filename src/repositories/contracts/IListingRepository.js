/**
 * Listing Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class IListingRepository {
  /**
   * Creates a new listing document.
   * @param {Object} listingData
   * @returns {Promise<Object>}
   */
  async create(listingData) {
    throw new Error('Method "create" not implemented');
  }

  /**
   * Finds a single listing by its MongoDB ObjectId.
   * Excludes soft-deleted documents by default.
   * @param {string} listingId
   * @returns {Promise<Object|null>}
   */
  async findById(listingId) {
    throw new Error('Method "findById" not implemented');
  }

  /**
   * Finds a listing by ID regardless of its soft-delete state.
   * Use ONLY for hard-delete ownership checks.
   * @param {string} listingId
   * @returns {Promise<Object|null>}
   */
  async findByIdIncludingDeleted(listingId) {
    throw new Error('Method "findByIdIncludingDeleted" not implemented');
  }

  /**
   * Returns all active (non-deleted) listings.
   * @param {Object} [filter={}] - Optional filter criteria
   * @returns {Promise<Object[]>}
   */
  async findAll(filter) {
    throw new Error('Method "findAll" not implemented');
  }

  /**
   * Returns all listings belonging to a specific owner.
   * @param {string} ownerId
   * @returns {Promise<Object[]>}
   */
  async findByOwner(ownerId) {
    throw new Error('Method "findByOwner" not implemented');
  }

  /**
   * Flips the availabilityStatus boolean of a listing.
   * @param {string} listingId
   * @returns {Promise<Object|null>} Updated listing document
   */
  async toggleAvailability(listingId) {
    throw new Error('Method "toggleAvailability" not implemented');
  }

  /**
   * Soft-deletes a listing by setting isDeleted=true and recording deletedAt.
   * @param {string} listingId
   * @returns {Promise<Object|null>} Updated listing document
   */
  async softDelete(listingId) {
    throw new Error('Method "softDelete" not implemented');
  }

  /**
   * Permanently removes a listing document from the database.
   * @param {string} listingId
   * @returns {Promise<Object|null>} Deleted listing document
   */
  async hardDelete(listingId) {
    throw new Error('Method "hardDelete" not implemented');
  }

  /**
   * Returns aggregated tracking metrics for all listings owned by a user.
   * Includes per-listing viewsCount, savesCount, inquiriesCount, and totals.
   * @param {string} ownerId
   * @returns {Promise<Object>} Aggregation result
   */
  async getOwnerTrackingMetrics(ownerId) {
    throw new Error('Method "getOwnerTrackingMetrics" not implemented');
  }

  /**
   * Atomically increments a numeric tracking metric field on a listing.
   * @param {string} listingId
   * @param {"viewsCount"|"savesCount"|"inquiriesCount"} field
   * @returns {Promise<Object|null>}
   */
  async incrementMetric(listingId, field) {
    throw new Error('Method "incrementMetric" not implemented');
  }
}

export default IListingRepository;
