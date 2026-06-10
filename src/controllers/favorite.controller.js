import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

class FavoriteController {
  /**
   * @param {import('../services/favorite.service.js').default} favoriteService
   */
  constructor(favoriteService) {
    this.favoriteService = favoriteService;
  }

  saveProperty = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Tenant profile not found. Please create a tenant profile first."
      );
    }

    const { listingId } = req.body;
    if (!listingId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Listing ID is required"
      );
    }

    const favorite = await this.favoriteService.saveProperty(tenantId, listingId);

    res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, "Property bookmarked successfully", favorite)
    );
  });

  removeSavedProperty = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Tenant profile not found. Please create a tenant profile first."
      );
    }

    const { listingId } = req.params;
    if (!listingId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Listing ID is required"
      );
    }

    const deletedFavorite = await this.favoriteService.removeSavedProperty(tenantId, listingId);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Bookmark removed successfully", deletedFavorite)
    );
  });

  getSavedProperties = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Tenant profile not found. Please create a tenant profile first."
      );
    }

    const favorites = await this.favoriteService.getSavedProperties(tenantId);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Bookmarked properties fetched successfully", favorites)
    );
  });
}

export default FavoriteController;
