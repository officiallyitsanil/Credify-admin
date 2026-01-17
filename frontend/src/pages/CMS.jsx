import React, { useState, useEffect, useCallback } from 'react';
import { cmsAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './CMS.css';

const CMS = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchContent = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { contentType: filter } : {};
            const response = await cmsAPI.getAll(params);
            // Backend returns { content: [...] }
            setContent(response.data.content || response.data.data || []);
        } catch (error) {
            console.error('Error fetching CMS content:', error);
            setContent([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const getStatusBadge = (status) => {
        const colors = {
            draft: 'secondary',
            published: 'success',
            archived: 'warning'
        };
        return <Badge color={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading CMS content...</div>;
    }

    return (
        <div className="cms-page">
            <div className="page-header">
                <h1>CMS & Content Management</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="page">Pages</option>
                        <option value="blog">Blog</option>
                        <option value="faq">FAQ</option>
                        <option value="terms">Terms</option>
                        <option value="privacy">Privacy</option>
                        <option value="banner">Banners</option>
                    </select>
                </div>
            </div>

            <div className="content-grid">
                {content.map((item) => (
                    <Card key={item._id}>
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>{item.title}</h3>
                                    <p className="slug">/{item.slug}</p>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>
                            <div className="content-details">
                                <p><strong>Type:</strong> {item.contentType}</p>
                                {item.category && (
                                    <p><strong>Category:</strong> {item.category}</p>
                                )}
                                {item.shortDescription && (
                                    <p className="description">{item.shortDescription}</p>
                                )}
                                {!item.shortDescription && item.content && (
                                    <p className="description">{item.content.substring(0, 150)}...</p>
                                )}
                                <div className="meta-info">
                                    <p><strong>Author:</strong> {item.author?.name || 'Unknown'}</p>
                                    <p><strong>Visibility:</strong> {item.visibility}</p>
                                    {item.publishedAt && (
                                        <p><strong>Published:</strong> {new Date(item.publishedAt).toLocaleDateString()}</p>
                                    )}
                                    {item.viewCount !== undefined && (
                                        <p><strong>Views:</strong> {item.viewCount}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {content.length === 0 && (
                <div className="no-data">No CMS content found</div>
            )}
        </div>
    );
};

export default CMS;
