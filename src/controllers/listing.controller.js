import listingService from "../services/listing.service.js";
import { uploadToS3 } from "../services/s3.service.js";

export const createListing = async (req, res, next) => {
  try {
    console.log("Multer Files:", req.files);
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file, req.user.id);
        imageUrls.push(url);
      }
    }
    // Put uploaded S3 URLs in req.body.images for the validator and listing creation
    req.body.images = imageUrls;

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
    console.log("Multer Files (Update):", req.files);
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file, req.user.id);
        imageUrls.push(url);
      }
    }

    // Combine existing images (sent in body) and new S3 image URLs
    let existingImages = req.body.images || [];
    if (typeof existingImages === "string") {
      try {
        existingImages = JSON.parse(existingImages);
      } catch (e) {
        existingImages = [existingImages];
      }
    }
    req.body.images = [...existingImages, ...imageUrls];

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