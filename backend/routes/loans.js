const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const LoanSettings = require('../models/LoanSettings');
const { protect } = require('../middleware/auth');
const { processLoanApproval } = require('../utils/loanApproval');
const { notifyLoanApproval } = require('../utils/notificationService');

// All routes are protected
router.use(protect);

// @route   GET /api/loans
// @desc    Get all loans with filters
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, phoneNumber } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (phoneNumber) {
            query.phoneNumber = phoneNumber;
        }

        const loans = await Loan.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Loan.countDocuments(query);

        res.status(200).json({
            success: true,
            data: loans,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET /api/loans/:id
// @desc    Get single loan
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: loan
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT /api/loans/:id/approve
// @desc    Approve loan request (Manual approval by admin)
// @access  Private
router.put('/:id/approve', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        if (loan.status !== 'REQUESTED' && loan.status !== 'UNDER_REVIEW') {
            return res.status(400).json({
                success: false,
                message: 'Only pending or under-review loans can be approved'
            });
        }

        // Get user to check credit limit
        const User = require('../models/User');
        const user = await User.findOne({ phoneNumber: loan.phoneNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found for this loan application'
            });
        }

        // Check if user's KYC is verified
        if (user.kycStatus !== 'VERIFIED') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve loan. User's KYC status is ${user.kycStatus}. KYC must be verified before loan approval.`
            });
        }

        // Check if user has sufficient credit limit
        if (loan.amount > user.creditLimit) {
            return res.status(400).json({
                success: false,
                message: `Loan amount (₹${loan.amount}) exceeds user credit limit (₹${user.creditLimit})`
            });
        }

        // Update loan status
        loan.status = 'APPROVED';
        loan.approvedAt = Date.now();
        loan.approvalMethod = 'MANUAL';
        if (req.user && req.user._id) {
            loan.reviewedBy = req.user._id;
        }
        loan.reviewedAt = Date.now();

        await loan.save();

        // Create repayment schedule
        const RepaymentSchedule = require('../models/RepaymentSchedule');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loan.tenureDays);

        // Create repayment schedule entry with installments
        const repaymentSchedule = new RepaymentSchedule({
            loanId: loan._id,
            phoneNumber: loan.phoneNumber,
            totalAmount: loan.totalRepayable,
            totalPaid: 0,
            totalRemaining: loan.totalRepayable,
            status: 'ACTIVE',
            nextDueDate: dueDate,
            installments: [
                {
                    installmentNumber: 1,
                    dueDate: dueDate,
                    principalAmount: loan.amount,
                    interestAmount: loan.interestAmount,
                    lateFee: 0,
                    totalAmount: loan.totalRepayable,
                    paidAmount: 0,
                    remainingAmount: loan.totalRepayable,
                    status: 'PENDING',
                    daysOverdue: 0,
                    reminderSent: false
                }
            ]
        });

        await repaymentSchedule.save();
        console.log('✅ Repayment schedule created');

        // Send approval notifications to user
        console.log('📧 Sending approval notifications...');
        notifyLoanApproval(loan.phoneNumber, loan).catch(err => {
            console.error('❌ Error sending loan approval notification:', err);
        });

        res.status(200).json({
            success: true,
            data: loan,
            message: 'Loan approved successfully'
        });
    } catch (err) {
        console.error('❌ Error approving loan:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to approve loan',
            error: err.message
        });
    }
});

// @route   PUT /api/loans/:id/reject

// @route   POST /api/loans/:id/auto-process
// @desc    Process loan application with automatic risk assessment
// @access  Private (Can be called automatically when loan is created)
router.post('/:id/auto-process', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        if (loan.status !== 'REQUESTED') {
            return res.status(400).json({
                success: false,
                message: 'Loan has already been processed'
            });
        }

        // Get active loan settings
        const settings = await LoanSettings.getActiveSettings();

        // Process loan approval
        const result = await processLoanApproval(loan, settings);

        // Update loan with risk assessment data
        loan.riskScore = result.riskAssessment?.riskScore;
        loan.riskCategory = result.riskAssessment?.riskCategory;
        loan.riskFactors = result.riskAssessment?.riskFactors;

        // All loans require manual review - no automatic approval or rejection
        loan.status = 'UNDER_REVIEW';
        loan.manualReviewRequired = true;
        loan.manualReviewReason = result.message;

        // Add to loan history
        loan.loanHistory.push({
            status: loan.status,
            changedAt: Date.now(),
            changedBy: 'SYSTEM',
            reason: result.message,
            metadata: {
                action: result.action,
                riskScore: result.riskAssessment?.riskScore,
                riskCategory: result.riskAssessment?.riskCategory
            }
        });

        await loan.save();

        res.status(200).json({
            success: true,
            data: {
                loan,
                decision: {
                    action: result.action,
                    status: result.status,
                    message: result.message,
                    riskAssessment: result.riskAssessment
                }
            },
            message: result.message
        });
    } catch (err) {
        console.error('Error in auto-process:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT /api/loans/:id/reject
// @desc    Reject loan request
// @access  Private
router.put('/:id/reject', async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide rejection reason'
            });
        }

        const loan = await Loan.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        if (loan.status !== 'REQUESTED' && loan.status !== 'UNDER_REVIEW') {
            return res.status(400).json({
                success: false,
                message: 'Only pending or under-review loans can be rejected'
            });
        }

        loan.status = 'REJECTED';
        loan.rejectedAt = Date.now();
        loan.rejectionReason = rejectionReason;
        loan.approvalMethod = loan.approvalMethod || 'MANUAL';
        loan.reviewedBy = req.user._id;
        loan.reviewedAt = Date.now();

        // Add to loan history
        loan.loanHistory.push({
            status: 'REJECTED',
            changedAt: Date.now(),
            changedBy: req.user.email || req.user._id.toString(),
            reason: rejectionReason
        });

        await loan.save();

        res.status(200).json({
            success: true,
            data: loan,
            message: 'Loan rejected successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET /api/loans/manual-review/pending
// @desc    Get all loans requiring manual review
// @access  Private
router.get('/manual-review/pending', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const loans = await Loan.find({ 
            status: 'UNDER_REVIEW',
            manualReviewRequired: true
        })
            .sort({ requestedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Loan.countDocuments({ 
            status: 'UNDER_REVIEW',
            manualReviewRequired: true
        });

        res.status(200).json({
            success: true,
            data: loans,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET /api/loans/:id/repayments
// @desc    Get repayment schedule for a loan
// @access  Private
router.get('/:id/repayments', async (req, res) => {
    try {
        const repayments = await Repayment.find({ loan: req.params.id })
            .sort({ emiNumber: 1 });

        res.status(200).json({
            success: true,
            data: repayments
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

module.exports = router;
