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
        const { page = 1, limit = 10, status, userId } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (userId) {
            query.user = userId;
        }

        const loans = await Loan.find(query)
            .populate('user', 'name email phone')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email')
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
        const loan = await Loan.findById(req.params.id)
            .populate('user', 'name email phone address creditLimit')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email');

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
        const loan = await Loan.findById(req.params.id).populate('user');

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending loans can be approved'
            });
        }

        // Check if user has sufficient credit limit
        if (loan.amount > loan.user.creditLimit) {
            return res.status(400).json({
                success: false,
                message: 'Loan amount exceeds user credit limit'
            });
        }

        loan.status = 'approved';
        loan.approvedBy = req.admin._id;
        loan.approvedAt = Date.now();
        loan.disbursedAt = Date.now();

        await loan.save();

        // Create repayment schedule
        const repayments = [];
        const startDate = new Date();

        for (let i = 1; i <= loan.tenure; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);

            repayments.push({
                loan: loan._id,
                user: loan.user._id,
                emiNumber: i,
                emiAmount: loan.emiAmount,
                dueDate: dueDate,
                status: 'pending'
            });
        }

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

        if (loan.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending loans can be rejected'
            });
        }

        loan.status = 'rejected';
        loan.rejectedBy = req.admin._id;
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
