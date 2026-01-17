import React, { useState, useEffect } from 'react';
import { settingsAPI, auditAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('settings');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [settingsRes, auditRes] = await Promise.all([
                settingsAPI.getAll(),
                auditAPI.getAll({ limit: 50 })
            ]);
            setSettings(settingsRes.data.data || settingsRes.data);
            setAuditLogs(auditRes.data.data || auditRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            create: 'success',
            update: 'info',
            delete: 'danger',
            login: 'info',
            logout: 'secondary',
            approve: 'success',
            reject: 'danger'
        };
        return <Badge color={colors[action] || 'secondary'}>{action}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading settings...</div>;
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>System Settings & Audit Logs</h1>
                <div className="tabs">
                    <button
                        className={activeTab === 'settings' ? 'active' : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings ({settings.length})
                    </button>
                    <button
                        className={activeTab === 'audit' ? 'active' : ''}
                        onClick={() => setActiveTab('audit')}
                    >
                        Audit Logs ({auditLogs.length})
                    </button>
                </div>
            </div>

            {activeTab === 'settings' && (
                <div className="settings-grid">
                    {settings.map((setting) => (
                        <Card key={setting._id}>
                            <div className="setting-card">
                                <div className="setting-header">
                                    <h3>{setting.settingKey || setting.key}</h3>
                                    {setting.isActive !== undefined && (
                                        <Badge color={setting.isActive ? 'success' : 'secondary'}>
                                            {setting.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                </div>
                                <div className="setting-details">
                                    {setting.settingValue && (
                                        <div className="setting-value">
                                            <strong>Value:</strong>
                                            <pre>{JSON.stringify(setting.settingValue, null, 2)}</pre>
                                        </div>
                                    )}
                                    {setting.description && (
                                        <p className="description">{setting.description}</p>
                                    )}
                                    {setting.category && (
                                        <p><strong>Category:</strong> {setting.category}</p>
                                    )}
                                    {setting.lastModifiedBy && (
                                        <p className="modified-by">
                                            Last modified by: {setting.lastModifiedBy.name} on{' '}
                                            {new Date(setting.updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {settings.length === 0 && (
                        <div className="no-data">No settings found</div>
                    )}
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="audit-list">
                    {auditLogs.map((log) => (
                        <Card key={log._id}>
                            <div className="audit-item">
                                <div className="audit-header">
                                    <div className="audit-info">
                                        <h4>{log.action} - {log.entity}</h4>
                                        <p className="audit-date">
                                            {new Date(log.timestamp || log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {getActionBadge(log.action)}
                                </div>
                                <div className="audit-details">
                                    <p><strong>Performed By:</strong> {log.performedBy?.name || log.performedBy?.email || 'System'}</p>
                                    {log.entityId && (
                                        <p><strong>Entity ID:</strong> {log.entityId}</p>
                                    )}
                                    {log.ipAddress && (
                                        <p><strong>IP Address:</strong> {log.ipAddress}</p>
                                    )}
                                    {log.description && (
                                        <p className="description">{log.description}</p>
                                    )}
                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                        <div className="changes">
                                            <strong>Changes:</strong>
                                            <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {auditLogs.length === 0 && (
                        <div className="no-data">No audit logs found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Settings;
