import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);  // OAuth2 expects 'username'
  formData.append('password', password);

  try {
    const response = await api.post('/auth/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Debug log
    console.log('Login response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error;
  }
};

export const register = async ({ email, password }) => {
  return api.post('/auth/register', { email, password });
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
export const executeQuery = async (templateId, queryData) => {
  try {
    const response = await api.post(`/queries/${templateId}`, queryData);
    console.log('API executeQuery response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Execute query error:', error);
    throw error;
  }
};

export const getQueryHistory = async () => {
  const response = await api.get('/queries/history');
  return response.data;
};

// Usage endpoints
export const getUsageStats = async () => {
  const response = await api.get('/queries/stats');
  return response.data;
};

export const getDetailedUsage = async () => {
  const response = await api.get('/queries/detailed');
  return response.data;
};

// User endpoints
export const updateUserSettings = async (settings) => {
  const response = await api.put('/users/settings', settings);
  return response.data;
};

export const refreshApiKey = async () => {
  try {
    const response = await api.post('/auth/refresh-api-key');
    // The response already includes the data structure we want
    return response.data;  // This should be the object with status, message, data, and error
  } catch (error) {
    console.error('Refresh API key error:', error);
    throw error;
  }
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

export const getSubscriptionUsage = async () => {
  const response = await api.get('/subscriptions/usage');
  return response.data;
};

export const createSubscription = async (data) => {
  const response = await api.post('/subscriptions/subscribe', data);
  return response.data;
};

export const updateSubscription = async (data) => {
  const response = await api.put('/subscriptions/update', data);
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await api.delete('/subscriptions/cancel');
  return response.data;
};

export const createCheckoutSession = async (priceId) => {
  const response = await api.post('/subscriptions/create-checkout-session', { price_id: priceId });
  return response.data;
};

export const createPortalSession = async () => {
  const response = await api.post('/subscriptions/create-portal-session');
  return response.data;
};

export const checkSubscriptionStatus = async () => {
  const response = await api.get('/subscriptions/check-status');
  return response.data;
};

export const refreshSubscriptionCredits = async () => {
  const response = await api.post('/subscriptions/refresh-credits');
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