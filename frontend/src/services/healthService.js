import { api } from './api';

export const healthService = {
  /**
   * Fetches health status from backend root health endpoint
   */
  async checkRootHealth() {
    return api.get('/health');
  },

  /**
   * Fetches health status from versioned API endpoint
   */
  async checkApiHealth() {
    return api.get(`${api.versionPath}/health`);
  },
};
