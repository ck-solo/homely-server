import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount feature routes
router.use('/auth', authRoutes);

// Future routes:
// router.use('/listings', listingRoutes);
// router.use('/tenants', tenantRoutes);
// router.use('/owners', ownerRoutes);

export default router;
