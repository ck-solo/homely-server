import IOwnerProfileRepository from "../contracts/IOwnerProfileRepository.js";
import OwnerProfile from "../../models/owner.model.js";

class MongoOwnerProfileRepository extends IOwnerProfileRepository {
  /**
   * Finds an owner profile by the associated user ref.
   * @param {string} userRef - User's MongoDB ObjectId string
   * @returns {Promise<Object|null>} Owner profile document or null
   */
  async findByUserRef(userRef) {
    return OwnerProfile.findOne({ userRef });
  }

  /**
   * Updates or inserts (upserts) the owner profile.
   * @param {string} userRef - User's MongoDB ObjectId string
   * @param {Object} profileData - Owner profile fields to set
   * @returns {Promise<Object>} The updated or created owner profile document
   */
  async upsertProfile(userRef, profileData) {
    return OwnerProfile.findOneAndUpdate(
      { userRef },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );
  }
}

export default MongoOwnerProfileRepository;
