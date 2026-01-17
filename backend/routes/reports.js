const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const { CollectionCase } = require('../models/CollectionRiskSupport');
const Disbursement = require('../models/Disbursement');
const { verifyAdmin } = require('../middleware/auth');

// Dashboard Overview
router.get('/dashboard', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeLoans = await Loan.countDocuments({ status: 'active' });
        const pendingLoans = await Loan.countDocuments({ status: 'pending' });
        const totalDisbursed = await Disbursement.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$disbursedAmount' } } }
        ]);
        const totalCollected = await Repayment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const overdueLoans = await Loan.countDocuments({ status: 'overdue' });

        res.json({
            totalUsers,
            activeLoans,
            pendingLoans,
            totalDisbursed: totalDisbursed[0]?.total || 0,
            totalCollected: totalCollected[0]?.total || 0,
            overdueLoans
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Loan Performance Report
router.get('/loan-performance', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const loansByStatus = await Loan.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$loanAmount' } } }
        ]);

        const loansByType = await Loan.aggregate([
            { $match: query },
            { $group: { _id: '$loanType', count: { $sum: 1 }, totalAmount: { $sum: '$loanAmount' } } }
        ]);

        res.json({
            loansByStatus,
            loansByType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Collection Report
router.get('/collection', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const totalCollected = await Repayment.aggregate([
            { $match: { ...query, status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const collectionByStatus = await CollectionCase.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const overdueAmount = await Repayment.aggregate([
            { $match: { status: 'overdue' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalCollected: totalCollected[0]?.total || 0,
            collectionByStatus,
            overdueAmount: overdueAmount[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User Analytics
router.get('/user-analytics', verifyAdmin, async (req, res) => {
    try {
        const usersByKYCStatus = await User.aggregate([
            { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
        ]);

        const usersByRiskCategory = await User.aggregate([
            { $group: { _id: '$riskCategory', count: { $sum: 1 } } }
        ]);

        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });

        res.json({
            usersByKYCStatus,
            usersByRiskCategory,
            activeUsers,
            inactiveUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Disbursement Report
router.get('/disbursement', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const disbursementByStatus = await Disbursement.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$disbursedAmount' } } }
        ]);

        const disbursementByMethod = await Disbursement.aggregate([
            { $match: query },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalAmount: { $sum: '$disbursedAmount' } } }
        ]);

        res.json({
            disbursementByStatus,
            disbursementByMethod
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Portfolio Quality Report
router.get('/portfolio-quality', verifyAdmin, async (req, res) => {
    try {
        const totalLoans = await Loan.countDocuments({ status: { $in: ['active', 'disbursed'] } });
        const totalLoanAmount = await Loan.aggregate([
            { $match: { status: { $in: ['active', 'disbursed'] } } },
            { $group: { _id: null, total: { $sum: '$loanAmount' } } }
        ]);

        const npl = await Loan.countDocuments({ status: 'default' });
        const nplAmount = await Loan.aggregate([
            { $match: { status: 'default' } },
            { $group: { _id: null, total: { $sum: '$loanAmount' } } }
        ]);

        const nplRatio = totalLoans > 0 ? (npl / totalLoans) * 100 : 0;

        res.json({
            totalLoans,
            totalLoanAmount: totalLoanAmount[0]?.total || 0,
            npl,
            nplAmount: nplAmount[0]?.total || 0,
            nplRatio: nplRatio.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Monthly Trend Report
router.get('/monthly-trend', verifyAdmin, async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const monthlyLoans = await Loan.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$loanAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyRepayments = await Repayment.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    },
                    status: 'paid'
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            monthlyLoans,
            monthlyRepayments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
