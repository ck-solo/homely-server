import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

class ProfileController {
  /**
   * @param {import('../services/profile.service.js').default} profileService
   */
  constructor(profileService) {
    this.profileService = profileService;
  }

  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    const result = await this.profileService.getProfile(userId, role);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Profile fetched successfully", result)
    );
  });

  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    const fileBuffer = req.file ? req.file.buffer : null;
    const fileName = req.file ? req.file.originalname : null;

    const result = await this.profileService.updateProfile(
      userId,
      role,
      req.body,
      fileBuffer,
      fileName
    );

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Profile updated successfully", result)
    );
  });
}

export default ProfileController;