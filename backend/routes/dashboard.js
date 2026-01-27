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
                $addFields: {
                    userDoc: { $arrayElemAt: ['$userInfo', 0] }
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
                            if: { $ne: ['$userDoc', null] },
                            then: {
                                name: '$userDoc.fullName',
                                email: '$userDoc.email',
                                phoneNumber: '$userDoc.phoneNumber'
                            },
                            else: {
                                name: null,
                                email: null,
                                phoneNumber: '$phoneNumber'
                            }
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

        // Loan Approval Statistics
        const underReviewLoans = await Loan.countDocuments({ status: 'UNDER_REVIEW' });
        const autoApprovedLoans = await Loan.countDocuments({ 
            approvalMethod: 'AUTO',
            status: { $in: ['APPROVED', 'DISBURSED', 'REPAID'] }
        });
        const manualApprovedLoans = await Loan.countDocuments({ 
            approvalMethod: 'MANUAL',
            status: { $in: ['APPROVED', 'DISBURSED', 'REPAID'] }
        });
        const autoRejectedLoans = await Loan.countDocuments({ 
            approvalMethod: 'AUTO',
            status: 'REJECTED'
        });

        // Risk Score Distribution
        const riskDistribution = await Loan.aggregate([
            { $match: { riskScore: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$riskCategory',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$riskScore' }
                }
            }
        ]);

        // Average risk score by approval method
        const avgRiskByMethod = await Loan.aggregate([
            { $match: { riskScore: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$approvalMethod',
                    avgRiskScore: { $avg: '$riskScore' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent manual review requests
        const manualReviewQueue = await Loan.find({
            status: 'UNDER_REVIEW',
            manualReviewRequired: true
        })
            .sort({ requestedAt: -1 })
            .limit(5)
            .select('phoneNumber amount riskScore riskCategory riskFactors requestedAt');

        // Approval rate calculation
        const totalProcessedLoans = await Loan.countDocuments({ 
            approvalMethod: { $exists: true, $ne: null }
        });
        const totalApproved = autoApprovedLoans + manualApprovedLoans;
        const approvalRate = totalProcessedLoans > 0 
            ? ((totalApproved / totalProcessedLoans) * 100).toFixed(1)
            : 0;

        // Auto-approval efficiency
        const autoApprovalRate = totalProcessedLoans > 0
            ? ((autoApprovedLoans / totalProcessedLoans) * 100).toFixed(1)
            : 0;

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
                approval: {
                    underReview: underReviewLoans,
                    autoApproved: autoApprovedLoans,
                    manualApproved: manualApprovedLoans,
                    autoRejected: autoRejectedLoans,
                    approvalRate: parseFloat(approvalRate),
                    autoApprovalRate: parseFloat(autoApprovalRate),
                    riskDistribution: riskDistribution.map(r => ({
                        category: r._id || 'Unknown',
                        count: r.count,
                        avgScore: Math.round(r.avgScore)
                    })),
                    avgRiskByMethod: avgRiskByMethod.map(r => ({
                        method: r._id || 'Unknown',
                        avgScore: Math.round(r.avgRiskScore),
                        count: r.count
                    })),
                    manualReviewQueue: manualReviewQueue
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
