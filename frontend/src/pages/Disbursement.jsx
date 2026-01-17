import React, { useState, useEffect, useCallback } from 'react';
import { disbursementAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Disbursement.css';

const Disbursement = () => {
    const [disbursements, setDisbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchDisbursements = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await disbursementAPI.getAll(params);
            // Backend returns { disbursements: [...] }
            setDisbursements(response.data.disbursements || response.data.data || []);
        } catch (error) {
            console.error('Error fetching disbursements:', error);
            setDisbursements([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchDisbursements();
    }, [fetchDisbursements]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'warning',
            processing: 'info',
            approved: 'info',
            disbursed: 'success',
            failed: 'danger',
            cancelled: 'secondary',
            reversed: 'danger'
        };
        return <Badge color={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading disbursements...</div>;
    }

    return (
        <div className="disbursement-page">
            <div className="page-header">
                <h1>Disbursement Management</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="disbursed">Disbursed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="disbursement-list">
                {disbursements.map((disb) => (
                    <Card key={disb._id}>
                        <div className="disbursement-item">
                            <div className="disb-header">
                                <div>
                                    <h3>{disb.userId?.fullName || disb.userId?.name || 'Unknown User'}</h3>
                                    <p className="loan-ref">Loan ID: {disb.loanId?._id || 'N/A'}</p>
                                </div>
                                {getStatusBadge(disb.status)}
                            </div>
                            <div className="disb-details">
                                <div className="detail-row">
                                    <span className="label">Amount:</span>
                                    <span className="value amount">{formatCurrency(disb.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Method:</span>
                                    <span className="value">{disb.disbursementMethod}</span>
                                </div>
                                {disb.disbursementMethod === 'bank_transfer' && disb.bankDetails && (
                                    <div className="detail-row">
                                        <span className="label">Account:</span>
                                        <span className="value">{disb.bankDetails.accountNumber} ({disb.bankDetails.bankName})</span>
                                    </div>
                                )}
                                {disb.disbursementMethod === 'upi' && disb.upiId && (
                                    <div className="detail-row">
                                        <span className="label">UPI ID:</span>
                                        <span className="value">{disb.upiId}</span>
                                    </div>
                                )}
                                {disb.transactionId && (
                                    <div className="detail-row">
                                        <span className="label">Transaction ID:</span>
                                        <span className="value">{disb.transactionId}</span>
                                    </div>
                                )}
                                {disb.disbursedAt && (
                                    <div className="detail-row">
                                        <span className="label">Disbursed At:</span>
                                        <span className="value">{new Date(disb.disbursedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {disb.failureReason && (
                                    <div className="detail-row error">
                                        <span className="label">Failure Reason:</span>
                                        <span className="value">{disb.failureReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {disbursements.length === 0 && (
                <div className="no-data">No disbursements found</div>
            )}
        </div>
    );
};

export default Disbursement;
