import { api } from './api';

export const recommendationService = {
  /**
   * Retrieves paginated recommendations with executive summary.
   */
  async getRecommendations({
    status = 'pending',
    urgency = null,
    categoryId = null,
    supplierId = null,
    search = null,
    page = 1,
    limit = 25,
  } = {}) {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status_filter', status);
    if (urgency && urgency !== 'ALL') query.append('urgency', urgency);
    if (categoryId) query.append('category_id', categoryId);
    if (supplierId) query.append('supplier_id', supplierId);
    if (search) query.append('search', search);
    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);

    return api.get(`${api.versionPath}/recommendations?${query.toString()}`);
  },

  /**
   * Generates recommendations on demand using latest forecasts and inventory state.
   */
  async generateRecommendations({
    productId = null,
    planningHorizonDays = 14,
    save = true,
  } = {}) {
    return api.post(`${api.versionPath}/recommendations/generate`, {
      product_id: productId,
      planning_horizon_days: Number(planningHorizonDays),
      save: Boolean(save),
    });
  },

  /**
   * Updates recommendation lifecycle status (approved, dismissed, pending).
   */
  async updateStatus(recommendationId, newStatus) {
    return api.patch(`${api.versionPath}/recommendations/${recommendationId}/status`, {
      status: newStatus,
    });
  },

  /**
   * Converts a recommendation directly into a formal Purchase Order.
   */
  async convertToPurchase(recommendationId) {
    return api.post(`${api.versionPath}/recommendations/${recommendationId}/convert-to-purchase`);
  },
};
