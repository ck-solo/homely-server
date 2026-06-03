import MongoOwnerRepository from "../repositories/implementations/mongoOwnerRepository.js";
import MongoUserRepository from "../repositories/implementations/mongoUserRepository.js";
import { AppError } from "../utils/errors.js";

class OwnerService {
  constructor() {
    this.ownerRepository = new MongoOwnerRepository();
    this.userRepository = new MongoUserRepository();
  }

  async createOwnerProfile(userId, ownerData) {
    // 1. Ensure core user exists and has the correct role
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 2. Prevent duplicate profile creation
    const existingProfile = await this.ownerRepository.findByUserId(userId);
    if (existingProfile) {
      throw new AppError("Owner profile already exists for this user", 409);
    }

    // 3. Assemble profile structure matching your schema
    const profilePayload = {
      userRef: userId,
      businessName: ownerData.businessName,
      businessDetails: ownerData.businessDetails,
      profilePicture: ownerData.profilePicture,
    };

    return await this.ownerRepository.createProfile(profilePayload);
  }

  async getOwnerProfile(userId) {
    const profile = await this.ownerRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Owner profile not found", 404);
    }
    return profile;
  }

  async updateOwnerProfile(userId, updateData) {
    // Prevent modification of immutable references via updates
    delete updateData.userRef;

    const profile = await this.ownerRepository.updateProfileByUserId(userId, updateData);
    if (!profile) {
      throw new AppError("Owner profile not found", 404);
    }
    return profile;
  }

  async deleteOwnerProfile(userId) {
    const profile = await this.ownerRepository.deleteProfileByUserId(userId);
    if (!profile) {
      throw new AppError("Owner profile not found", 404);
    }
    return { message: "Owner profile deleted successfully" };
  }
}

export default OwnerService;