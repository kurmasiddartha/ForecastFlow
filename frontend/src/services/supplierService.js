import { api } from './api';

export const supplierService = {
  async list() {
    return api.get(`${api.versionPath}/suppliers`);
  },

  async get(id) {
    return api.get(`${api.versionPath}/suppliers/${id}`);
  },

  async create(data) {
    return api.post(`${api.versionPath}/suppliers`, data);
  },

  async update(id, data) {
    return api.put(`${api.versionPath}/suppliers/${id}`, data);
  },

  async delete(id) {
    return api.delete(`${api.versionPath}/suppliers/${id}`);
  },
};
