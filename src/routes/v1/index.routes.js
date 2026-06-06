import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.route.js";

const router = Router();

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

// Future routes:
// router.use('/listings', listingRoutes);
// router.use('/tenants', tenantRoutes);
// router.use('/owners', ownerRoutes);

export default router;
