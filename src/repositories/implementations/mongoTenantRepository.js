import ITenantRepository from "../contracts/ITenantRepository.js";
import TenantProfile from "../../models/tenant.model.js"; // Adjust paths as needed

class MongoTenantRepository extends ITenantRepository {
  /**
   * Finds a tenant profile by the associated User ID.
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return TenantProfile.findOne({ userRef: userId }).populate("userRef", "-password");
  }

  /**
   * Creates a new tenant profile.
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  async createProfile(profileData) {
    const profile = new TenantProfile(profileData);
    return profile.save();
  }

  /**
   * Updates a tenant profile by the associated User ID.
   * @param {string} userId 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  async updateProfileByUserId(userId, updateData) {
    return TenantProfile.findOneAndUpdate(
      { userRef: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userRef", "-password");
  }

  /**
   * Deletes a tenant profile by the associated User ID.
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async deleteProfileByUserId(userId) {
    return TenantProfile.findOneAndDelete({ userRef: userId });
  }

  /**
   * Finds roommates/tenants listed in a specific city.
   * @param {string} city 
   * @returns {Promise<Array>}
   */
  async findByCity(city) {
    return TenantProfile.find({ city }).populate("userRef", "-password");
  }
}

export default MongoTenantRepository;