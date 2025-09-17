// frontend/src/services/api.ts
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiService = {
  // 项目相关
  async getItems(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const response = await axios.get('/api/items', { params });
    return response.data;
  },

  async getItemById(id: string) {
    const response = await axios.get(`/api/items/${id}`);
    return response.data;
  },

  async addReview(itemId: string, reviewData: any) {
    const response = await axios.post(`/api/items/${itemId}/reviews`, reviewData);
    return response.data;
  },

  // 用户相关
  async login(username: string, password: string) {
    const response = await axios.post('/api/users/login', { username, password });
    return response.data;
  },

  async register(username: string, email: string, password: string) {
    const response = await axios.post('/api/users/register', { username, email, password });
    return response.data;
  },

  async updatePreferences(userId: string, preferences: any, token: string) {
    const response = await axios.put(
      `/api/users/${userId}/preferences`,
      preferences,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async recordPurchase(userId: string, purchaseData: any, token: string) {
    const response = await axios.post(
      `/api/users/${userId}/purchase`,
      purchaseData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async recordClick(userId: string, itemId: string, token: string) {
    const response = await axios.post(
      `/api/users/${userId}/click`,
      { itemId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getClickStats(userId: string, token: string) {
    const response = await axios.get(
      `/api/users/${userId}/click-stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // 推荐相关
  async getRecommendations(userId: string, token: string) {
    const response = await axios.get(
      `/api/recommendations/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};
