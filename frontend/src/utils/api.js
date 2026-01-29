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
    checkPhone: (data) => api.post('/admin/check-phone', data),
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

export const loanApplicationAPI = {
    apply: (data) => axios.post(`${API_URL}/loan-application/apply`, data),
    getStatus: (phoneNumber) => axios.get(`${API_URL}/loan-application/status/${phoneNumber}`),
    getSettings: () => axios.get(`${API_URL}/loan-application/settings`)
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRepayments: (params) => api.get('/dashboard/repayments', { params })
};

export const kycAPI = {
    getAll: (params) => api.get('/kyc', { params }),
    getById: (id) => api.get(`/kyc/${id}`),
    verify: (id, data) => api.put(`/kyc/${id}/verify`, data),
    reject: (id, data) => api.put(`/kyc/${id}/reject`, data)
};

export const creditLimitAPI = {
    getAll: (params) => api.get('/credit-limit', { params }),
    getById: (id) => api.get(`/credit-limit/${id}`),
    update: (id, data) => api.put(`/credit-limit/${id}`, data)
};

export const disbursementAPI = {
    getAll: (params) => api.get('/disbursement', { params }),
    getById: (id) => api.get(`/disbursement/${id}`),
    approve: (id, data) => api.put(`/disbursement/${id}/approve`, data),
    disburse: (id, data) => api.put(`/disbursement/${id}/disburse`, data)
};

export const interestFeesAPI = {
    getInterest: (params) => api.get('/interest-fees/interest', { params }),
    getFees: (params) => api.get('/interest-fees/fees', { params }),
    getPenalties: (params) => api.get('/interest-fees/penalties', { params }),
    createInterest: (data) => api.post('/interest-fees/interest', data),
    createFee: (data) => api.post('/interest-fees/fees', data),
    createPenalty: (data) => api.post('/interest-fees/penalties', data)
};

export const notificationsAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getById: (id) => api.get(`/notifications/${id}`),
    send: (data) => api.post('/notifications/send', data),
    markAsRead: (id) => api.put(`/notifications/${id}/read`)
};

export const collectionAPI = {
    getAll: (params) => api.get('/collection', { params }),
    getById: (id) => api.get(`/collection/${id}`),
    assign: (id, data) => api.put(`/collection/${id}/assign`, data),
    addActivity: (id, data) => api.post(`/collection/${id}/activity`, data)
};

export const riskAPI = {
    getAll: (params) => api.get('/risk', { params }),
    getById: (id) => api.get(`/risk/${id}`),
    assess: (userId) => api.post('/risk/assess', { userId })
};

export const fraudAPI = {
    getAll: (params) => api.get('/fraud', { params }),
    getById: (id) => api.get(`/fraud/${id}`),
    investigate: (id, data) => api.put(`/fraud/${id}/investigate`, data),
    resolve: (id, data) => api.put(`/fraud/${id}/resolve`, data)
};

export const supportAPI = {
    getAll: (params) => api.get('/support', { params }),
    getById: (id) => api.get(`/support/${id}`),
    create: (data) => api.post('/support', data),
    assign: (id, data) => api.put(`/support/${id}/assign`, data),
    respond: (id, data) => api.post(`/support/${id}/respond`, data),
    resolve: (id, data) => api.put(`/support/${id}/resolve`, data)
};

export const cmsAPI = {
    getAll: (params) => api.get('/cms', { params }),
    getById: (id) => api.get(`/cms/${id}`),
    create: (data) => api.post('/cms', data),
    update: (id, data) => api.put(`/cms/${id}`, data),
    delete: (id) => api.delete(`/cms/${id}`)
};

export const auditAPI = {
    getAll: (params) => api.get('/audit', { params }),
    getById: (id) => api.get(`/audit/${id}`)
};

export const settingsAPI = {
    getAll: (params) => api.get('/settings', { params }),
    getById: (key) => api.get(`/settings/${key}`),
    update: (key, data) => api.put(`/settings/${key}`, data)
};
