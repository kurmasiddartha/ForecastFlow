import { api } from './api';

export const analyticsService = {
  async getAIDashboard({ timeframe = '30d', targetProductId = null } = {}) {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (targetProductId) params.append('target_product_id', targetProductId);

    return api.get(`${api.versionPath}/analytics/ai-dashboard?${params.toString()}`);
  },

  async getDashboard({ timeframe = '30d', startDate = null, endDate = null, categoryId = null } = {}) {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (categoryId) params.append('category_id', categoryId);

    return api.get(`${api.versionPath}/analytics/dashboard?${params.toString()}`);
  },
};

