import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('srats_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      url: err.config?.url
    });
    if (err.response?.status === 401) {
      localStorage.removeItem('srats_token');
      localStorage.removeItem('srats_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;