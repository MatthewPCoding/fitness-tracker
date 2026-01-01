import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateGoal: (data) => api.put('/auth/goal', data),
  logWeight: (weight) => api.post('/auth/weight', { weight })
};

export const mealsAPI = {
  search: (query) => api.get('/meals/search', { params: { q: query } }),
  getFoodDetails: (id) => api.get(`/meals/food/${id}`),
  logMeal: (data) => api.post('/meals', data),
  getMealsByDate: (date) => api.get(`/meals/date/${date}`),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  getSuggestions: () => api.get('/meals/suggestions'),
  getMealPlan: () => api.get('/meals/meal-plan')
};

export const foodsAPI = {
  getAll: (params) => api.get('/foods', { params }),
  create: (data) => api.post('/foods', data),
  delete: (id) => api.delete(`/foods/${id}`)
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getWeekly: () => api.get('/stats/weekly'),
  getWeightHistory: (days) => api.get('/stats/weight', { params: { days } }),
  getCalorieHistory: (days) => api.get('/stats/calories', { params: { days } })
};

export default api;
