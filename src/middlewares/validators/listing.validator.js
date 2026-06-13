import { body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";

class ListingValidator {
  /**
   * Validation rules for creating a listing.
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

      body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

      body("location")
        .notEmpty()
        .withMessage("Location is required")
        .isObject()
        .withMessage("Location must be an object"),

      body("location.type")
        .optional()
        .equals("Point")
        .withMessage("Location type must be Point"),

      body("location.coordinates")
        .isArray({ min: 2, max: 2 })
        .withMessage("Coordinates must be an array of [longitude, latitude]")
        .custom((coords) => {
          const [lng, lat] = coords;
          if (typeof lng !== "number" || typeof lat !== "number") {
            throw new Error("Coordinates must be numbers");
          }
          if (lng < -180 || lng > 180) {
            throw new Error("Longitude must be between -180 and 180");
          }
          if (lat < -90 || lat > 90) {
            throw new Error("Latitude must be between -90 and 90");
          }
          return true;
        }),

      body("rentBudget")
        .notEmpty()
        .withMessage("Rent budget is required")
        .isNumeric()
        .withMessage("Rent budget must be a number")
        .custom((value) => value >= 0)
        .withMessage("Rent budget cannot be negative"),

      body("propertyType")
        .notEmpty()
        .withMessage("Property type is required")
        .isIn(["PG", "Hostel", "Flat", "Apartment", "House"])
        .withMessage("Property type must be one of: PG, Hostel, Flat, Apartment, House"),

      body("genderPreference")
        .optional()
        .isIn(["Male", "Female", "Co-ed"])
        .withMessage("Gender preference must be one of: Male, Female, Co-ed"),

      body("amenities")
        .optional()
        .isArray()
        .withMessage("Amenities must be an array of strings"),

      body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array of strings"),
    ];
  }

  /**
   * Validation rules for updating a listing.
   */
  static updateListing() {
    return [
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

      body("city")
        .optional()
        .trim(),

      body("location")
        .optional()
        .isObject()
        .withMessage("Location must be an object"),

      body("location.type")
        .optional()
        .equals("Point")
        .withMessage("Location type must be Point"),

      body("location.coordinates")
        .optional()
        .isArray({ min: 2, max: 2 })
        .withMessage("Coordinates must be an array of [longitude, latitude]")
        .custom((coords) => {
          const [lng, lat] = coords;
          if (typeof lng !== "number" || typeof lat !== "number") {
            throw new Error("Coordinates must be numbers");
          }
          if (lng < -180 || lng > 180) {
            throw new Error("Longitude must be between -180 and 180");
          }
          if (lat < -90 || lat > 90) {
            throw new Error("Latitude must be between -90 and 90");
          }
          return true;
        }),

      body("rentBudget")
        .optional()
        .isNumeric()
        .withMessage("Rent budget must be a number")
        .custom((value) => value >= 0)
        .withMessage("Rent budget cannot be negative"),

      body("propertyType")
        .optional()
        .isIn(["PG", "Hostel", "Flat", "Apartment", "House"])
        .withMessage("Property type must be one of: PG, Hostel, Flat, Apartment, House"),

      body("genderPreference")
        .optional()
        .isIn(["Male", "Female", "Co-ed"])
        .withMessage("Gender preference must be one of: Male, Female, Co-ed"),

      body("amenities")
        .optional()
        .isArray()
        .withMessage("Amenities must be an array of strings"),

      body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array of strings"),
    ];
  }

  /**
   * Middleware that checks validation results and throws ApiError if invalid.
   */
  static validate(req, res, next) {
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