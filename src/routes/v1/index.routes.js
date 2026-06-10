import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.route.js";
import searchRoutes from "./search.routes.js";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/listings", searchRoutes);

// Future routes:
// router.use('/tenants', tenantRoutes);
// router.use('/owners', ownerRoutes);

export default router;
