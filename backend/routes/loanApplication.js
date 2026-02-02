const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const LoanSettings = require('../models/LoanSettings');
const CreditLimit = require('../models/CreditLimit');
const { notifyLoanApplication } = require('../utils/notificationService');

// @route   POST /api/loan-application/apply
// @desc    Submit a new loan application (Public route - no auth required)
// @access  Public
router.post('/apply', async (req, res) => {
    try {
        const {
            phoneNumber,
            fullName,
            email,
            amount,
            tenureDays,
            loanPurpose,
            termsAccepted
        } = req.body;

        // Validate required fields
        if (!phoneNumber || !fullName || !amount || !tenureDays) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: phoneNumber, fullName, amount, and tenureDays'
            });
        }

        // Validate terms acceptance
        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: 'You must accept the terms and conditions to apply for a loan'
            });
        }

        // Validate tenure
        const validTenures = [7, 15, 30, 45, 60];
        if (!validTenures.includes(parseInt(tenureDays))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tenure. Please select 7, 15, 30, 45, or 60 days'
            });
        }

        // Get or create user
        let user = await User.findOne({ phoneNumber });
        let isNewUser = false;
        
        if (!user) {
            // Create new user with default credit limit
            isNewUser = true;
            user = new User({
                phoneNumber,
                fullName,
                email: email || undefined,
                kycStatus: 'PENDING',
                creditLimit: 50000 // Default credit limit for new users
            });
            await user.save();

            // Create CreditLimit entry for the new user
            const creditLimitEntry = new CreditLimit({
                userId: user._id,
                totalLimit: 50000,
                availableLimit: 50000,
                utilizedLimit: 0,
                blockedLimit: 0,
                riskCategory: 'medium',
                limitType: 'provisional'
            });
            await creditLimitEntry.save();
        } else {
            // Update user details if provided
            if (fullName) user.fullName = fullName;
            if (email) user.email = email;
            
            // Set default credit limit if not already set
            if (!user.creditLimit || user.creditLimit === 0) {
                user.creditLimit = 50000;
            }
            
            await user.save();

            // Check if CreditLimit entry exists, create if not
            let creditLimitEntry = await CreditLimit.findOne({ userId: user._id });
            if (!creditLimitEntry) {
                creditLimitEntry = new CreditLimit({
                    userId: user._id,
                    totalLimit: user.creditLimit,
                    availableLimit: user.creditLimit,
                    utilizedLimit: 0,
                    blockedLimit: 0,
                    riskCategory: 'medium',
                    limitType: 'provisional'
                });
                await creditLimitEntry.save();
            }
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account is blocked. Please contact support.'
            });
        }

        // Check for existing pending loan
        const existingLoan = await Loan.findOne({
            phoneNumber,
            status: { $in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED'] }
        });

        if (existingLoan) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending loan application. Please wait for it to be processed.'
            });
        }

        // Get loan settings for interest calculation
        let loanSettings = await LoanSettings.findOne();
        
        if (!loanSettings) {
            // Create default settings if none exist
            loanSettings = new LoanSettings({
                minLoanAmount: 1000,
                maxLoanAmount: 50000,
                interestRate: 2.5,
                interestCalculationMethod: 'SIMPLE',
                interestBasis: 'DAILY',
                lateFeeRate: 100,
                lateFeeType: 'PER_DAY'
            });
            await loanSettings.save();
        }

        // Validate loan amount
        if (amount < loanSettings.minLoanAmount || amount > loanSettings.maxLoanAmount) {
            return res.status(400).json({
                success: false,
                message: `Loan amount must be between ₹${loanSettings.minLoanAmount} and ₹${loanSettings.maxLoanAmount}`
            });
        }

        // Calculate interest and total repayable amount
        const interestRate = parseFloat(loanSettings.interestRate) || 2.5;
        let interestAmount = 0;

        if (loanSettings.interestCalculationMethod === 'SIMPLE') {
            // Simple interest calculation
            const days = parseInt(tenureDays);
            const principal = parseFloat(amount);
            interestAmount = (principal * interestRate * days) / (100 * 365);
        } else {
            // Compound interest calculation
            const days = parseInt(tenureDays);
            const principal = parseFloat(amount);
            interestAmount = principal * Math.pow((1 + interestRate / (100 * 365)), days) - principal;
        }

        // Ensure valid numbers
        if (isNaN(interestAmount)) {
            interestAmount = 0;
        }

        const totalRepayable = parseFloat(amount) + interestAmount;

        // Generate unique loan reference number
        const loanReferenceNumber = `LN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Calculate due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tenureDays);

        // Create loan application
        const loan = new Loan({
            phoneNumber,
            amount,
            tenureDays,
            interestRate,
            interestAmount,
            interestCalculationMethod: loanSettings.interestCalculationMethod,
            interestBasis: loanSettings.interestBasis,
            totalRepayable,
            loanReferenceNumber,
            loanPurpose: loanPurpose || 'Personal',
            termsAccepted,
            termsAcceptedAt: new Date(),
            termsVersion: '1.0',
            status: 'REQUESTED',
            requestedAt: new Date(),
            dueDate,
            lateFeeRate: loanSettings.lateFeeRate || 0,
            lateFeeType: loanSettings.lateFeeType || 'PER_DAY'
        });

        await loan.save();

        // Send notifications to user
        notifyLoanApplication(phoneNumber, loan).catch(err => {
            console.error('Error sending loan application notification:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully!',
            data: {
                loanReferenceNumber: loan.loanReferenceNumber,
                amount: loan.amount,
                tenureDays: loan.tenureDays,
                interestAmount: loan.interestAmount.toFixed(2),
                totalRepayable: loan.totalRepayable.toFixed(2),
                status: loan.status,
                dueDate: loan.dueDate
            }
        });

    } catch (err) {
        console.error('Loan application error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to submit loan application',
            error: err.message
        });
    }
});

// @route   GET /api/loan-application/status/:phoneNumber
// @desc    Check loan application status (Public route)
// @access  Public
router.get('/status/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        const loans = await Loan.find({ phoneNumber })
            .sort({ requestedAt: -1 })
            .limit(5);

        if (!loans || loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No loan applications found for this phone number'
            });
        }

        res.status(200).json({
            success: true,
            data: loans.map(loan => ({
                loanReferenceNumber: loan.loanReferenceNumber,
                amount: loan.amount,
                status: loan.status,
                requestedAt: loan.requestedAt,
                approvedAt: loan.approvedAt,
                disbursementDate: loan.disbursementDate,
                dueDate: loan.dueDate,
                totalRepayable: loan.totalRepayable
            }))
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loan status',
            error: err.message
        });
    }
});

// @route   GET /api/loan-application/settings
// @desc    Get loan application settings (Public route)
// @access  Public
router.get('/settings', async (req, res) => {
    try {
        let settings = await LoanSettings.findOne();
        
        if (!settings) {
            settings = {
                minLoanAmount: 1000,
                maxLoanAmount: 50000,
                interestRate: 2.5,
                availableTenures: [7, 15, 30, 45, 60]
            };
        }

        res.status(200).json({
            success: true,
            data: {
                minLoanAmount: settings.minLoanAmount,
                maxLoanAmount: settings.maxLoanAmount,
                interestRate: settings.interestRate,
                availableTenures: [7, 15, 30, 45, 60],
                interestCalculationMethod: settings.interestCalculationMethod,
                interestBasis: settings.interestBasis
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loan settings',
            error: err.message
        });
    }
});

module.exports = router;
