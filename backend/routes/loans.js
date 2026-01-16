const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const { protect } = require('../middleware/auth');

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
// @desc    Approve loan request
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

        if (loan.status !== 'REQUESTED') {
            return res.status(400).json({
                success: false,
                message: 'Only pending loans can be approved'
            });
        }

        // Get user to check credit limit
        const User = require('../models/User');
        const user = await User.findOne({ phoneNumber: loan.phoneNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has sufficient credit limit
        if (loan.amount > user.creditLimit) {
            return res.status(400).json({
                success: false,
                message: 'Loan amount exceeds user credit limit'
            });
        }

        loan.status = 'APPROVED';
        loan.approvedAt = Date.now();

        await loan.save();

        // Create repayment schedule
        const repayments = [];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loan.tenureDays);

        // For simplicity, creating single repayment for full amount
        repayments.push({
            loan: loan._id,
            user: user._id,
            emiNumber: 1,
            emiAmount: loan.totalRepayable,
            dueDate: dueDate,
            status: 'pending'
        });

        await Repayment.insertMany(repayments);

        res.status(200).json({
            success: true,
            data: loan,
            message: 'Loan approved successfully'
        });
    } catch (err) {
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

        if (loan.status !== 'REQUESTED') {
            return res.status(400).json({
                success: false,
                message: 'Only pending loans can be rejected'
            });
        }

        loan.status = 'REJECTED';
        loan.rejectedAt = Date.now();
        loan.rejectionReason = rejectionReason;

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
