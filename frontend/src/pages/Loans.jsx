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
                                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                                onClick={() => setFilter('approved')}
                            >
                                Approved
                            </button>
                            <button
                                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setFilter('rejected')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    <div className="loans-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Purpose</th>
                                    <th>Interest Rate</th>
                                    <th>Tenure</th>
                                    <th>EMI</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr key={loan._id}>
                                        <td>
                                            <div className="loan-user">
                                                <div className="loan-user-name">{loan.user?.name || 'Unknown'}</div>
                                                <div className="loan-user-email">{loan.user?.email || ''}</div>
                                            </div>
                                        </td>
                                        <td className="loan-amount">{formatCurrency(loan.amount)}</td>
                                        <td>{loan.purpose}</td>
                                        <td>{loan.interestRate}%</td>
                                        <td>{loan.tenure} months</td>
                                        <td>{formatCurrency(loan.emiAmount)}</td>
                                        <td>
                                            <Badge variant={
                                                loan.status === 'approved' ? 'success' :
                                                    loan.status === 'rejected' ? 'error' :
                                                        'warning'
                                            }>
                                                {loan.status}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(loan.createdAt)}</td>
                                        <td>
                                            {loan.status === 'pending' && (
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
