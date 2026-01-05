const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ kycStatus: 'verified' });
        const pendingKyc = await User.countDocuments({ kycStatus: 'pending' });
        const blockedUsers = await User.countDocuments({ accountStatus: 'blocked' });

        // Loan statistics
        const totalLoans = await Loan.countDocuments();
        const pendingLoans = await Loan.countDocuments({ status: 'pending' });
        const approvedLoans = await Loan.countDocuments({ status: 'approved' });
        const activeLoans = await Loan.countDocuments({ status: { $in: ['approved', 'active'] } });
        const completedLoans = await Loan.countDocuments({ status: 'completed' });
        const rejectedLoans = await Loan.countDocuments({ status: 'rejected' });

        // Calculate total loan amounts
        const totalLoanAmount = await Loan.aggregate([
            { $match: { status: { $in: ['approved', 'active', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeLoanAmount = await Loan.aggregate([
            { $match: { status: { $in: ['approved', 'active'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Repayment statistics
        const overdueRepayments = await Repayment.countDocuments({
            status: 'overdue'
        });

        const overdueAmount = await Repayment.aggregate([
            { $match: { status: 'overdue' } },
            { $group: { _id: null, total: { $sum: '$emiAmount' } } }
        ]);

        const pendingRepayments = await Repayment.countDocuments({
            status: 'pending',
            dueDate: { $gte: new Date() }
        });

        // Revenue calculation (total interest earned)
        const revenue = await Loan.aggregate([
            { $match: { status: { $in: ['approved', 'active', 'completed'] } } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amount'] } } } }
        ]);

        // Recent activities (last 10 loans)
        const recentLoans = await Loan.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('amount status createdAt user');

        // Monthly loan trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Loan.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    pendingKyc: pendingKyc,
                    blocked: blockedUsers
                },
                loans: {
                    total: totalLoans,
                    pending: pendingLoans,
                    approved: approvedLoans,
                    active: activeLoans,
                    completed: completedLoans,
                    rejected: rejectedLoans,
                    totalAmount: totalLoanAmount[0]?.total || 0,
                    activeAmount: activeLoanAmount[0]?.total || 0
                },
                repayments: {
                    overdue: overdueRepayments,
                    overdueAmount: overdueAmount[0]?.total || 0,
                    pending: pendingRepayments
                },
                revenue: {
                    total: revenue[0]?.total || 0
                },
                recentActivity: recentLoans,
                monthlyTrend: monthlyTrend
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET /api/dashboard/repayments
// @desc    Get all repayments with filters
// @access  Private
router.get('/repayments', async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        // Update overdue status
        await Repayment.updateMany(
            { status: 'pending', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const repayments = await Repayment.find(query)
            .populate('user', 'name email phone')
            .populate('loan', 'amount tenure')
            .sort({ dueDate: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Repayment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: repayments,
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

module.exports = router;
