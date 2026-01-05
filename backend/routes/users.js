const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/users
// @desc    Get all users with pagination, search, and filters
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', kycStatus, accountStatus } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (kycStatus) {
            query.kycStatus = kycStatus;
        }

        if (accountStatus) {
            query.accountStatus = accountStatus;
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
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

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT /api/users/:id/kyc
// @desc    Update KYC status
// @access  Private
router.put('/:id/kyc', async (req, res) => {
    try {
        const { kycStatus, rejectionReason } = req.body;

        if (!['verified', 'rejected'].includes(kycStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid KYC status'
            });
        }

        const updateData = { kycStatus };

        if (kycStatus === 'rejected' && rejectionReason) {
            updateData.kycRejectionReason = rejectionReason;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `KYC ${kycStatus} successfully`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT /api/users/:id/credit-limit
// @desc    Update credit limit
// @access  Private
router.put('/:id/credit-limit', async (req, res) => {
    try {
        const { creditLimit } = req.body;

        if (creditLimit < 0) {
            return res.status(400).json({
                success: false,
                message: 'Credit limit cannot be negative'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { creditLimit },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Credit limit updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT /api/users/:id/status
// @desc    Block/unblock user
// @access  Private
router.put('/:id/status', async (req, res) => {
    try {
        const { accountStatus, blockReason } = req.body;

        if (!['active', 'blocked'].includes(accountStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account status'
            });
        }

        const updateData = { accountStatus };

        if (accountStatus === 'blocked' && blockReason) {
            updateData.blockReason = blockReason;
        } else if (accountStatus === 'active') {
            updateData.blockReason = '';
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `User ${accountStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`
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
