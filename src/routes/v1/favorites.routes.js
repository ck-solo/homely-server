import { Router } from "express";
import FavoriteController from "../../controllers/favorite.controller.js";
import FavoriteService from "../../services/favorite.service.js";
import AuthMiddleware from "../../middlewares/auth.middleware.js";

// ─── Dependency Injection ────────────────────────────────
const favoriteService = new FavoriteService();
const favoriteController = new FavoriteController(favoriteService);

// ─── Router ──────────────────────────────────────────────
const router = Router();

// Protect all favorite routes
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize("TENANT"));

// Routes
router.post("/create", favoriteController.saveProperty);
router.delete("/delete/:listingId", favoriteController.removeSavedProperty);
router.get("/get", favoriteController.getSavedProperties);

export default router;
