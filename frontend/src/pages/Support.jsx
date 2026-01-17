import React, { useState, useEffect, useCallback } from 'react';
import { supportAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Support.css';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await supportAPI.getAll(params);
            // Backend returns { tickets: [...] }
            setTickets(response.data.tickets || response.data.data || []);
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const getStatusBadge = (status) => {
        const colors = {
            open: 'warning',
            assigned: 'info',
            in_progress: 'info',
            pending_customer: 'warning',
            resolved: 'success',
            closed: 'secondary',
            reopened: 'danger'
        };
        return <Badge color={colors[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            urgent: 'danger'
        };
        return <Badge color={colors[priority] || 'secondary'}>{priority}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading support tickets...</div>;
    }

    return (
        <div className="support-page">
            <div className="page-header">
                <h1>Customer Support & Tickets</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="tickets-grid">
                {tickets.map((ticket) => (
                    <Card key={ticket._id}>
                        <div className="ticket-card">
                            <div className="ticket-header">
                                <div>
                                    <h3>{ticket.subject}</h3>
                                    <p className="ticket-number">#{ticket.ticketNumber}</p>
                                </div>
                                <div className="badges">
                                    {getStatusBadge(ticket.status)}
                                    {getPriorityBadge(ticket.priority)}
                                </div>
                            </div>
                            <div className="ticket-details">
                                <p><strong>User:</strong> {ticket.userId?.fullName || ticket.userId?.name || 'Unknown'}</p>
                                <p><strong>Category:</strong> {ticket.category.replace(/_/g, ' ')}</p>
                                <p className="description">{ticket.description}</p>
                                {ticket.assignedTo && (
                                    <p><strong>Assigned To:</strong> {ticket.assignedTo.name}</p>
                                )}
                                <p className="created-date">
                                    Created: {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                                {ticket.responses && ticket.responses.length > 0 && (
                                    <div className="responses-count">
                                        <Badge color="info">{ticket.responses.length} responses</Badge>
                                    </div>
                                )}
                            </div>
                            <div className="ticket-actions">
                                <Button onClick={() => {
                                    setSelectedTicket(ticket);
                                    setShowModal(true);
                                }}>View Details</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {tickets.length === 0 && (
                <div className="no-data">No support tickets found</div>
            )}

            {showModal && selectedTicket && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <h2>Ticket Details - #{selectedTicket.ticketNumber}</h2>
                        <div className="modal-body">
                            <div className="ticket-info">
                                <p><strong>Subject:</strong> {selectedTicket.subject}</p>
                                <p><strong>User:</strong> {selectedTicket.userId?.fullName || selectedTicket.userId?.name}</p>
                                <p><strong>Category:</strong> {selectedTicket.category}</p>
                                <p><strong>Priority:</strong> {selectedTicket.priority}</p>
                                <p><strong>Status:</strong> {selectedTicket.status}</p>
                                <p><strong>Description:</strong></p>
                                <p className="description-full">{selectedTicket.description}</p>
                            </div>
                            {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                                <div className="responses-section">
                                    <h3>Responses</h3>
                                    {selectedTicket.responses.map((response, index) => (
                                        <div key={index} className="response-item">
                                            <div className="response-header">
                                                <Badge color={response.respondedBy === 'admin' ? 'info' : 'secondary'}>
                                                    {response.respondedBy}
                                                </Badge>
                                                <span className="response-date">
                                                    {new Date(response.respondedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="response-message">{response.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedTicket.resolution && (
                                <div className="resolution-section">
                                    <h3>Resolution</h3>
                                    <p>{selectedTicket.resolution.resolutionNotes}</p>
                                    <p className="resolved-by">
                                        Resolved by: {selectedTicket.resolution.resolvedBy?.name} on {new Date(selectedTicket.resolution.resolvedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <Button onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
