import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.route.js";
import listingRoutes from "./listing.routes.js";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/listings", listingRoutes);

// Future routes:
// router.use('/tenants', tenantRoutes);
// router.use('/owners', ownerRoutes);

export default router;
