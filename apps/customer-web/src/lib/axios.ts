import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(error.config);
      } catch (e) {
        // Refresh failed, logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
