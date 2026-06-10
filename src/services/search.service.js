class SearchService {
  /**
   * @param {import('../repositories/contracts/IListingRepository.js').default} listingRepository
   */
  constructor(listingRepository) {
    this.listingRepository = listingRepository;
  }

  /**
   * Parses and executes search filters against the repository
   * @param {Object} queryParams - Query parameters from req.query
   * @returns {Promise<Array>}
   */
  async searchListings(queryParams) {
    const { city, budgetMin, budgetMax, type, gender, page, limit } = queryParams;

    const filters = {};
    
    if (city) {
      filters.city = city;
    }

    if (budgetMin !== undefined || budgetMax !== undefined) {
      filters.minBudget = budgetMin;
      filters.maxBudget = budgetMax;
    }

    if (type) {
      // e.g. ?type=Flat,PG
      filters.propertyType = type.split(',').map(t => t.trim());
    }

    if (gender) {
      filters.genderPreference = gender.split(',').map(g => g.trim());
    }

    const pagination = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    };

    return this.listingRepository.search(filters, pagination);
  }
}

export default SearchService;
