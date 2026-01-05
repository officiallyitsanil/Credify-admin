import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import './Repayments.css';

const Repayments = () => {
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchRepayments();
    }, [filter]);

    const fetchRepayments = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await dashboardAPI.getRepayments(params);
            setRepayments(response.data.data);
        } catch (error) {
            console.error('Error fetching repayments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="repayments-page">
            <Topbar title="Repayment Tracking" />

            <div className="repayments-content">
                <Card>
                    <div className="repayments-header">
                        <div className="repayments-filters">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All Repayments
                            </button>
                            <button
                                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                                onClick={() => setFilter('overdue')}
                            >
                                Overdue
                            </button>
                            <button
                                className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
                                onClick={() => setFilter('paid')}
                            >
                                Paid
                            </button>
                        </div>
                    </div>

                    <div className="repayments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Loan Amount</th>
                                    <th>EMI Number</th>
                                    <th>EMI Amount</th>
                                    <th>Due Date</th>
                                    <th>Paid Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repayments.map((repayment) => (
                                    <tr key={repayment._id} className={repayment.status === 'overdue' ? 'overdue-row' : ''}>
                                        <td>
                                            <div className="repayment-user">
                                                <div className="repayment-user-name">{repayment.user?.name || 'Unknown'}</div>
                                                <div className="repayment-user-email">{repayment.user?.email || ''}</div>
                                            </div>
                                        </td>
                                        <td className="repayment-amount">{formatCurrency(repayment.loan?.amount || 0)}</td>
                                        <td>
                                            {repayment.emiNumber} / {repayment.loan?.tenure || 0}
                                        </td>
                                        <td className="repayment-emi">{formatCurrency(repayment.emiAmount)}</td>
                                        <td>{formatDate(repayment.dueDate)}</td>
                                        <td>{repayment.paidDate ? formatDate(repayment.paidDate) : '-'}</td>
                                        <td>
                                            <Badge variant={
                                                repayment.status === 'paid' ? 'success' :
                                                    repayment.status === 'overdue' ? 'error' :
                                                        'warning'
                                            }>
                                                {repayment.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Repayments;
