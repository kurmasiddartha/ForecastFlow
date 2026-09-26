import { api } from './api';

export const purchaseService = {
  async create(data) {
    return api.post(`${api.versionPath}/purchases`, data);
  },

  async list({ page = 1, pageSize = 20, supplierId = '', status = '' } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);
    if (supplierId) params.append('supplier_id', supplierId);
    if (status) params.append('status', status);
    return api.get(`${api.versionPath}/purchases?${params.toString()}`);
  },

  async get(id) {
    return api.get(`${api.versionPath}/purchases/${id}`);
  },
};
