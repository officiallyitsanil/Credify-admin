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
        const verifiedUsers = await User.countDocuments({ kycStatus: 'VERIFIED' });
        const pendingKyc = await User.countDocuments({ kycStatus: 'PENDING' });
        const blockedUsers = await User.countDocuments({ isBlocked: true });

        // Loan statistics
        const totalLoans = await Loan.countDocuments();
        const pendingLoans = await Loan.countDocuments({ status: 'REQUESTED' });
        const approvedLoans = await Loan.countDocuments({ status: 'APPROVED' });
        const activeLoans = await Loan.countDocuments({ status: 'DISBURSED' });
        const completedLoans = await Loan.countDocuments({ status: 'REPAID' });
        const rejectedLoans = await Loan.countDocuments({ status: 'REJECTED' });

        // Calculate total loan amounts
        const totalLoanAmount = await Loan.aggregate([
            { $match: { status: { $in: ['APPROVED', 'DISBURSED', 'REPAID'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeLoanAmount = await Loan.aggregate([
            { $match: { status: 'DISBURSED' } },
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

        // Revenue calculation (total interest earned from totalRepayable - amount)
        const revenue = await Loan.aggregate([
            { $match: { status: { $in: ['DISBURSED', 'REPAID'] } } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalRepayable', '$amount'] } } } }
        ]);

        // Recent activities (last 10 loans) with user data lookup
        const recentLoans = await Loan.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'phoneNumber',
                    foreignField: 'phoneNumber',
                    as: 'userInfo'
                }
            },
            {
                $project: {
                    amount: 1,
                    status: 1,
                    createdAt: 1,
                    phoneNumber: 1,
                    loanReferenceNumber: 1,
                    user: {
                        $cond: {
                            if: { $gt: [{ $size: '$userInfo' }, 0] },
                            then: {
                                name: { $arrayElemAt: ['$userInfo.fullName', 0] },
                                email: { $arrayElemAt: ['$userInfo.email', 0] },
                                phoneNumber: { $arrayElemAt: ['$userInfo.phoneNumber', 0] }
                            },
                            else: null
                        }
                    }
                }
            }
        ]);

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
            .populate('user', 'fullName email phoneNumber')
            .populate('loan', 'amount tenureDays')
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
