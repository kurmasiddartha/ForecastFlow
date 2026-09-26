import { api } from './api';

export const saleService = {
  async create(data) {
    return api.post(`${api.versionPath}/sales`, data);
  },

  async list({ page = 1, pageSize = 20, productId = '' } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);
    if (productId) params.append('product_id', productId);
    return api.get(`${api.versionPath}/sales?${params.toString()}`);
  },

  async get(id) {
    return api.get(`${api.versionPath}/sales/${id}`);
  },
};
