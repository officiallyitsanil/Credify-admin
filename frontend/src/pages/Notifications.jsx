import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { category: filter } : {};
            const response = await notificationsAPI.getAll(params);
            // Backend returns { notifications: [...] }
            setNotifications(response.data.notifications || response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getTypeBadge = (type) => {
        const colors = {
            info: 'info',
            warning: 'warning',
            success: 'success',
            error: 'danger',
            reminder: 'warning',
            promotional: 'info'
        };
        return <Badge color={colors[type] || 'secondary'}>{type}</Badge>;
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'warning',
            sent: 'success',
            delivered: 'success',
            read: 'info',
            failed: 'danger'
        };
        return <Badge color={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading notifications...</div>;
    }

    return (
        <div className="notifications-page">
            <div className="page-header">
                <h1>Notifications & Communication</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="loan_update">Loan Updates</option>
                        <option value="payment_reminder">Payment Reminders</option>
                        <option value="kyc_update">KYC Updates</option>
                        <option value="promotional">Promotional</option>
                        <option value="system">System</option>
                    </select>
                </div>
            </div>

            <div className="notifications-list">
                {notifications.map((notif) => (
                    <Card key={notif._id}>
                        <div className="notification-item">
                            <div className="notif-header">
                                <div className="notif-title">
                                    <h3>{notif.title}</h3>
                                    <div className="badges">
                                        {getTypeBadge(notif.type)}
                                        {getStatusBadge(notif.status)}
                                    </div>
                                </div>
                                <span className="notif-date">
                                    {new Date(notif.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="notif-body">
                                <p className="message">{notif.message}</p>
                                <div className="notif-meta">
                                    <span className="category">
                                        <strong>Category:</strong> {notif.category}
                                    </span>
                                    <span className="recipient">
                                        <strong>Recipient:</strong> {notif.userId?.fullName || notif.userId?.name || notif.recipientType}
                                    </span>
                                    {notif.channels && (
                                        <div className="channels">
                                            <strong>Channels:</strong>
                                            {notif.channels.inApp && <Badge color="info">In-App</Badge>}
                                            {notif.channels.email && <Badge color="info">Email</Badge>}
                                            {notif.channels.sms && <Badge color="info">SMS</Badge>}
                                            {notif.channels.push && <Badge color="info">Push</Badge>}
                                            {notif.channels.whatsapp && <Badge color="success">WhatsApp</Badge>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="no-data">No notifications found</div>
            )}
        </div>
    );
};

export default Notifications;
