import { api } from './api';

export const intelligenceService = {
  /**
   * Fetches high-level executive inventory health & risk summary.
   */
  async getSummary(params = {}) {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('category_id', params.categoryId);
    if (params.analysisWindowDays) query.append('analysis_window_days', params.analysisWindowDays);
    if (params.deadStockDays) query.append('dead_stock_days', params.deadStockDays);
    if (params.fastMovingVelocity) query.append('fast_moving_daily_velocity', params.fastMovingVelocity);
    if (params.slowMovingVelocity) query.append('slow_moving_daily_velocity', params.slowMovingVelocity);
    if (params.stockoutDays) query.append('stockout_risk_days', params.stockoutDays);
    if (params.overstockDays) query.append('overstock_days', params.overstockDays);

    return api.get(`${api.versionPath}/intelligence/summary?${query.toString()}`);
  },

  /**
   * Retrieves paginated, filterable product intelligence list.
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('category_id', params.categoryId);
    if (params.velocityFilter && params.velocityFilter !== 'ALL') {
      query.append('velocity_filter', params.velocityFilter);
    }
    if (params.riskFilter && params.riskFilter !== 'ALL') {
      query.append('risk_filter', params.riskFilter);
    }
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sort_by', params.sortBy);
    if (params.sortDesc !== undefined) query.append('sort_desc', params.sortDesc);

    // Threshold configurations
    if (params.analysisWindowDays) query.append('analysis_window_days', params.analysisWindowDays);
    if (params.deadStockDays) query.append('dead_stock_days', params.deadStockDays);
    if (params.fastMovingVelocity) query.append('fast_moving_daily_velocity', params.fastMovingVelocity);
    if (params.slowMovingVelocity) query.append('slow_moving_daily_velocity', params.slowMovingVelocity);
    if (params.stockoutDays) query.append('stockout_risk_days', params.stockoutDays);
    if (params.overstockDays) query.append('overstock_days', params.overstockDays);

    return api.get(`${api.versionPath}/intelligence/products?${query.toString()}`);
  },

  /**
   * Specialized queries
   */
  async getFastMoving(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('category_id', params.categoryId);
    return api.get(`${api.versionPath}/intelligence/fast-moving?${query.toString()}`);
  },

  async getSlowMoving(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('category_id', params.categoryId);
    return api.get(`${api.versionPath}/intelligence/slow-moving?${query.toString()}`);
  },

  async getDeadStock(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('category_id', params.categoryId);
    return api.get(`${api.versionPath}/intelligence/dead-stock?${query.toString()}`);
  },

  async getStockoutRisks(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('category_id', params.categoryId);
    return api.get(`${api.versionPath}/intelligence/stockout-risk?${query.toString()}`);
  },

  async getOverstockRisks(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('category_id', params.categoryId);
    return api.get(`${api.versionPath}/intelligence/overstock-risk?${query.toString()}`);
  },

  /**
   * Simulate custom thresholds scenario.
   */
  async simulateThresholds(config, categoryId = null) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return api.post(`${api.versionPath}/intelligence/simulate${query}`, config);
  },
};
