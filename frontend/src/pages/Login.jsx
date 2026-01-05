import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { adminAPI } from '../utils/api';
import { setAuth } from '../utils/auth';
import Button from '../components/Button';
import logo from '../assets/logo.jpeg';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Setup reCAPTCHA verifier
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Phone number must be in international format (e.g., +1234567890)
            if (!phoneNumber.startsWith('+')) {
                setError('Phone number must start with country code (e.g., +91)');
                setLoading(false);
                return;
            }

            // First, check if phone number is authorized in database
            try {
                console.log('Checking phone number authorization:', phoneNumber);
                await adminAPI.checkPhone({ phoneNumber });
                console.log('Phone number authorized');
            } catch (checkErr) {
                console.error('Phone check failed:', checkErr);
                setError(checkErr.response?.data?.message || 'This phone number is not authorized.');
                setLoading(false);
                return;
            }

            // If authorized, proceed with Firebase OTP
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

            setVerificationId(confirmationResult);
            setOtpSent(true);
            setError('');
        } catch (err) {
            console.error('Error sending OTP:', err);
            setError(err.message || 'Failed to send OTP. Please try again.');
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!verificationId) {
                setError('Please request OTP first');
                setLoading(false);
                return;
            }

            const result = await verificationId.confirm(otp);
            const user = result.user;

            // Get Firebase ID token
            const idToken = await user.getIdToken();

            // Verify with backend and check phone number authorization
            try {
                console.log('Verifying with backend, idToken:', idToken);
                const response = await adminAPI.verify({ idToken });
                console.log('Backend verification response:', response.data);
                const { admin } = response.data;

                // Store auth info with Firebase token
                setAuth(idToken, admin);
                console.log('Auth stored, navigating to dashboard');

                navigate('/');
            } catch (backendErr) {
                console.error('Backend verification failed:', backendErr);
                console.error('Error response:', backendErr.response?.data);
                // Sign out from Firebase if backend rejects
                await auth.signOut();
                setError(backendErr.response?.data?.message || 'Access denied. Please contact administrator.');
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={logo} alt="Credify" className="login-logo-img" />
                    </div>
                    <h2>Admin Panel</h2>
                    <p>Sign in with your phone number</p>
                </div>

                {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="login-form">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+911234567890"
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                Include country code (e.g., +91 for India)
                            </small>
                        </div>

                        <div id="recaptcha-container"></div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>

                        <div className="login-demo-info">
                            <p><strong>Authorized Access Only:</strong></p>
                            <p>Only authorized phone number can access this admin panel</p>
                            <p>Contact system administrator for access</p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                OTP sent to {phoneNumber}
                            </small>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                                setVerificationId(null);
                            }}
                            style={{ marginTop: '10px' }}
                        >
                            Change Phone Number
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
