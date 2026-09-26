import { api } from './api';

export const productService = {
  async list({ page = 1, pageSize = 20, search = '', categoryId = '', isActive = null } = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);
    if (search) params.append('search', search);
    if (categoryId) params.append('category_id', categoryId);
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      params.append('is_active', isActive);
    }
    return api.get(`${api.versionPath}/products?${params.toString()}`);
  },

  async get(id) {
    return api.get(`${api.versionPath}/products/${id}`);
  },

  async create(data) {
    return api.post(`${api.versionPath}/products`, data);
  },

  async update(id, data) {
    return api.put(`${api.versionPath}/products/${id}`, data);
  },

  async delete(id) {
    return api.delete(`${api.versionPath}/products/${id}`);
  },
};
