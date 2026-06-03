import IOwnerRepository from "../contracts/IOwnerRepository.js";
import OwnerProfile from "../../models/owner.model.js"; // Adjust paths as needed

class MongoOwnerRepository extends IOwnerRepository {
  /**
   * Finds an owner profile by the associated User ID.
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return OwnerProfile.findOne({ userRef: userId }).populate("userRef", "-password");
  }

  /**
   * Creates a new owner profile.
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  async createProfile(profileData) {
    const profile = new OwnerProfile(profileData);
    return profile.save();
  }

  /**
   * Updates an owner profile by the associated User ID.
   * @param {string} userId 
   * @param {Object} updateData 
   * @returns {Promise<Object|null>}
   */
  async updateProfileByUserId(userId, updateData) {
    return OwnerProfile.findOneAndUpdate(
      { userRef: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userRef", "-password");
  }

  /**
   * Deletes an owner profile by the associated User ID.
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async deleteProfileByUserId(userId) {
    return OwnerProfile.findOneAndDelete({ userRef: userId });
  }
}

export default MongoOwnerRepository;