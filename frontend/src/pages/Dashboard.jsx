import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/helpers';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Topbar from '../components/Topbar';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
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

                {/* Recent Activity */}
                <Card title="Recent Loan Requests" action={<Link to="/loans" className="view-all-link">View All</Link>}>
                    <div className="recent-activity">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            <div className="activity-list">
                                {stats.recentActivity.map((loan) => (
                                    <div key={loan._id} className="activity-item">
                                        <div className="activity-user">
                                            <div className="activity-avatar">
                                                {loan.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="activity-info">
                                                <div className="activity-name">{loan.user?.name || 'Unknown User'}</div>
                                                <div className="activity-email">{loan.user?.email || ''}</div>
                                            </div>
                                        </div>
                                        <div className="activity-amount">
                                            {formatCurrency(loan.amount)}
                                        </div>
                                        <div className="activity-status">
                                            <Badge variant={
                                                loan.status === 'approved' ? 'success' :
                                                    loan.status === 'rejected' ? 'error' :
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
