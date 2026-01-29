import React, { useState, useEffect } from 'react';
import './LoanApplication.css';

// API URL configuration
const API_URL = import.meta.env.MODE === 'production'
    ? 'https://credifyapp-admin.onrender.com/api'
    : 'http://localhost:5003/api';

const LoanApplication = () => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        fullName: '',
        email: '',
        amount: '',
        tenureDays: '30',
        loanPurpose: '',
        termsAccepted: false
    });

    const [loanSettings, setLoanSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [calculatedInterest, setCalculatedInterest] = useState(0);
    const [totalRepayable, setTotalRepayable] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loanReference, setLoanReference] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLoanSettings();
    }, []);

    useEffect(() => {
        if (!loanSettings || !formData.amount) return;

        const amount = parseFloat(formData.amount);
        const tenure = parseInt(formData.tenureDays);
        const rate = loanSettings.interestRate;

        let interest = 0;
        if (loanSettings.interestCalculationMethod === 'SIMPLE') {
            interest = (amount * rate * tenure) / (100 * 365);
        } else {
            interest = amount * Math.pow((1 + rate / (100 * 365)), tenure) - amount;
        }

        setCalculatedInterest(interest);
        setTotalRepayable(amount + interest);
    }, [formData.amount, formData.tenureDays, loanSettings]);

    const fetchLoanSettings = async () => {
        try {
            const response = await fetch(`${API_URL}/loan-application/settings`);
            const data = await response.json();
            if (data.success) {
                setLoanSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching loan settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            setError('Please enter your full name');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) < loanSettings.minLoanAmount || parseFloat(formData.amount) > loanSettings.maxLoanAmount) {
            setError(`Loan amount must be between ₹${loanSettings.minLoanAmount} and ₹${loanSettings.maxLoanAmount}`);
            return;
        }

        if (!formData.termsAccepted) {
            setError('You must accept the terms and conditions');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/loan-application/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    tenureDays: parseInt(formData.tenureDays)
                })
            });

            const data = await response.json();

            if (data.success) {
                setLoanReference(data.data.loanReferenceNumber);
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to submit loan application');
            }
        } catch (error) {
            console.error('Error submitting loan application:', error);
            setError('Failed to submit loan application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!loanSettings) {
        return (
            <div className="loan-application-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="loan-application-page">
                <div className="success-container">
                    <div className="success-icon">✓</div>
                    <h1>Application Submitted Successfully!</h1>
                    <div className="success-details">
                        <p><strong>Loan Reference Number:</strong></p>
                        <p className="reference-number">{loanReference}</p>
                        <p className="info-text">Please save this reference number for future reference.</p>
                        <p className="info-text">Your application is being reviewed. You will be notified once it's processed.</p>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({
                                phoneNumber: '',
                                fullName: '',
                                email: '',
                                amount: '',
                                tenureDays: '30',
                                loanPurpose: '',
                                termsAccepted: false
                            });
                        }}
                    >
                        Apply for Another Loan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="loan-application-page">
            <div className="application-header">
                <h1>Credify Loan Application</h1>
                <p>Quick and easy loan approval process</p>
            </div>

            <div className="application-container">
                <div className="application-form-section">
                    <h2>Apply for a Loan</h2>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number *</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter 10-digit mobile number"
                                maxLength="10"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email (Optional)</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount">Loan Amount (₹) *</label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder={`Min: ${loanSettings.minLoanAmount}, Max: ${loanSettings.maxLoanAmount}`}
                                min={loanSettings.minLoanAmount}
                                max={loanSettings.maxLoanAmount}
                                required
                            />
                            <small className="helper-text">
                                Amount range: ₹{loanSettings.minLoanAmount.toLocaleString()} - ₹{loanSettings.maxLoanAmount.toLocaleString()}
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tenureDays">Loan Tenure *</label>
                            <select
                                id="tenureDays"
                                name="tenureDays"
                                value={formData.tenureDays}
                                onChange={handleChange}
                                required
                            >
                                <option value="7">7 Days</option>
                                <option value="15">15 Days</option>
                                <option value="30">30 Days</option>
                                <option value="45">45 Days</option>
                                <option value="60">60 Days</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="loanPurpose">Loan Purpose (Optional)</label>
                            <textarea
                                id="loanPurpose"
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                placeholder="Briefly describe the purpose of the loan"
                                rows="3"
                            />
                        </div>

                        <div className="calculation-summary">
                            <h3>Loan Summary</h3>
                            <div className="summary-row">
                                <span>Principal Amount:</span>
                                <span>₹{formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}</span>
                            </div>
                            <div className="summary-row">
                                <span>Interest ({loanSettings.interestRate}% per annum):</span>
                                <span>₹{calculatedInterest.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span><strong>Total Repayable:</strong></span>
                                <span><strong>₹{totalRepayable.toFixed(2)}</strong></span>
                            </div>
                        </div>

                        <div className="form-group-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    required
                                />
                                <span>I accept the terms and conditions *</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>

                <div className="application-info-section">
                    <div className="info-card">
                        <h3>Why Choose Credify?</h3>
                        <ul className="benefits-list">
                            <li>✓ Quick approval process</li>
                            <li>✓ Minimal documentation</li>
                            <li>✓ Competitive interest rates</li>
                            <li>✓ Flexible tenure options</li>
                            <li>✓ Instant disbursement</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3>How It Works</h3>
                        <ol className="steps-list">
                            <li>Fill the application form</li>
                            <li>Submit required documents</li>
                            <li>Get instant approval</li>
                            <li>Receive funds in your account</li>
                        </ol>
                    </div>

                    <div className="info-card">
                        <h3>Need Help?</h3>
                        <p>Contact our support team:</p>
                        <p><strong>Phone:</strong> 1800-XXX-XXXX</p>
                        <p><strong>Email:</strong> support@credify.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanApplication;
