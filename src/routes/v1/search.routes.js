import express from "express";
import SearchController from "../../controllers/search.controller.js";
import SearchService from "../../services/search.service.js";
import MongoListingRepository from "../../repositories/implementations/mongoListingRepository.js";

// Dependency Injection
const listingRepository = new MongoListingRepository();
const searchService = new SearchService(listingRepository);
const searchController = new SearchController(searchService);

const searchRoutes = express.Router();

// Public route for searching/browsing listings
searchRoutes.get(
  "/",
  searchController.searchListings
);

export default searchRoutes;
