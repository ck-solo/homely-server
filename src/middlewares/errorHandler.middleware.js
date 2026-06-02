import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import envConfig from "../config/env.config.js";

class ErrorHandler {
  /**
   * Global error-handling middleware for Express.
   * Must be registered as the LAST middleware with 4 parameters.
   */
  static handle(err, _req, res, _next) {
    // Default error values
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";
    let errors = [];

    // Handle our custom ApiError
    if (err instanceof ApiError) {
      statusCode = err.statusCode;
      message = err.message;
      errors = err.errors;
    }

    // Handle Mongoose ValidationError
    else if (err.name === "ValidationError") {
      statusCode = StatusCodes.BAD_REQUEST;
      message = "Validation Error";
      errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
    }

    // Handle Mongoose CastError (invalid ObjectId, etc.)
    else if (err.name === "CastError") {
      statusCode = StatusCodes.BAD_REQUEST;
      message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle MongoDB duplicate key error
    else if (err.code === 11000) {
      statusCode = StatusCodes.CONFLICT;
      const field = Object.keys(err.keyValue)[0];
      message = `Duplicate value for field: ${field}. Please use a different value.`;
    }

    // Handle JWT errors
    else if (err.name === "JsonWebTokenError") {
      statusCode = StatusCodes.UNAUTHORIZED;
      message = "Invalid token. Please log in again.";
    }

    // Handle JWT expired error
    else if (err.name === "TokenExpiredError") {
      statusCode = StatusCodes.UNAUTHORIZED;
      message = "Token has expired. Please log in again.";
    }

    // Log error in development
    if (envConfig.NODE_ENV === "development") {
      console.error("❌ Error:", err);
    }

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors.length > 0 ? errors : undefined,
      stack: envConfig.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}

export default ErrorHandler;
