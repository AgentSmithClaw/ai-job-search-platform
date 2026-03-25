import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access_token as query param (not Bearer header - backend uses Query() param)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Remove existing param if any, then add
    config.params = { ...config.params, access_token: token };
  }
  return config;
});

// Handle 401 - token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
