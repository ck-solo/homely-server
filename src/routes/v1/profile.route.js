import express from "express";
import multer from "multer";
import authMiddleware from "../../middlewares/auth.middleware";
import { updateProfile } from "../../controllers/profile.controller";

const upload = multer({ storage: multer.memoryStorage() });


const profileRoutes = express.Router();


profileRoutes.post('/update-profile', authMiddleware, upload.single("profilePicture"), updateProfile)


export default profileRoutes;