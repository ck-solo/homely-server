import { body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../utils/constants.js";

class AuthValidator {
  /**
   * Validation rules for user registration.
   * @returns {Array} Array of express-validator chains
   */
  static register() {
    return [
      body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ max: 100 })
        .withMessage("Name cannot exceed 100 characters"),

      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

      body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords do not match");
          }
          return true;
        }),

      body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn([ROLES.TENANT, ROLES.OWNER, ROLES.ADMIN])
        .withMessage(
          `Role must be one of: ${ROLES.TENANT}, ${ROLES.OWNER}, ${ROLES.ADMIN}`,
        ),

      body("phone")
        .optional()
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage("Please provide a valid phone number (E.164 format)"),
    ];
  }

  /**
   * Validation rules for user login.
   * @returns {Array} Array of express-validator chains
   */
  static login() {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

      body("password").notEmpty().withMessage("Password is required"),
    ];
  }

  /**
   * Validation rules for changing password.
   * @returns {Array} Array of express-validator chains
   */
  static changePassword() {
    return [
      body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

      body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("New password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("New password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("New password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage(
          "New password must contain at least one special character",
        ),

      body("confirmNewPassword")
        .notEmpty()
        .withMessage("Confirm new password is required")
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error("New passwords do not match");
          }
          return true;
        }),
    ];
  }

  /**
   * Validation rules for forgot password.
   * @returns {Array} Array of express-validator chains
   */
  static forgotPassword() {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    ];
  }

  /**
   * Validation rules for reset password.
   * @returns {Array} Array of express-validator chains
   */
  static resetPassword() {
    return [
      body("token").notEmpty().withMessage("Reset token is required"),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

      body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords do not match");
          }
          return true;
        }),
    ];
  }

  /**
   * Middleware that checks validation results and throws ApiError if invalid.
   * Must be placed AFTER validation rule chains in the route middleware array.
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

export default AuthValidator;
