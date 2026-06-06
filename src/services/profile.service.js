import uploadFile from "./storage.service.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

class ProfileService {
  /**
   * @param {import('../repositories/contracts/IUserRepository.js').default} userRepository
   * @param {import('../repositories/contracts/ITenantProfileRepository.js').default} tenantProfileRepository
   * @param {import('../repositories/contracts/IOwnerProfileRepository.js').default} ownerProfileRepository
   */
  constructor(userRepository, tenantProfileRepository, ownerProfileRepository) {
    this.userRepository = userRepository;
    this.tenantProfileRepository = tenantProfileRepository;
    this.ownerProfileRepository = ownerProfileRepository;
  }

  /**
   * Updates core user profile and role-specific profile document
   * @param {string} userId - User's unique ObjectId string
   * @param {string} role - User's role ('TENANT' or 'OWNER')
   * @param {Object} updateData - Input payload fields from req.body
   * @param {Buffer|null} fileBuffer - Uploaded profile picture buffer
   * @param {string|null} fileName - Original uploaded filename
   * @returns {Promise<{ user: Object, profile: Object }>}
   */
  async updateProfile(userId, role, updateData, fileBuffer, fileName) {
    // 1. Upload profile picture if provided
    let profilePictureUrl = undefined;
    if (fileBuffer) {
      const uploadResult = await uploadFile(fileBuffer, fileName || "profile-picture");
      if (uploadResult && uploadResult.url) {
        profilePictureUrl = uploadResult.url;
      } else {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to upload profile picture."
        );
      }
    }

    // 2. Separate core User model fields from profile fields
    const { name, phone, ...profileFields } = updateData;

    if (profilePictureUrl !== undefined) {
      profileFields.profilePicture = profilePictureUrl;
    }

    // 3. Update User Document (name/phone)
    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;

    let updatedUser = null;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await this.userRepository.updateProfile(userId, userUpdates);
      if (!updatedUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
      }
    } else {
      updatedUser = await this.userRepository.findById(userId);
      if (!updatedUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
      }
    }

    // 4. Update/Upsert the appropriate profile schema
    let updatedProfile = null;
    if (role === "TENANT") {
      // Parse nested objects and arrays if transmitted as strings
      if (typeof profileFields.roommatePreferences === "string") {
        try {
          profileFields.roommatePreferences = JSON.parse(profileFields.roommatePreferences);
        } catch (e) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid format for roommatePreferences");
        }
      }
      if (typeof profileFields.lifestyleDetails === "string") {
        try {
          profileFields.lifestyleDetails = JSON.parse(profileFields.lifestyleDetails);
        } catch (e) {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid format for lifestyleDetails");
        }
      }

      updatedProfile = await this.tenantProfileRepository.upsertProfile(userId, profileFields);
    } else if (role === "OWNER") {
      updatedProfile = await this.ownerProfileRepository.upsertProfile(userId, profileFields);
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Profiles are not supported for role: ${role}`);
    }

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  }
}

export default ProfileService;
