import ITenantProfileRepository from "../contracts/ITenantProfileRepository.js";
import TenantProfile from "../../models/tenant.model.js";

class MongoTenantProfileRepository extends ITenantProfileRepository {
  /**
   * Finds a tenant profile by the associated user ref.
   * @param {string} userRef - User's MongoDB ObjectId string
   * @returns {Promise<Object|null>} Tenant profile document or null
   */
  async findByUserRef(userRef) {
    return TenantProfile.findOne({ userRef });
  }

  /**
   * Updates or inserts (upserts) the tenant profile.
   * @param {string} userRef - User's MongoDB ObjectId string
   * @param {Object} profileData - Tenant profile fields to set
   * @returns {Promise<Object>} The updated or created tenant profile document
   */
  async upsertProfile(userRef, profileData) {
    return TenantProfile.findOneAndUpdate(
      { userRef },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );
  }
}

export default MongoTenantProfileRepository;
