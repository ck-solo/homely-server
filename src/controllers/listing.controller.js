import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

class ListingController {
  /**
   * @param {import('../services/listing.service.js').default} listingService
   */
  constructor(listingService) {
    this.listingService = listingService;
  }

  /**
   * POST /api/v1/listings
   * Creates a new listing. Restricted to OWNER role.
   */
  createListing = asyncHandler(async (req, res) => {
    const ownerUserId = req.user.id;
    const files = req.files || [];

    const listing = await this.listingService.createListing(
      ownerUserId,
      req.body,
      files,
    );

    res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, "Listing created successfully", {
        listing,
      }),
    );
  });

  /**
   * PUT /api/v1/listings/:id
   * Updates an existing listing. Restricted to OWNER role.
   * Only the owner who created the listing can update it.
   */
  updateListing = asyncHandler(async (req, res) => {
    const ownerUserId = req.user.id;
    const listingId = req.params.id;
    const files = req.files || [];

    const listing = await this.listingService.updateListing(
      listingId,
      ownerUserId,
      req.body,
      files,
    );

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Listing updated successfully", {
        listing,
      }),
    );
  });

  /**
   * GET /api/v1/listings/:id
   * Gets a single listing by ID. Public endpoint.
   */
  getListingById = asyncHandler(async (req, res) => {
    const listing = await this.listingService.getListingById(req.params.id);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Listing fetched successfully", {
        listing,
      }),
    );
  });

  /**
   * GET /api/v1/listings/my-listings
   * Gets all listings for the authenticated owner.
   */
  getMyListings = asyncHandler(async (req, res) => {
    const listings = await this.listingService.getMyListings(req.user.id);

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Your listings fetched successfully", {
        listings,
        count: listings.length,
      }),
    );
  });

  /**
   * GET /api/v1/listings
   * Gets all approved listings. Public endpoint for tenants browsing.
   */
  getAllListings = asyncHandler(async (req, res) => {
    const listings = await this.listingService.getAllListings();

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Listings fetched successfully", {
        listings,
        count: listings.length,
      }),
    );
  });
}

export default ListingController;
