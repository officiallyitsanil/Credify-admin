import React, { useState, useEffect } from 'react';
import { creditLimitAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './CreditLimit.css';

const CreditLimit = () => {
    const [limits, setLimits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLimit, setSelectedLimit] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCreditLimits();
    }, []);

    const fetchCreditLimits = async () => {
        try {
            setLoading(true);
            const response = await creditLimitAPI.getAll();
            // Backend returns { creditLimits: [...] }
            setLimits(response.data.creditLimits || response.data.data || []);
        } catch (error) {
            console.error('Error fetching credit limits:', error);
            setLimits([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getRiskBadge = (category) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            very_high: 'danger'
        };
        return <Badge color={colors[category] || 'secondary'}>{category}</Badge>;
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'success',
            suspended: 'warning',
            frozen: 'info',
            closed: 'danger'
        };
        return <Badge color={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading credit limits...</div>;
    }

    return (
        <div className="credit-limit-page">
            <div className="page-header">
                <h1>Credit Limit Management</h1>
            </div>

            <div className="limits-grid">
                {limits.map((limit) => (
                    <Card key={limit._id}>
                        <div className="limit-card">
                            <div className="limit-header">
                                <h3>{limit.userId?.fullName || limit.userId?.name || 'Unknown User'}</h3>
                                {getStatusBadge(limit.status)}
                            </div>
                            <div className="limit-details">
                                <div className="limit-amounts">
                                    <div className="amount-item">
                                        <span className="label">Total Limit</span>
                                        <span className="value">{formatCurrency(limit.totalLimit || 0)}</span>
                                    </div>
                                    <div className="amount-item">
                                        <span className="label">Available</span>
                                        <span className="value success">{formatCurrency(limit.availableLimit || 0)}</span>
                                    </div>
                                    <div className="amount-item">
                                        <span className="label">Utilized</span>
                                        <span className="value danger">{formatCurrency(limit.utilizedLimit || 0)}</span>
                                    </div>
                                </div>
                                <div className="limit-meta">
                                    <p><strong>Credit Score:</strong> {limit.creditScore || 'N/A'}</p>
                                    <p><strong>Risk Category:</strong> {getRiskBadge(limit.riskCategory)}</p>
                                    <p><strong>Limit Type:</strong> {limit.limitType?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="limit-actions">
                                <Button onClick={() => {
                                    setSelectedLimit(limit);
                                    setShowModal(true);
                                }}>View Details</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {limits.length === 0 && (
                <div className="no-data">No credit limits found</div>
            )}

            {showModal && selectedLimit && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Credit Limit Details</h2>
                        <div className="modal-body">
                            <p><strong>User:</strong> {selectedLimit.userId?.fullName || selectedLimit.userId?.name}</p>
                            <p><strong>Total Limit:</strong> {formatCurrency(selectedLimit.totalLimit)}</p>
                            <p><strong>Available Limit:</strong> {formatCurrency(selectedLimit.availableLimit)}</p>
                            <p><strong>Utilized Limit:</strong> {formatCurrency(selectedLimit.utilizedLimit)}</p>
                            <p><strong>Blocked Limit:</strong> {formatCurrency(selectedLimit.blockedLimit || 0)}</p>
                            <p><strong>Credit Score:</strong> {selectedLimit.creditScore}</p>
                            <p><strong>Risk Category:</strong> {selectedLimit.riskCategory}</p>
                            <p><strong>Limit Type:</strong> {selectedLimit.limitType}</p>
                            {selectedLimit.approvedBy && (
                                <p><strong>Approved By:</strong> {selectedLimit.approvedBy.name}</p>
                            )}
                            {selectedLimit.approvedAt && (
                                <p><strong>Approved At:</strong> {new Date(selectedLimit.approvedAt).toLocaleDateString()}</p>
                            )}
                            {selectedLimit.limitHistory && selectedLimit.limitHistory.length > 0 && (
                                <div className="limit-history">
                                    <h3>Limit History</h3>
                                    {selectedLimit.limitHistory.map((history, index) => (
                                        <div key={index} className="history-item">
                                            <p>{formatCurrency(history.previousLimit)} → {formatCurrency(history.newLimit)}</p>
                                            <p className="reason">{history.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <Button onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditLimit;
