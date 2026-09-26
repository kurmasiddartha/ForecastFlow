import { api } from './api';

export const authService = {
  /**
   * Registers a new user account
   */
  async register(data) {
    return api.post(`${api.versionPath}/auth/register`, data);
  },

  /**
   * Logs in a user and returns JWT token + user profile
   */
  async login(credentials) {
    return api.post(`${api.versionPath}/auth/login`, credentials);
  },

  /**
   * Fetches the current authenticated user's profile
   */
  async getCurrentUser() {
    return api.get(`${api.versionPath}/auth/me`);
  },

  /**
   * Logs out user session on the server
   */
  async logout() {
    try {
      return await api.post(`${api.versionPath}/auth/logout`, {});
    } catch {
      // Ignore network errors on logout since client token is discarded regardless
      return { message: 'Logged out' };
    }
  },
};
