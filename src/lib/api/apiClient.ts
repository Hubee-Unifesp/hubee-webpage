import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hubee_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('hubee_token');
      
      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        const fullPath = encodeURIComponent(`${currentPath}${searchParams}`);
        window.location.href = `/login?redirect=${fullPath}`;
      }
    }
    return Promise.reject(error);
  }
);