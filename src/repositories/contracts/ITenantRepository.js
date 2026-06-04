/**
 * Tenant Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class ITenantRepository {
  async findById(tenantId) {
    throw new Error('Method "findById" not implemented');
  }

  async findByUserId(userId) {
    throw new Error('Method "findByUserId" not implemented');
  }

  async create(tenantData) {
    throw new Error('Method "create" not implemented');
  }

  async updateLeaseInfo(tenantId, leaseData) {
    throw new Error('Method "updateLeaseInfo" not implemented');
  }

  async getPropertiesRented(tenantId) {
    throw new Error('Method "getPropertiesRented" not implemented');
  }
}

export default ITenantRepository;