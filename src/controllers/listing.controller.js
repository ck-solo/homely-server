import listingService from "../services/listing.service.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await listingService.createListing(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id);

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllListings = async (req, res, next) => {
  try {
    const { search, city, minRent, maxRent, type, gender } = req.query;

    // If any search/filter params are present, use searchListings
    const hasFilters = search || city || minRent || maxRent || type || gender;

    if (hasFilters) {
      const results = await listingService.searchListings(req.query);

      return res.status(200).json({
        success: true,
        ...results,
      });
    }

    // Default: return all listings with pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const listings = await listingService.getAllListings(
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...listings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    await listingService.deleteListing(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};