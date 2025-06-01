import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle 401 Unauthorized (e.g., redirect to login)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // For example, clear token and redirect
      localStorage.removeItem('authToken');
      // You might want to dispatch an event or use a navigation service here
      // instead of direct window.location manipulation if using React Router's navigate
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;