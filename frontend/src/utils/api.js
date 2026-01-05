import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

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
        if (error.response?.status === 401) {
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
    login: (credentials) => api.post('/admin/login', credentials),
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
