import React, { useState, useEffect } from 'react';
import { interestFeesAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './InterestFees.css';

const InterestFees = () => {
    const [interestConfigs, setInterestConfigs] = useState([]);
    const [feeConfigs, setFeeConfigs] = useState([]);
    const [penaltyConfigs, setPenaltyConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('interest');

    useEffect(() => {
        fetchConfigurations();
    }, []);

    const fetchConfigurations = async () => {
        try {
            setLoading(true);
            const [interestRes, feesRes, penaltiesRes] = await Promise.all([
                interestFeesAPI.getInterest(),
                interestFeesAPI.getFees(),
                interestFeesAPI.getPenalties()
            ]);
            setInterestConfigs(interestRes.data.data || interestRes.data);
            setFeeConfigs(feesRes.data.data || feesRes.data);
            setPenaltyConfigs(penaltiesRes.data.data || penaltiesRes.data);
        } catch (error) {
            console.error('Error fetching configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (isActive) => {
        return <Badge color={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
        </Badge>;
    };

    if (loading) {
        return <div className="loading">Loading configurations...</div>;
    }

    return (
        <div className="interest-fees-page">
            <div className="page-header">
                <h1>Interest, Fees & Penalty Configuration</h1>
                <div className="tabs">
                    <button
                        className={activeTab === 'interest' ? 'active' : ''}
                        onClick={() => setActiveTab('interest')}
                    >
                        Interest Rates ({interestConfigs.length})
                    </button>
                    <button
                        className={activeTab === 'fees' ? 'active' : ''}
                        onClick={() => setActiveTab('fees')}
                    >
                        Fees ({feeConfigs.length})
                    </button>
                    <button
                        className={activeTab === 'penalties' ? 'active' : ''}
                        onClick={() => setActiveTab('penalties')}
                    >
                        Penalties ({penaltyConfigs.length})
                    </button>
                </div>
            </div>

            {activeTab === 'interest' && (
                <div className="config-grid">
                    {interestConfigs.map((config) => (
                        <Card key={config._id}>
                            <div className="config-card">
                                <div className="config-header">
                                    <h3>{config.name}</h3>
                                    {getStatusBadge(config.isActive)}
                                </div>
                                <div className="config-details">
                                    <p className="description">{config.description}</p>
                                    <div className="rates">
                                        <div className="rate-item">
                                            <span className="label">Annual Rate</span>
                                            <span className="value">{config.annualRate}%</span>
                                        </div>
                                        <div className="rate-item">
                                            <span className="label">Monthly Rate</span>
                                            <span className="value">{config.monthlyRate}%</span>
                                        </div>
                                        {config.dailyRate && (
                                            <div className="rate-item">
                                                <span className="label">Daily Rate</span>
                                                <span className="value">{config.dailyRate}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="meta">
                                        <p><strong>Type:</strong> {config.interestType}</p>
                                        <p><strong>Rate Type:</strong> {config.rateType}</p>
                                        <p><strong>Applicable To:</strong> {config.applicableTo}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {interestConfigs.length === 0 && (
                        <div className="no-data">No interest configurations found</div>
                    )}
                </div>
            )}

            {activeTab === 'fees' && (
                <div className="config-grid">
                    {feeConfigs.map((config) => (
                        <Card key={config._id}>
                            <div className="config-card">
                                <div className="config-header">
                                    <h3>{config.name}</h3>
                                    {getStatusBadge(config.isActive)}
                                </div>
                                <div className="config-details">
                                    <p className="description">{config.description}</p>
                                    <div className="fee-amount">
                                        <span className="label">Amount</span>
                                        <span className="value">
                                            {config.calculationType === 'percentage'
                                                ? `${config.feePercentage}%`
                                                : `₹${config.fixedAmount}`}
                                        </span>
                                    </div>
                                    <div className="meta">
                                        <p><strong>Type:</strong> {config.feeType}</p>
                                        <p><strong>Calculation:</strong> {config.calculationType}</p>
                                        {config.minAmount && (
                                            <p><strong>Min Amount:</strong> ₹{config.minAmount}</p>
                                        )}
                                        {config.maxAmount && (
                                            <p><strong>Max Amount:</strong> ₹{config.maxAmount}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {feeConfigs.length === 0 && (
                        <div className="no-data">No fee configurations found</div>
                    )}
                </div>
            )}

            {activeTab === 'penalties' && (
                <div className="config-grid">
                    {penaltyConfigs.map((config) => (
                        <Card key={config._id}>
                            <div className="config-card">
                                <div className="config-header">
                                    <h3>{config.name}</h3>
                                    {getStatusBadge(config.isActive)}
                                </div>
                                <div className="config-details">
                                    <p className="description">{config.description}</p>
                                    <div className="penalty-info">
                                        <div className="rate-item">
                                            <span className="label">Penalty Rate</span>
                                            <span className="value">{config.penaltyRate}%</span>
                                        </div>
                                        {config.gracePeriodDays && (
                                            <div className="rate-item">
                                                <span className="label">Grace Period</span>
                                                <span className="value">{config.gracePeriodDays} days</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="meta">
                                        <p><strong>Type:</strong> {config.penaltyType}</p>
                                        <p><strong>Calculation:</strong> {config.calculationType}</p>
                                        <p><strong>Applicable To:</strong> {config.applicableTo}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {penaltyConfigs.length === 0 && (
                        <div className="no-data">No penalty configurations found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterestFees;
