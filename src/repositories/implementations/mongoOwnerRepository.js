import OwnerProfile from "../../models/owner.model.js"; // Adjust paths as needed

class MongoOwnerRepository {
  async findByUserId(userId) {
    return await OwnerProfile.findOne({ userRef: userId }).populate("userRef", "-password");
  }

  async createProfile(profileData) {
    const profile = new OwnerProfile(profileData);
    return await profile.save();
  }

  async updateProfileByUserId(userId, updateData) {
    return await OwnerProfile.findOneAndUpdate(
      { userRef: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userRef", "-password");
  }

  async deleteProfileByUserId(userId) {
    return await OwnerProfile.findOneAndDelete({ userRef: userId });
  }
}

export default MongoOwnerRepository;