import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Forces browser to automatically attach and receive cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle token expiration and refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasSession = localStorage.getItem('user') !== null;

    // Avoid infinite loops by checking session presence and refresh paths
    if (
      error.response?.status === 401 && 
      hasSession &&
      !originalRequest._retry && 
      originalRequest.url !== 'auth/login/' && 
      originalRequest.url !== 'auth/token/refresh/'
    ) {
      originalRequest._retry = true;

      try {
        // Post to refresh token; cookies are automatically attached
        await api.post('auth/token/refresh/');

        // Retry the original request (browser will attach the newly set access cookie)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
