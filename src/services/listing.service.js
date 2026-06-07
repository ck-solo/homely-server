import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import uploadFile from "./storage.service.js";

class ListingService {
  /**
   * @param {import('../repositories/contracts/IListingRepository.js').default} listingRepository
   */
  constructor(listingRepository) {
    this.listingRepository = listingRepository;
  }

  /**
   * Creates a new listing tied to the logged-in owner.
   * @param {string} ownerUserId - The authenticated owner's User ObjectId
   * @param {Object} listingData - Form input fields
   * @param {Array} files - Array of multer file objects (images)
   * @returns {Promise<Object>} Created listing document
   */
  async createListing(ownerUserId, listingData, files = []) {
    const {
      title,
      description,
      city,
      longitude,
      latitude,
      rentBudget,
      propertyType,
      genderPreference,
      amenities,
    } = listingData;

    // Upload images to ImageKit if files are provided
    const imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadFile(
          file.buffer,
          file.originalname,
          "/homely/listings",
        );
        if (result && result.url) {
          imageUrls.push(result.url);
        }
      }
    }

    // Parse amenities if sent as JSON string (from multipart form)
    let parsedAmenities = amenities;
    if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        // If not valid JSON, treat as comma-separated
        parsedAmenities = amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
      }
    }

    const listing = await this.listingRepository.create({
      ownerRef: ownerUserId,
      title,
      description,
      city,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      rentBudget: parseFloat(rentBudget),
      propertyType,
      genderPreference,
      amenities: parsedAmenities || [],
      images: imageUrls,
    });

    return listing;
  }

  /**
   * Updates an existing listing. Only the owning user can update.
   * @param {string} listingId - The listing's ObjectId
   * @param {string} ownerUserId - The authenticated owner's User ObjectId
   * @param {Object} updateData - Fields to update
   * @param {Array} files - Optional new image files
   * @returns {Promise<Object>} Updated listing document
   */
  async updateListing(listingId, ownerUserId, updateData, files = []) {
    // Verify listing exists
    const existingListing = await this.listingRepository.findById(listingId);
    if (!existingListing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Listing not found");
    }

    // Verify ownership — only the owner who created it can update
    if (existingListing.ownerRef._id.toString() !== ownerUserId.toString()) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to update this listing",
      );
    }

    // Build the update object from allowed fields
    const allowedFields = [
      "title",
      "description",
      "city",
      "rentBudget",
      "propertyType",
      "genderPreference",
      "amenities",
      "availabilityStatus",
    ];

    const updatePayload = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updatePayload[field] = updateData[field];
      }
    }

    // Handle location update if coordinates are provided
    if (updateData.longitude && updateData.latitude) {
      updatePayload.location = {
        type: "Point",
        coordinates: [
          parseFloat(updateData.longitude),
          parseFloat(updateData.latitude),
        ],
      };
    }

    // Parse rentBudget to number if present
    if (updatePayload.rentBudget) {
      updatePayload.rentBudget = parseFloat(updatePayload.rentBudget);
    }

    // Parse amenities if sent as JSON string
    if (typeof updatePayload.amenities === "string") {
      try {
        updatePayload.amenities = JSON.parse(updatePayload.amenities);
      } catch {
        updatePayload.amenities = updatePayload.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
      }
    }

    // Parse availabilityStatus to boolean if sent as string
    if (typeof updatePayload.availabilityStatus === "string") {
      updatePayload.availabilityStatus =
        updatePayload.availabilityStatus === "true";
    }

    // Upload new images if provided
    if (files && files.length > 0) {
      const newImageUrls = [];
      for (const file of files) {
        const result = await uploadFile(
          file.buffer,
          file.originalname,
          "/homely/listings",
        );
        if (result && result.url) {
          newImageUrls.push(result.url);
        }
      }
      // Append new images to existing ones
      updatePayload.images = [
        ...(existingListing.images || []),
        ...newImageUrls,
      ];
    }

    const updatedListing = await this.listingRepository.update(
      listingId,
      updatePayload,
    );

    return updatedListing;
  }

  /**
   * Gets a single listing by ID.
   * @param {string} listingId - The listing's ObjectId
   * @returns {Promise<Object>} Listing document
   */
  async getListingById(listingId) {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Listing not found");
    }
    return listing;
  }

  /**
   * Gets all listings for the authenticated owner.
   * @param {string} ownerUserId - The owner's User ObjectId
   * @returns {Promise<Array>} Array of listing documents
   */
  async getMyListings(ownerUserId) {
    return this.listingRepository.findByOwner(ownerUserId);
  }

  /**
   * Gets all listings (public — for tenants browsing).
   * @returns {Promise<Array>} Array of listing documents
   */
  async getAllListings() {
    return this.listingRepository.findAll({ approvalStatus: "APPROVED" });
  }
}

export default ListingService;
