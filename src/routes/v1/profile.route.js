import express from "express";
import multer from "multer";
import AuthMiddleware from "../../middlewares/auth.middleware.js";
import ProfileController from "../../controllers/profile.controller.js";
import ProfileService from "../../services/profile.service.js";
import MongoUserRepository from "../../repositories/implementations/mongoUserRepository.js";
import MongoTenantProfileRepository from "../../repositories/implementations/mongoTenantProfileRepository.js";
import MongoOwnerProfileRepository from "../../repositories/implementations/mongoOwnerProfileRepository.js";

// Dependency Injection
const userRepository = new MongoUserRepository();
const tenantProfileRepository = new MongoTenantProfileRepository();
const ownerProfileRepository = new MongoOwnerProfileRepository();
const profileService = new ProfileService(userRepository, tenantProfileRepository, ownerProfileRepository);
const profileController = new ProfileController(profileService);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const profileRoutes = express.Router();

profileRoutes.get(
  "/me",
  AuthMiddleware.authenticate,
  profileController.getProfile
);

profileRoutes.put(
  "/update-profile",
  AuthMiddleware.authenticate,
  upload.single("profilePicture"),
  profileController.updateProfile
);

export default profileRoutes;
