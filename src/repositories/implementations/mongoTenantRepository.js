import TenantProfile from "../../models/tenant.model.js"; // Adjust paths as needed

class MongoTenantRepository {
  async findByUserId(userId) {
    return await TenantProfile.findOne({ userRef: userId }).populate("userRef", "-password");
  }

  async createProfile(profileData) {
    const profile = new TenantProfile(profileData);
    return await profile.save();
  }

  async updateProfileByUserId(userId, updateData) {
    return await TenantProfile.findOneAndUpdate(
      { userRef: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userRef", "-password");
  }

  async deleteProfileByUserId(userId) {
    return await TenantProfile.findOneAndDelete({ userRef: userId });
  }

  // Handy feature helper for later: find roommates in the same city
  async findByCity(city) {
    return await TenantProfile.find({ city }).populate("userRef", "-password");
  }
}

export default MongoTenantRepository;