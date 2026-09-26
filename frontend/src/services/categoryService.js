import { api } from './api';

export const categoryService = {
  async list() {
    return api.get(`${api.versionPath}/categories`);
  },

  async get(id) {
    return api.get(`${api.versionPath}/categories/${id}`);
  },

  async create(data) {
    return api.post(`${api.versionPath}/categories`, data);
  },

  async update(id, data) {
    return api.put(`${api.versionPath}/categories/${id}`, data);
  },

  async delete(id) {
    return api.delete(`${api.versionPath}/categories/${id}`);
  },
};
