import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

class SearchController {
  /**
   * @param {import('../services/search.service.js').default} searchService
   */
  constructor(searchService) {
    this.searchService = searchService;
  }

  /**
   * Handles public listing searches
   */
  searchListings = asyncHandler(async (req, res) => {
    // Parse URL parameters from req.query and pipe them straight into the service layer
    const result = await this.searchService.searchListings(req.query);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Listings retrieved successfully", result)
    );
  });
}

export default SearchController;
