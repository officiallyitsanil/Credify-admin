import React, { useState, useEffect, useCallback } from 'react';
import { collectionAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Collections.css';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchCollections = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await collectionAPI.getAll(params);
            // Backend returns { collections: [...] }
            setCollections(response.data.collections || response.data.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const colors = {
            open: 'warning',
            in_progress: 'info',
            contacted: 'info',
            promise_to_pay: 'success',
            payment_plan: 'success',
            legal: 'danger',
            settled: 'success',
            written_off: 'danger',
            closed: 'secondary'
        };
        return <Badge color={colors[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            critical: 'danger'
        };
        return <Badge color={colors[priority] || 'secondary'}>{priority}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading collection cases...</div>;
    }

    return (
        <div className="collections-page">
            <div className="page-header">
                <h1>Collection & Recovery</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="contacted">Contacted</option>
                        <option value="promise_to_pay">Promise to Pay</option>
                        <option value="legal">Legal</option>
                        <option value="settled">Settled</option>
                    </select>
                </div>
            </div>

            <div className="collections-grid">
                {collections.map((collection) => (
                    <Card key={collection._id}>
                        <div className="collection-card">
                            <div className="collection-header">
                                <div>
                                    <h3>{collection.userId?.fullName || collection.userId?.name || 'Unknown User'}</h3>
                                    <p className="case-number">Case: {collection.caseNumber}</p>
                                </div>
                                <div className="badges">
                                    {getStatusBadge(collection.status)}
                                    {getPriorityBadge(collection.priority)}
                                </div>
                            </div>
                            <div className="collection-details">
                                <div className="amount-section">
                                    <div className="amount-item">
                                        <span className="label">Overdue Amount</span>
                                        <span className="value">{formatCurrency(collection.overdueAmount)}</span>
                                    </div>
                                    <div className="amount-item">
                                        <span className="label">Days Past Due</span>
                                        <span className="value days">{collection.daysPastDue} days</span>
                                    </div>
                                </div>
                                <div className="meta-info">
                                    <p><strong>Bucket:</strong> {collection.bucketCategory}</p>
                                    <p><strong>Contact Attempts:</strong> {collection.contactAttempts || 0}</p>
                                    {collection.assignedTo && (
                                        <p><strong>Assigned To:</strong> {collection.assignedTo.name}</p>
                                    )}
                                    {collection.lastContactDate && (
                                        <p><strong>Last Contact:</strong> {new Date(collection.lastContactDate).toLocaleDateString()}</p>
                                    )}
                                    {collection.nextFollowUpDate && (
                                        <p><strong>Next Follow-up:</strong> {new Date(collection.nextFollowUpDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                                {collection.collectionActivities && collection.collectionActivities.length > 0 && (
                                    <div className="activities">
                                        <strong>Recent Activity:</strong>
                                        <p className="activity-note">{collection.collectionActivities[0].notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {collections.length === 0 && (
                <div className="no-data">No collection cases found</div>
            )}
        </div>
    );
};

export default Collections;
