import React, { useState, useEffect } from 'react';
import { User, Phone, Shield, Save } from 'lucide-react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import './Profile.css';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/me');
            if (response.data.success) {
                setAdmin(response.data.admin);
                setName(response.data.admin.name);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setSaving(true);
            const response = await api.put('/admin/profile', { name: name.trim() });

            if (response.data.success) {
                setAdmin(response.data.admin);
                setName(response.data.admin.name);
                setSuccess('Profile updated successfully');

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-content">
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    <p>Manage your admin account details</p>
                </div>

                <div className="profile-grid">
                    {/* Profile Info Card */}
                    <Card className="profile-info-card">
                        <div className="profile-avatar">
                            <User size={48} />
                        </div>
                        <h2>{admin?.name}</h2>
                        <div className="profile-role">
                            <Shield size={16} />
                            <span>{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                        </div>
                    </Card>

                    {/* Edit Form Card */}
                    <Card className="profile-form-card">
                        <h3>Edit Profile</h3>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="name">
                                    <User size={18} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="form-input"
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    <Phone size={18} />
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={admin?.phoneNumber || ''}
                                    className="form-input"
                                    disabled
                                    readOnly
                                />
                                <small className="form-hint">Phone number cannot be changed</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">
                                    <Shield size={18} />
                                    Role
                                </label>
                                <input
                                    type="text"
                                    id="role"
                                    value={admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    className="form-input"
                                    disabled
                                    readOnly
                                />
                                <small className="form-hint">Role cannot be changed</small>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={saving || name === admin?.name}
                                className="save-button"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
