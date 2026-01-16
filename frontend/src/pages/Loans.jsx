import React, { useEffect, useState } from 'react';
import { loansAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Loans.css';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLoans();
    }, [filter]);

    const fetchLoans = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await loansAPI.getAll(params);
            setLoans(response.data.data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLoan = async (loanId) => {
        if (!window.confirm('Are you sure you want to approve this loan?')) return;

        try {
            await loansAPI.approve(loanId);
            fetchLoans();
            alert('Loan approved successfully!');
        } catch (error) {
            console.error('Error approving loan:', error);
            alert(error.response?.data?.message || 'Failed to approve loan');
        }
    };

    const handleRejectLoan = async (loanId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await loansAPI.reject(loanId, { rejectionReason: reason });
            fetchLoans();
            alert('Loan rejected successfully!');
        } catch (error) {
            console.error('Error rejecting loan:', error);
            alert('Failed to reject loan');
        }
    };

    return (
        <div className="loans-page">
            <Topbar title="Loan Requests" />

            <div className="loans-content">
                <Card>
                    <div className="loans-header">
                        <div className="loans-filters">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All Loans
                            </button>
                            <button
                                className={`filter-btn ${filter === 'REQUESTED' ? 'active' : ''}`}
                                onClick={() => setFilter('REQUESTED')}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                                onClick={() => setFilter('APPROVED')}
                            >
                                Approved
                            </button>
                            <button
                                className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                                onClick={() => setFilter('REJECTED')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    <div className="loans-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Phone Number</th>
                                    <th>Amount</th>
                                    <th>Loan Reference</th>
                                    <th>Interest Rate</th>
                                    <th>Tenure (Days)</th>
                                    <th>Total Repayable</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr key={loan._id}>
                                        <td>{loan.phoneNumber}</td>
                                        <td className="loan-amount">{formatCurrency(loan.amount)}</td>
                                        <td>{loan.loanReferenceNumber || 'N/A'}</td>
                                        <td>{loan.interestRate}%</td>
                                        <td>{loan.tenureDays} days</td>
                                        <td>{formatCurrency(loan.totalRepayable)}</td>
                                        <td>
                                            <Badge variant={
                                                loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'REPAID' ? 'success' :
                                                    loan.status === 'REJECTED' ? 'error' :
                                                        'warning'
                                            }>
                                                {loan.status}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(loan.createdAt)}</td>
                                        <td>
                                            {loan.status === 'REQUESTED' && (
                                                <div className="loan-actions">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleApproveLoan(loan._id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleRejectLoan(loan._id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {loan.status === 'rejected' && loan.rejectionReason && (
                                                <div className="rejection-reason">
                                                    <small>{loan.rejectionReason}</small>
                                                </div>
                                            )}
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

export default Loans;
