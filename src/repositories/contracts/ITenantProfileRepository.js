/**
 * Tenant Profile Repository Contract (Interface).
 * All methods must be implemented by concrete repository classes.
 */
class ITenantProfileRepository {
  async findByUserRef(userRef) {
    throw new Error('Method "findByUserRef" not implemented');
  }

  async upsertProfile(userRef, profileData) {
    throw new Error('Method "upsertProfile" not implemented');
  }
}

export default ITenantProfileRepository;
