// Store token and admin data
export const setAuth = (token, admin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
};

// Get token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Get admin data
export const getAdmin = () => {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
};

// Check if authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/login';
};
