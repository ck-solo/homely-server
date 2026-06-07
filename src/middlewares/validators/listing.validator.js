import { body, param, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";

class ListingValidator {
  /**
   * Validation rules for creating a listing.
   * @returns {Array} Array of express-validator chains
   */
  static createListing() {
    return [
      body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),

      body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),

      body("city").trim().notEmpty().withMessage("City is required"),

      body("longitude")
        .notEmpty()
        .withMessage("Longitude is required")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),

      body("latitude")
        .notEmpty()
        .withMessage("Latitude is required")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),

      body("rentBudget")
        .notEmpty()
        .withMessage("Rent budget is required")
        .isFloat({ min: 0 })
        .withMessage("Rent budget must be a non-negative number"),

      body("propertyType")
        .notEmpty()
        .withMessage("Property type is required")
        .isIn(["PG", "Hostel", "Flat", "Apartment", "House"])
        .withMessage(
          "Property type must be one of: PG, Hostel, Flat, Apartment, House",
        ),

      body("genderPreference")
        .optional()
        .isIn(["Male", "Female", "Co-ed"])
        .withMessage("Gender preference must be one of: Male, Female, Co-ed"),

      body("amenities")
        .optional()
        .custom((value) => {
          // Accept JSON string array or actual array
          if (typeof value === "string") {
            try {
              const parsed = JSON.parse(value);
              if (!Array.isArray(parsed)) {
                throw new Error("Amenities must be an array");
              }
            } catch {
              // Also accept comma-separated string
              return true;
            }
          }
          return true;
        }),
    ];
  }

  /**
   * Validation rules for updating a listing.
   * @returns {Array} Array of express-validator chains
   */
  static updateListing() {
    return [
      param("id")
        .notEmpty()
        .withMessage("Listing ID is required")
        .isMongoId()
        .withMessage("Invalid listing ID format"),

      body("title")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),

      body("description")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),

      body("city").optional().trim(),

      body("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),

      body("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),

      body("rentBudget")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Rent budget must be a non-negative number"),

      body("propertyType")
        .optional()
        .isIn(["PG", "Hostel", "Flat", "Apartment", "House"])
        .withMessage(
          "Property type must be one of: PG, Hostel, Flat, Apartment, House",
        ),

      body("genderPreference")
        .optional()
        .isIn(["Male", "Female", "Co-ed"])
        .withMessage("Gender preference must be one of: Male, Female, Co-ed"),

      body("availabilityStatus")
        .optional()
        .custom((value) => {
          if (typeof value === "string") {
            if (value !== "true" && value !== "false") {
              throw new Error("Availability status must be true or false");
            }
          } else if (typeof value !== "boolean") {
            throw new Error("Availability status must be a boolean");
          }
          return true;
        }),
    ];
  }

  /**
   * Validates listing ID from route params.
   * @returns {Array} Array of express-validator chains
   */
  static listingIdParam() {
    return [
      param("id")
        .notEmpty()
        .withMessage("Listing ID is required")
        .isMongoId()
        .withMessage("Invalid listing ID format"),
    ];
  }

  /**
   * Middleware that checks validation results and throws ApiError if invalid.
   */
  static validate(req, _res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Validation failed",
        extractedErrors,
      );
    }

    next();
  }
}

export default ListingValidator;
