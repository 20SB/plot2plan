import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () =>
    api.get('/users/profile'),
};

// Projects API
export const projectsApi = {
  create: (data: any) =>
    api.post('/projects', data),
  
  getAll: (page = 1, limit = 10) =>
    api.get(`/projects?page=${page}&limit=${limit}`),
  
  getById: (id: string) =>
    api.get(`/projects/${id}`),
  
  update: (id: string, data: any) =>
    api.patch(`/projects/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  
  getStats: () =>
    api.get('/projects/stats'),
};
