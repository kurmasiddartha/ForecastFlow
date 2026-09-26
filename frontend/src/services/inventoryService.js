import { api } from './api';

export const inventoryService = {
  async adjustStock(data) {
    return api.post(`${api.versionPath}/inventory/adjust`, data);
  },

  async listMovements({ page = 1, pageSize = 20, productId = '', movementType = '' } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);
    if (productId) params.append('product_id', productId);
    if (movementType) params.append('movement_type', movementType);
    return api.get(`${api.versionPath}/inventory/movements?${params.toString()}`);
  },

  async getSummary() {
    return api.get(`${api.versionPath}/inventory/summary`);
  },

  async getLowStock(limit = 50) {
    return api.get(`${api.versionPath}/inventory/low-stock?limit=${limit}`);
  },
};
