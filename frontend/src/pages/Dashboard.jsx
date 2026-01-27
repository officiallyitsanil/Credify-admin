import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertCircle, TrendingUp, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/helpers';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Topbar from '../components/Topbar';
import './Dashboard.css';
import './DashboardApproval.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            console.log('Dashboard stats:', response.data.data);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Topbar title="Main Dashboard" />

            <div className="dashboard-content">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <Card className="stat-card stat-card-purple">
                        <div className="stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">{formatNumber(stats?.users?.total || 0)}</div>
                            <div className="stat-meta">
                                <span className="stat-badge success">
                                    {stats?.users?.verified || 0} Verified
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="stat-card stat-card-blue">
                        <div className="stat-icon">
                            <FileText size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Active Loans</div>
                            <div className="stat-value">{formatNumber(stats?.loans?.active || 0)}</div>
                            <div className="stat-meta">
                                <span className="stat-badge warning">
                                    {stats?.loans?.pending || 0} Pending
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="stat-card stat-card-red">
                        <div className="stat-icon">
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Overdue Loans</div>
                            <div className="stat-value">{formatNumber(stats?.repayments?.overdue || 0)}</div>
                            <div className="stat-meta">
                                <span className="stat-amount">
                                    {formatCurrency(stats?.repayments?.overdueAmount || 0)}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="stat-card stat-card-green">
                        <div className="stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">{formatCurrency(stats?.revenue?.total || 0)}</div>
                            <div className="stat-meta">
                                <span className="stat-badge success">
                                    Interest Earned
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Overview Cards */}
                <div className="overview-grid">
                    <Card title="Loan Overview" className="overview-card">
                        <div className="overview-stats">
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Total Loans</div>
                                <div className="overview-stat-value">{formatNumber(stats?.loans?.total || 0)}</div>
                            </div>
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Approved</div>
                                <div className="overview-stat-value text-success">{formatNumber(stats?.loans?.approved || 0)}</div>
                            </div>
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Rejected</div>
                                <div className="overview-stat-value text-error">{formatNumber(stats?.loans?.rejected || 0)}</div>
                            </div>
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Completed</div>
                                <div className="overview-stat-value">{formatNumber(stats?.loans?.completed || 0)}</div>
                            </div>
                        </div>
                        <div className="overview-amount">
                            <div className="overview-amount-label">Total Disbursed Amount</div>
                            <div className="overview-amount-value">{formatCurrency(stats?.loans?.totalAmount || 0)}</div>
                        </div>
                    </Card>

                    <Card title="Loan Approval Analytics" className="overview-card">
                        <div className="approval-stats">
                            <div className="approval-stat-row">
                                <div className="approval-stat-item">
                                    <CheckCircle size={20} className="icon-success" />
                                    <div>
                                        <div className="approval-stat-label">Auto-Approved</div>
                                        <div className="approval-stat-value text-success">{formatNumber(stats?.approval?.autoApproved || 0)}</div>
                                    </div>
                                </div>
                                <div className="approval-stat-item">
                                    <Clock size={20} className="icon-warning" />
                                    <div>
                                        <div className="approval-stat-label">Manual Review</div>
                                        <div className="approval-stat-value text-warning">{formatNumber(stats?.approval?.underReview || 0)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="approval-stat-row">
                                <div className="approval-stat-item">
                                    <Users size={20} className="icon-info" />
                                    <div>
                                        <div className="approval-stat-label">Manual Approved</div>
                                        <div className="approval-stat-value">{formatNumber(stats?.approval?.manualApproved || 0)}</div>
                                    </div>
                                </div>
                                <div className="approval-stat-item">
                                    <XCircle size={20} className="icon-error" />
                                    <div>
                                        <div className="approval-stat-label">Auto-Rejected</div>
                                        <div className="approval-stat-value text-error">{formatNumber(stats?.approval?.autoRejected || 0)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="approval-rates">
                            <div className="approval-rate-item">
                                <div className="approval-rate-label">Approval Rate</div>
                                <div className="approval-rate-value">{stats?.approval?.approvalRate || 0}%</div>
                            </div>
                            <div className="approval-rate-item">
                                <div className="approval-rate-label">Auto-Approval Rate</div>
                                <div className="approval-rate-value">{stats?.approval?.autoApprovalRate || 0}%</div>
                            </div>
                        </div>
                    </Card>

                    <Card title="User Statistics" className="overview-card">
                        <div className="overview-stats">
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Verified Users</div>
                                <div className="overview-stat-value text-success">{formatNumber(stats?.users?.verified || 0)}</div>
                            </div>
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Pending KYC</div>
                                <div className="overview-stat-value text-warning">{formatNumber(stats?.users?.pendingKyc || 0)}</div>
                            </div>
                            <div className="overview-stat-item">
                                <div className="overview-stat-label">Blocked Users</div>
                                <div className="overview-stat-value text-error">{formatNumber(stats?.users?.blocked || 0)}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Risk Distribution */}
                {stats?.approval?.riskDistribution && stats.approval.riskDistribution.length > 0 && (
                    <Card title="Risk Score Distribution" className="risk-distribution-card">
                        <div className="risk-distribution">
                            {stats.approval.riskDistribution.map((item) => (
                                <div key={item.category} className={`risk-item risk-${item.category.toLowerCase()}`}>
                                    <div className="risk-category">
                                        <span className={`risk-badge risk-badge-${item.category.toLowerCase()}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="risk-stats">
                                        <div className="risk-count">{formatNumber(item.count)} loans</div>
                                        <div className="risk-score">Avg Score: {item.avgScore}/100</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Manual Review Queue */}
                {stats?.approval?.manualReviewQueue && stats.approval.manualReviewQueue.length > 0 && (
                    <Card title="Manual Review Queue" action={<Link to="/loans" className="view-all-link">View All</Link>}>
                        <div className="review-queue">
                            {stats.approval.manualReviewQueue.map((loan) => (
                                <div key={loan._id} className="review-item">
                                    <div className="review-info">
                                        <div className="review-phone">{loan.phoneNumber}</div>
                                        <div className="review-amount">{formatCurrency(loan.amount)}</div>
                                    </div>
                                    <div className="review-risk">
                                        <Badge variant={
                                            loan.riskCategory === 'LOW' ? 'success' :
                                            loan.riskCategory === 'MEDIUM' ? 'warning' :
                                            'error'
                                        }>
                                            {loan.riskCategory} RISK
                                        </Badge>
                                        <span className="review-score">Score: {loan.riskScore}</span>
                                    </div>
                                    {loan.riskFactors && loan.riskFactors.length > 0 && (
                                        <div className="review-factors">
                                            {loan.riskFactors.slice(0, 2).map((factor, idx) => (
                                                <span key={idx} className="risk-factor">{factor}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Recent Activity */}
                <Card title="Recent Loan Requests" action={<Link to="/loans" className="view-all-link">View All</Link>}>
                    <div className="recent-activity">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            <div className="activity-list">
                                {stats.recentActivity.map((loan) => (
                                    <div key={loan._id} className="activity-item">
                                        <div className="activity-user">
                                            <div className="activity-avatar">
                                                {loan.user?.name 
                                                    ? loan.user.name.charAt(0).toUpperCase() 
                                                    : loan.phoneNumber 
                                                        ? loan.phoneNumber.charAt(loan.phoneNumber.length - 4) 
                                                        : 'U'}
                                            </div>
                                            <div className="activity-info">
                                                <div className="activity-name">
                                                    {loan.user?.name || loan.phoneNumber || 'Unknown User'}
                                                </div>
                                                <div className="activity-email">
                                                    {loan.user?.email || loan.loanReferenceNumber || loan.phoneNumber || 'No details'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="activity-amount">
                                            {formatCurrency(loan.amount)}
                                        </div>
                                        <div className="activity-status">
                                            <Badge variant={
                                                loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'REPAID' ? 'success' :
                                                    loan.status === 'REJECTED' ? 'error' :
                                                        loan.status === 'UNDER_REVIEW' ? 'warning' :
                                                        'warning'
                                            }>
                                                {loan.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No recent loan requests</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
