import { api } from './api';

export const forecastingService = {
  /**
   * Retrieves active products list with forecast metadata for the selector.
   */
  async getProductsOverview() {
    return api.get(`${api.versionPath}/forecasting/products`);
  },

  /**
   * Retrieves latest persisted forecast without retraining (fast sub-10ms response).
   */
  async getLatestForecast(productId) {
    if (!productId) return null;
    return api.get(`${api.versionPath}/forecasting/latest/${productId}`);
  },

  /**
   * Triggers forecast generation / backtesting for a product.
   */
  async generateForecast({
    productId,
    horizon = 7,
    modelPreference = 'auto',
    forceRetrain = false,
    save = true,
  }) {
    return api.post(`${api.versionPath}/forecasting/generate`, {
      product_id: productId,
      horizon: Number(horizon),
      model_preference: modelPreference,
      force_retrain: Boolean(forceRetrain),
      save: Boolean(save),
    });
  },

  /**
   * Triggers batch scheduled forecasting across active catalog products.
   */
  async runBatchForecast({ horizon = 7, forceRetrain = false, maxProducts = 50 } = {}) {
    return api.post(`${api.versionPath}/forecasting/batch`, {
      horizon: Number(horizon),
      force_retrain: Boolean(forceRetrain),
      max_products: Number(maxProducts),
    });
  },

  /**
   * Extracts historical preprocessed time-series dataset.
   */
  async getDataset({ productId = null, freq = 'D', limit = 1000 } = {}) {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    if (freq) params.append('freq', freq);
    if (limit) params.append('limit', limit);
    return api.get(`${api.versionPath}/forecasting/dataset?${params.toString()}`);
  },
};
