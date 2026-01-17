import React, { useState, useEffect, useCallback } from 'react';
import { kycAPI } from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './KYC.css';

const KYC = () => {
    const [kycRecords, setKycRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedKYC, setSelectedKYC] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchKYCRecords = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await kycAPI.getAll(params);
            // Backend returns { kycRecords: [...] }
            setKycRecords(response.data.kycRecords || response.data.data || []);
        } catch (error) {
            console.error('Error fetching KYC records:', error);
            setKycRecords([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchKYCRecords();
    }, [fetchKYCRecords]);

    const handleVerify = async (id) => {
        try {
            await kycAPI.verify(id, { remarks: 'Verified successfully' });
            fetchKYCRecords();
            setShowModal(false);
        } catch (error) {
            console.error('Error verifying KYC:', error);
            alert('Failed to verify KYC');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await kycAPI.reject(id, { remarks: reason });
            fetchKYCRecords();
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting KYC:', error);
            alert('Failed to reject KYC');
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            approved: 'success',
            pending: 'warning',
            rejected: 'danger',
            under_review: 'info'
        };
        return <Badge color={statusColors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="loading">Loading KYC records...</div>;
    }

    return (
        <div className="kyc-page">
            <div className="page-header">
                <h1>KYC Management</h1>
                <div className="filters">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="kyc-grid">
                {kycRecords.map((kyc) => (
                    <Card key={kyc._id}>
                        <div className="kyc-card">
                            <div className="kyc-header">
                                <h3>{kyc.userId?.name || 'Unknown User'}</h3>
                                {getStatusBadge(kyc.status)}
                            </div>
                            <div className="kyc-details">
                                <p><strong>Document Type:</strong> {kyc.documentType}</p>
                                <p><strong>Document Number:</strong> {kyc.documentNumber}</p>
                                <p><strong>Verification Type:</strong> {kyc.verificationType}</p>
                                {kyc.verifiedBy && (
                                    <p><strong>Verified By:</strong> {kyc.verifiedBy.name}</p>
                                )}
                                {kyc.remarks && (
                                    <p><strong>Remarks:</strong> {kyc.remarks}</p>
                                )}
                            </div>
                            <div className="kyc-actions">
                                <Button onClick={() => {
                                    setSelectedKYC(kyc);
                                    setShowModal(true);
                                }}>View Details</Button>
                                {kyc.status === 'pending' && (
                                    <>
                                        <Button color="success" onClick={() => handleVerify(kyc._id)}>
                                            Approve
                                        </Button>
                                        <Button color="danger" onClick={() => handleReject(kyc._id)}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {kycRecords.length === 0 && (
                <div className="no-data">No KYC records found</div>
            )}

            {showModal && selectedKYC && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>KYC Details</h2>
                        <div className="modal-body">
                            <p><strong>User:</strong> {selectedKYC.userId?.name}</p>
                            <p><strong>Email:</strong> {selectedKYC.userId?.email}</p>
                            <p><strong>Phone:</strong> {selectedKYC.userId?.phone}</p>
                            <p><strong>Document Type:</strong> {selectedKYC.documentType}</p>
                            <p><strong>Document Number:</strong> {selectedKYC.documentNumber}</p>
                            <div className="document-images">
                                <div>
                                    <strong>Front:</strong>
                                    <img src={selectedKYC.documentFrontUrl} alt="Document Front" />
                                </div>
                                {selectedKYC.documentBackUrl && (
                                    <div>
                                        <strong>Back:</strong>
                                        <img src={selectedKYC.documentBackUrl} alt="Document Back" />
                                    </div>
                                )}
                                <div>
                                    <strong>Selfie:</strong>
                                    <img src={selectedKYC.selfieUrl} alt="Selfie" />
                                </div>
                            </div>
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

export default KYC;
