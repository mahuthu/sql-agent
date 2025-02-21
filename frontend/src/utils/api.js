import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Auth endpoints
export const login = async (credentials) => {
  const response = await api.post('/auth/token', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

// Template endpoints
export const getTemplates = async () => {
  const response = await api.get('/templates');
  return response.data;
};

export const getTemplate = async (templateId) => {
  const response = await api.get(`/templates/${templateId}`);
  return response.data;
};

export const createTemplate = async (templateData) => {
  const response = await api.post('/templates', templateData);
  return response.data;
};

export const updateTemplate = async (templateId, templateData) => {
  const response = await api.put(`/templates/${templateId}`, templateData);
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  const response = await api.delete(`/templates/${templateId}`);
  return response.data;
};

// Query endpoints
export const executeQuery = async (templateId, data) => {
  const response = await api.post(`/queries/${templateId}`, data);
  return response.data;
};

export const getQueryHistory = async () => {
  const response = await api.get('/queries/history');
  return response.data;
};

// Usage endpoints
export const getUsageStats = async () => {
  const response = await api.get('/usage/stats');
  return response.data;
};

export const getDetailedUsage = async () => {
  const response = await api.get('/usage/detailed');
  return response.data;
};

// User endpoints
export const updateUserSettings = async (settings) => {
  const response = await api.put('/users/settings', settings);
  return response.data;
};

export const refreshApiKey = async () => {
  const response = await api.post('/users/refresh-api-key');
  return response.data;
};

// Subscription endpoints
export const getSubscriptionPlans = async () => {
  const response = await api.get('/subscriptions/plans');
  return response.data;
};

export const getCurrentSubscription = async () => {
  const response = await api.get('/subscriptions/current');
  return response.data;
};

export const createCheckoutSession = async (priceId) => {
  const response = await api.post('/subscriptions/create-checkout-session', { priceId });
  return response.data;
};

export const createPortalSession = async () => {
  const response = await api.post('/subscriptions/create-portal-session');
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get('/subscriptions/invoices');
  return response.data;
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Try to refresh token or logout user
      localStorage.removeItem('apiKey');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the api instance for custom requests
export default api; 