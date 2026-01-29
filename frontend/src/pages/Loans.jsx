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
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        disbursed: 0
    });

    useEffect(() => {
        fetchLoans();
    }, [filter]);

    const fetchLoans = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await loansAPI.getAll(params);
            setLoans(response.data.data);
            
            // Calculate stats
            calculateStats(response.data.data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (loansData) => {
        const statsData = {
            total: loansData.length,
            pending: loansData.filter(l => l.status === 'REQUESTED').length,
            approved: loansData.filter(l => l.status === 'APPROVED').length,
            rejected: loansData.filter(l => l.status === 'REJECTED').length,
            disbursed: loansData.filter(l => l.status === 'DISBURSED').length
        };
        setStats(statsData);
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
            <Topbar title="Loan Applications Management" />

            <div className="loans-content">
                {/* Stats Cards */}
                <div className="loans-stats">
                    <Card>
                        <div className="stat-card">
                            <div className="stat-icon total">📊</div>
                            <div className="stat-details">
                                <h3>{filter === 'all' ? stats.total : loans.length}</h3>
                                <p>Total Applications</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="stat-card">
                            <div className="stat-icon pending">⏳</div>
                            <div className="stat-details">
                                <h3>{stats.pending}</h3>
                                <p>Pending Review</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="stat-card">
                            <div className="stat-icon approved">✓</div>
                            <div className="stat-details">
                                <h3>{stats.approved}</h3>
                                <p>Approved</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="stat-card">
                            <div className="stat-icon disbursed">💰</div>
                            <div className="stat-details">
                                <h3>{stats.disbursed}</h3>
                                <p>Disbursed</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="stat-card">
                            <div className="stat-icon rejected">✕</div>
                            <div className="stat-details">
                                <h3>{stats.rejected}</h3>
                                <p>Rejected</p>
                            </div>
                        </div>
                    </Card>
                </div>

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
                                Pending ({stats.pending})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                                onClick={() => setFilter('APPROVED')}
                            >
                                Approved ({stats.approved})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'DISBURSED' ? 'active' : ''}`}
                                onClick={() => setFilter('DISBURSED')}
                            >
                                Disbursed ({stats.disbursed})
                            </button>
                            <button
                                className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                                onClick={() => setFilter('REJECTED')}
                            >
                                Rejected ({stats.rejected})
                            </button>
                        </div>
                        <div className="application-portal-link">
                            <a href="/apply-loan" target="_blank" rel="noopener noreferrer" className="portal-btn">
                                🔗 Open Application Portal
                            </a>
                        </div>
                    </div>

                    <div className="loans-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ref. Number</th>
                                    <th>Phone Number</th>
                                    <th>Amount</th>
                                    <th>Interest</th>
                                    <th>Tenure</th>
                                    <th>Total Repayable</th>
                                    <th>Purpose</th>
                                    <th>Status</th>
                                    <th>Applied On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                                            Loading loan applications...
                                        </td>
                                    </tr>
                                ) : loans.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No loan applications found
                                        </td>
                                    </tr>
                                ) : (
                                    loans.map((loan) => (
                                        <tr key={loan._id}>
                                            <td>
                                                <strong>{loan.loanReferenceNumber || 'N/A'}</strong>
                                            </td>
                                            <td>{loan.phoneNumber}</td>
                                            <td className="loan-amount">{formatCurrency(loan.amount)}</td>
                                            <td>{formatCurrency(loan.interestAmount)} ({loan.interestRate}%)</td>
                                            <td>{loan.tenureDays} days</td>
                                            <td><strong>{formatCurrency(loan.totalRepayable)}</strong></td>
                                            <td>{loan.loanPurpose || 'N/A'}</td>
                                            <td>
                                                <Badge variant={
                                                    loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'REPAID' ? 'success' :
                                                        loan.status === 'REJECTED' ? 'error' :
                                                            'warning'
                                                }>
                                                    {loan.status}
                                                </Badge>
                                            </td>
                                            <td>{formatDate(loan.requestedAt || loan.createdAt)}</td>
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
                                                {loan.status === 'REJECTED' && loan.rejectionReason && (
                                                    <div className="rejection-reason" title={loan.rejectionReason}>
                                                        <small>Reason: {loan.rejectionReason.substring(0, 30)}...</small>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Loans;
