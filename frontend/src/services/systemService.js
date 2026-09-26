import { api } from './api';

export const systemService = {
  /**
   * Wipes all operational test data (products, categories, suppliers, sales, purchases, forecasts, recommendations)
   * while preserving user login accounts.
   */
  async resetOperationalData() {
    return api.post(`${api.versionPath}/system/reset-data`);
  },

  /**
   * Seeds realistic Siddu Kirana Store data (products, student/neighborhood sales, restock recommendations)
   */
  async seedKiranaDemo() {
    return api.post(`${api.versionPath}/system/seed-siddu-shop`);
  },
};

