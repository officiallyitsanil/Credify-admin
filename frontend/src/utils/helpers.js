import { format, formatDistanceToNow } from 'date-fns';

// Format date to readable string
export const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (date) => {
    if (!date) return '-';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format currency
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        verified: 'success',
        approved: 'success',
        active: 'success',
        paid: 'success',
        pending: 'warning',
        rejected: 'error',
        blocked: 'error',
        overdue: 'error'
    };
    return colors[status] || 'default';
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '??';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
