/**
 * Owner Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class IOwnerRepository {
  async findById(ownerId) {
    throw new Error('Method "findById" not implemented');
  }

  async findByUserId(userId) {
    throw new Error('Method "findByUserId" not implemented');
  }

  async create(ownerData) {
    throw new Error('Method "create" not implemented');
  }

  async getOwnedProperties(ownerId) {
    throw new Error('Method "getOwnedProperties" not implemented');
  }

  async updateBusinessDetails(ownerId, businessData) {
    throw new Error('Method "updateBusinessDetails" not implemented');
  }
}

export default IOwnerRepository;