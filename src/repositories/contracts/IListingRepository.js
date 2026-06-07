/**
 * Listing Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class IListingRepository {
  async create(listingData) {
    throw new Error('Method "create" not implemented');
  }

  async findById(id) {
    throw new Error('Method "findById" not implemented');
  }

  async findAll(query) {
    throw new Error('Method "findAll" not implemented');
  }
}

export default IListingRepository;
