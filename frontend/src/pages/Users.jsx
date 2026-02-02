import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Users.css';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [creditLimitData, setCreditLimitData] = useState({
        userId: null,
        creditLimit: 0,
        reason: '',
        riskCategory: 'medium'
    });

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = filter !== 'all' ? { kycStatus: filter } : {};
            const response = await usersAPI.getAll(params);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKYCUpdate = async (userId, status, reason = '') => {
        try {
            await usersAPI.updateKYC(userId, { kycStatus: status, rejectionReason: reason });
            fetchUsers();
            setShowModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error updating KYC:', error);
            alert('Failed to update KYC status');
        }
    };

    const openCreditLimitModal = (user) => {
        setCreditLimitData({
            userId: user._id,
            creditLimit: user.creditLimit,
            reason: '',
            riskCategory: 'medium'
        });
        setShowCreditModal(true);
    };

    const handleCreditLimitUpdate = async () => {
        if (!creditLimitData.reason.trim()) {
            alert('Please provide a reason for changing the credit limit');
            return;
        }

        if (creditLimitData.creditLimit < 0) {
            alert('Credit limit cannot be negative');
            return;
        }

        try {
            await usersAPI.updateCreditLimit(creditLimitData.userId, {
                creditLimit: parseInt(creditLimitData.creditLimit),
                reason: creditLimitData.reason,
                riskCategory: creditLimitData.riskCategory
            });
            fetchUsers();
            setShowCreditModal(false);
            setCreditLimitData({
                userId: null,
                creditLimit: 0,
                reason: '',
                riskCategory: 'medium'
            });
        } catch (error) {
            console.error('Error updating credit limit:', error);
            alert('Failed to update credit limit');
        }
    };

    const handleBlockUser = async (userId, block) => {
        const reason = block ? prompt('Enter reason for blocking:') : '';
        if (block && !reason) return;

        try {
            await usersAPI.updateStatus(userId, {
                isBlocked: block,
                blockReason: reason
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Failed to update user status');
        }
    };

    return (
        <div className="users-page">
            <Topbar title="Users & KYC Verification" />

            <div className="users-content">
                <Card>
                    <div className="users-header">
                        <div className="users-filters">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All Users
                            </button>
                            <button
                                className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                                onClick={() => setFilter('PENDING')}
                            >
                                Pending KYC
                            </button>
                            <button
                                className={`filter-btn ${filter === 'VERIFIED' ? 'active' : ''}`}
                                onClick={() => setFilter('VERIFIED')}
                            >
                                Verified
                            </button>
                            <button
                                className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                                onClick={() => setFilter('REJECTED')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    <div className="users-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Contact</th>
                                    <th>KYC Status</th>
                                    <th>Credit Limit</th>
                                    <th>Account Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{user.fullName?.charAt(0) || 'U'}</div>
                                                <div>
                                                    <div className="user-name">{user.fullName}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.phoneNumber}</td>
                                        <td>
                                            <Badge variant={
                                                user.kycStatus === 'VERIFIED' ? 'success' :
                                                    user.kycStatus === 'REJECTED' ? 'error' :
                                                        'warning'
                                            }>
                                                {user.kycStatus}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="credit-limit-cell">
                                                <span className="credit-limit-value">{formatCurrency(user.creditLimit)}</span>
                                                <button
                                                    className="edit-credit-btn"
                                                    onClick={() => openCreditLimitModal(user)}
                                                    title="Edit Credit Limit"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={user.isBlocked ? 'error' : 'success'}>
                                                {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {user.kycStatus === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleKYCUpdate(user._id, 'VERIFIED')}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => {
                                                                const reason = prompt('Enter rejection reason:');
                                                                if (reason) handleKYCUpdate(user._id, 'REJECTED', reason);
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant={!user.isBlocked ? 'danger' : 'success'}
                                                    onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                                                >
                                                    {!user.isBlocked ? 'Block' : 'Unblock'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

            {/* Credit Limit Modal */}
            {showCreditModal && (
                <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Update Credit Limit</h3>
                            <button className="modal-close" onClick={() => setShowCreditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Credit Limit (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={creditLimitData.creditLimit}
                                    onChange={(e) => setCreditLimitData({
                                        ...creditLimitData,
                                        creditLimit: e.target.value
                                    })}
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Risk Category</label>
                                <select
                                    className="form-input"
                                    value={creditLimitData.riskCategory}
                                    onChange={(e) => setCreditLimitData({
                                        ...creditLimitData,
                                        riskCategory: e.target.value
                                    })}
                                >
                                    <option value="low">Low Risk</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="high">High Risk</option>
                                    <option value="very_high">Very High Risk</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Reason for Change *</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    placeholder="Enter reason for credit limit adjustment..."
                                    value={creditLimitData.reason}
                                    onChange={(e) => setCreditLimitData({
                                        ...creditLimitData,
                                        reason: e.target.value
                                    })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowCreditModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleCreditLimitUpdate}>
                                Update Credit Limit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Users;
