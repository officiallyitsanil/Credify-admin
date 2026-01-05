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

    const handleCreditLimitUpdate = async (userId, creditLimit) => {
        try {
            await usersAPI.updateCreditLimit(userId, { creditLimit: parseInt(creditLimit) });
            fetchUsers();
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
                accountStatus: block ? 'blocked' : 'active',
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
                                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending KYC
                            </button>
                            <button
                                className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
                                onClick={() => setFilter('verified')}
                            >
                                Verified
                            </button>
                            <button
                                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setFilter('rejected')}
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
                                                <div className="user-avatar">{user.name.charAt(0)}</div>
                                                <div>
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <Badge variant={
                                                user.kycStatus === 'verified' ? 'success' :
                                                    user.kycStatus === 'rejected' ? 'error' :
                                                        'warning'
                                            }>
                                                {user.kycStatus}
                                            </Badge>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="credit-input"
                                                value={user.creditLimit}
                                                onChange={(e) => handleCreditLimitUpdate(user._id, e.target.value)}
                                                onBlur={(e) => handleCreditLimitUpdate(user._id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Badge variant={user.accountStatus === 'active' ? 'success' : 'error'}>
                                                {user.accountStatus}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {user.kycStatus === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleKYCUpdate(user._id, 'verified')}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => {
                                                                const reason = prompt('Enter rejection reason:');
                                                                if (reason) handleKYCUpdate(user._id, 'rejected', reason);
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant={user.accountStatus === 'active' ? 'danger' : 'success'}
                                                    onClick={() => handleBlockUser(user._id, user.accountStatus === 'active')}
                                                >
                                                    {user.accountStatus === 'active' ? 'Block' : 'Unblock'}
                                                </Button>
                                            </div>
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

export default Users;
