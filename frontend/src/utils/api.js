import axios from 'axios';

// Use Render URL in production, localhost in development
const API_URL = import.meta.env.MODE === 'production'
    ? 'https://credifyapp-admin.onrender.com/api'
    : 'http://localhost:5003/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request:', config.url, 'Token exists:', !!token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error.config?.url, 'Status:', error.response?.status);
        if (error.response?.status === 401) {
            console.log('401 Unauthorized - redirecting to login');
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// API endpoints
export const adminAPI = {
    verify: (data) => api.post('/admin/verify', data),
    getProfile: () => api.get('/admin/me')
};

export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    updateKYC: (id, data) => api.put(`/users/${id}/kyc`, data),
    updateCreditLimit: (id, data) => api.put(`/users/${id}/credit-limit`, data),
    updateStatus: (id, data) => api.put(`/users/${id}/status`, data)
};

export const loansAPI = {
    getAll: (params) => api.get('/loans', { params }),
    getById: (id) => api.get(`/loans/${id}`),
    approve: (id) => api.put(`/loans/${id}/approve`),
    reject: (id, data) => api.put(`/loans/${id}/reject`, data),
    getRepayments: (id) => api.get(`/loans/${id}/repayments`)
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRepayments: (params) => api.get('/dashboard/repayments', { params })
};
