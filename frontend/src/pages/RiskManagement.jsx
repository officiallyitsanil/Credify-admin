import React, { useState, useEffect } from 'react';
import { riskAPI, fraudAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './RiskManagement.css';

const RiskManagement = () => {
    const [assessments, setAssessments] = useState([]);
    const [fraudAlerts, setFraudAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('risk');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [riskRes, fraudRes] = await Promise.all([
                riskAPI.getAll(),
                fraudAPI.getAll()
            ]);
            setAssessments(riskRes.data.data || riskRes.data);
            setFraudAlerts(fraudRes.data.data || fraudRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
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

    const getSeverityBadge = (severity) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            critical: 'danger'
        };
        return <Badge color={colors[severity] || 'secondary'}>{severity}</Badge>;
    };

    const getFraudStatusBadge = (status) => {
        const colors = {
            open: 'warning',
            investigating: 'info',
            confirmed_fraud: 'danger',
            false_positive: 'success',
            resolved: 'success'
        };
        return <Badge color={colors[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading risk data...</div>;
    }

    return (
        <div className="risk-management-page">
            <div className="page-header">
                <h1>Risk & Fraud Management</h1>
                <div className="tabs">
                    <button
                        className={activeTab === 'risk' ? 'active' : ''}
                        onClick={() => setActiveTab('risk')}
                    >
                        Risk Assessments ({assessments.length})
                    </button>
                    <button
                        className={activeTab === 'fraud' ? 'active' : ''}
                        onClick={() => setActiveTab('fraud')}
                    >
                        Fraud Alerts ({fraudAlerts.length})
                    </button>
                </div>
            </div>

            {activeTab === 'risk' && (
                <div className="risk-grid">
                    {assessments.map((assessment) => (
                        <Card key={assessment._id}>
                            <div className="risk-card">
                                <div className="risk-header">
                                    <h3>{assessment.userId?.fullName || assessment.userId?.name || 'Unknown User'}</h3>
                                    {getRiskBadge(assessment.riskCategory)}
                                </div>
                                <div className="risk-details">
                                    <div className="score-section">
                                        <div className="score-item">
                                            <span className="label">Risk Score</span>
                                            <span className="value">{assessment.riskScore}/100</span>
                                        </div>
                                        {assessment.creditScore && (
                                            <div className="score-item">
                                                <span className="label">Credit Score</span>
                                                <span className="value">{assessment.creditScore}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p><strong>Assessment Type:</strong> {assessment.assessmentType}</p>
                                    <p><strong>Date:</strong> {new Date(assessment.assessmentDate || assessment.createdAt).toLocaleDateString()}</p>
                                    {assessment.approvedCreditLimit && (
                                        <p><strong>Approved Limit:</strong> ₹{assessment.approvedCreditLimit.toLocaleString()}</p>
                                    )}
                                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                                        <div className="recommendations">
                                            <strong>Recommendations:</strong>
                                            <ul>
                                                {assessment.recommendations.map((rec, idx) => (
                                                    <li key={idx}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {assessments.length === 0 && (
                        <div className="no-data">No risk assessments found</div>
                    )}
                </div>
            )}

            {activeTab === 'fraud' && (
                <div className="fraud-grid">
                    {fraudAlerts.map((alert) => (
                        <Card key={alert._id}>
                            <div className="fraud-card">
                                <div className="fraud-header">
                                    <div>
                                        <h3>{alert.userId?.fullName || alert.userId?.name || 'Unknown User'}</h3>
                                        <p className="alert-type">{alert.alertType.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div className="badges">
                                        {getSeverityBadge(alert.severity)}
                                        {getFraudStatusBadge(alert.status)}
                                    </div>
                                </div>
                                <div className="fraud-details">
                                    <p><strong>Detection Method:</strong> {alert.detectionMethod}</p>
                                    {alert.deviceInfo && (
                                        <div className="device-info">
                                            <strong>Device Info:</strong>
                                            <p>IP: {alert.deviceInfo.ipAddress}</p>
                                            <p>Location: {alert.deviceInfo.location}</p>
                                        </div>
                                    )}
                                    {alert.investigationNotes && (
                                        <div className="investigation">
                                            <strong>Investigation:</strong>
                                            <p>{alert.investigationNotes}</p>
                                        </div>
                                    )}
                                    {alert.indicators && alert.indicators.length > 0 && (
                                        <div className="indicators">
                                            <strong>Indicators:</strong>
                                            {alert.indicators.map((ind, idx) => (
                                                <div key={idx} className="indicator-item">
                                                    {ind.indicator}: {ind.value} (Confidence: {ind.confidence}%)
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {fraudAlerts.length === 0 && (
                        <div className="no-data">No fraud alerts found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RiskManagement;
