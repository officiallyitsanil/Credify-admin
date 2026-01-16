import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Shield, Save, X, Camera, Mail, FileText } from 'lucide-react';
import api from '../utils/api';
import Button from './Button';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');
    const [role, setRole] = useState('admin');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/me');
            if (response.data.success) {
                setAdmin(response.data.admin);
                setName(response.data.admin.name);
                setEmail(response.data.admin.email || '');
                setBio(response.data.admin.bio || '');
                setProfilePhoto(response.data.admin.profilePhoto || '');
                setPhotoPreview(response.data.admin.profilePhoto || '');
                setRole(response.data.admin.role || 'admin');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Photo size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setProfilePhoto('');
        setPhotoPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

        // Validate email format if provided
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please provide a valid email address');
            return;
        }

        // Validate bio length
        if (bio.length > 500) {
            setError('Bio must be less than 500 characters');
            return;
        }

        try {
            setSaving(true);
            const response = await api.put('/admin/profile', {
                name: name.trim(),
                email: email.trim(),
                bio: bio.trim(),
                profilePhoto: profilePhoto,
                role: role
            });

            if (response.data.success) {
                setAdmin(response.data.admin);
                setName(response.data.admin.name);
                setEmail(response.data.admin.email || '');
                setBio(response.data.admin.bio || '');
                setProfilePhoto(response.data.admin.profilePhoto || '');
                setRole(response.data.admin.role || 'admin');
                setSuccess('Profile updated successfully');

                // Update local storage
                const currentAdmin = JSON.parse(localStorage.getItem('admin'));
                localStorage.setItem('admin', JSON.stringify({
                    ...currentAdmin,
                    name: response.data.admin.name,
                    email: response.data.admin.email,
                    bio: response.data.admin.bio,
                    profilePhoto: response.data.admin.profilePhoto,
                    role: response.data.admin.role
                }));

                // Notify parent component
                if (onUpdate) {
                    onUpdate(response.data.admin);
                }

                // Close modal after 1 second
                setTimeout(() => {
                    onClose();
                    setSuccess('');
                }, 1000);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="modal-body">
                        <div className="modal-loading">
                            <div className="spinner"></div>
                        </div>
                    </div>
                ) : (
                    <div className="modal-body">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-modal" onClick={() => fileInputRef.current?.click()}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="profile-photo-img" />
                                ) : (
                                    <User size={48} />
                                )}
                                <div className="profile-photo-overlay">
                                    <Camera size={24} />
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                            {photoPreview && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="remove-photo-btn"
                                >
                                    Remove Photo
                                </button>
                            )}
                            <div className="profile-role-badge">
                                <Shield size={16} />
                                <span>{admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                            </div>
                        </div>

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

                        <form onSubmit={handleSubmit} className="profile-form-modal">
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
                                <label htmlFor="email">
                                    <Mail size={18} />
                                    Email Address (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="form-input"
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">
                                    <FileText size={18} />
                                    Bio (Optional)
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    className="form-input form-textarea"
                                    rows="3"
                                    maxLength="500"
                                    disabled={saving}
                                />
                                <small className="form-hint">{bio.length}/500 characters</small>
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
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="form-input"
                                    disabled={saving}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={saving || (name === admin?.name && email === (admin?.email || '') && bio === (admin?.bio || '') && profilePhoto === (admin?.profilePhoto || '') && role === (admin?.role || 'admin'))}
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
