import multer from "multer";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Use memory storage to store files as buffers
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(StatusCodes.BAD_REQUEST, "Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for multiple listing images upload (max 10 images)
export const uploadListingImages = upload.array("images", 10);
