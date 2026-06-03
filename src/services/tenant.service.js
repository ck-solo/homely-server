import MongoTenantRepository from "../repositories/implementations/mongoTenantRepository.js";
import MongoUserRepository from "../repositories/implementations/mongoUserRepository.js";
import { AppError } from "../utils/errors.js";

class TenantService {
  constructor() {
    this.tenantRepository = new MongoTenantRepository();
    this.userRepository = new MongoUserRepository();
  }

  async createTenantProfile(userId, tenantData) {
    // 1. Verify core user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 2. Prevent duplicate profile creation
    const existingProfile = await this.tenantRepository.findByUserId(userId);
    if (existingProfile) {
      throw new AppError("Tenant profile already exists for this user", 409);
    }

    // 🔥 Schema Validation Guard: Pre-validation logic for budget check safely handled in the service level
    if (
      tenantData.roommatePreferences?.budget?.max < tenantData.roommatePreferences?.budget?.min
    ) {
      throw new AppError("Maximum budget preference cannot be less than minimum budget preference", 400);
    }

    // 3. Assemble profile data matching your nested schema design
    const profilePayload = {
      userRef: userId,
      bio: tenantData.bio,
      occupation: tenantData.occupation,
      city: tenantData.city,
      gender: tenantData.gender,
      age: tenantData.age,
      profilePicture: tenantData.profilePicture,
      roommatePreferences: tenantData.roommatePreferences || {},
    };

    return await this.tenantRepository.createProfile(profilePayload);
  }

  async getTenantProfile(userId) {
    const profile = await this.tenantRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Tenant profile not found", 404);
    }
    return profile;
  }

  async updateTenantProfile(userId, updateData) {
    delete updateData.userRef; // Guard item

    // Validate nested budget if it's being updated
    if (
      updateData.roommatePreferences?.budget?.max < updateData.roommatePreferences?.budget?.min
    ) {
      throw new AppError("Maximum budget preference cannot be less than minimum budget preference", 400);
    }

    const profile = await this.tenantRepository.updateProfileByUserId(userId, updateData);
    if (!profile) {
      throw new AppError("Tenant profile not found", 404);
    }
    return profile;
  }

  async getTenantsByCity(city) {
    return await this.tenantRepository.findByCity(city);
  }

  async deleteTenantProfile(userId) {
    const profile = await this.tenantRepository.deleteProfileByUserId(userId);
    if (!profile) {
      throw new AppError("Tenant profile not found", 404);
    }
    return { message: "Tenant profile deleted successfully" };
  }
}

export default TenantService;