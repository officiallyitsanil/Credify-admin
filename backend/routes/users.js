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
        const { page = 1, limit = 10, search = '', kycStatus, isBlocked } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (kycStatus) {
            query.kycStatus = kycStatus;
        }

        if (isBlocked !== undefined) {
            query.isBlocked = isBlocked === 'true';
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

        if (!['VERIFIED', 'REJECTED'].includes(kycStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid KYC status'
            });
        }

        const updateData = { kycStatus };

        if (kycStatus === 'REJECTED' && rejectionReason) {
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
// @desc    Update credit limit (Admin only)
// @access  Private
router.put('/:id/credit-limit', async (req, res) => {
    try {
        const { creditLimit, reason, riskCategory } = req.body;

        console.log('Received credit limit update request:', { creditLimit, reason, riskCategory });

        if (creditLimit === undefined || creditLimit === null) {
            return res.status(400).json({
                success: false,
                message: 'Credit limit is required'
            });
        }

        if (creditLimit < 0) {
            return res.status(400).json({
                success: false,
                message: 'Credit limit cannot be negative'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const previousLimit = user.creditLimit || 0;
        
        // Update user's credit limit
        user.creditLimit = parseInt(creditLimit);
        await user.save();

        console.log('User credit limit updated successfully');

        // Try to update CreditLimit collection (optional - don't fail if it errors)
        try {
            const CreditLimit = require('../models/CreditLimit');
            let creditLimitDoc = await CreditLimit.findOne({ userId: user._id });

            // Get admin ID safely
            const adminId = req.user?._id || null;

            if (!creditLimitDoc) {
                // Create new CreditLimit entry
                creditLimitDoc = new CreditLimit({
                    userId: user._id,
                    totalLimit: parseInt(creditLimit),
                    availableLimit: parseInt(creditLimit) - (user.usedCredit || 0),
                    utilizedLimit: user.usedCredit || 0,
                    blockedLimit: 0,
                    riskCategory: riskCategory || 'medium',
                    limitType: 'manual_approved',
                    approvedBy: adminId,
                    approvedAt: new Date()
                });
                
                // Add history entry
                if (adminId) {
                    creditLimitDoc.limitHistory = [{
                        previousLimit: previousLimit,
                        newLimit: parseInt(creditLimit),
                        reason: reason || 'Initial credit limit set by admin',
                        changedBy: adminId,
                        changedAt: new Date()
                    }];
                }
            } else {
                // Update existing CreditLimit entry
                const previousTotal = creditLimitDoc.totalLimit;
                creditLimitDoc.totalLimit = parseInt(creditLimit);
                creditLimitDoc.availableLimit = parseInt(creditLimit) - (creditLimitDoc.utilizedLimit || 0);
                
                if (riskCategory) {
                    creditLimitDoc.riskCategory = riskCategory;
                }
                
                creditLimitDoc.limitType = 'manual_approved';
                creditLimitDoc.approvedBy = adminId;
                creditLimitDoc.approvedAt = new Date();
                
                // Add to history only if adminId exists
                if (adminId) {
                    if (!creditLimitDoc.limitHistory) {
                        creditLimitDoc.limitHistory = [];
                    }
                    creditLimitDoc.limitHistory.push({
                        previousLimit: previousTotal,
                        newLimit: parseInt(creditLimit),
                        reason: reason || 'Credit limit updated by admin',
                        changedBy: adminId,
                        changedAt: new Date()
                    });
                }
            }

            await creditLimitDoc.save();
            console.log('CreditLimit document updated successfully');
        } catch (creditLimitError) {
            console.error('Error updating CreditLimit document (non-critical):', creditLimitError);
            // Don't fail the whole request if CreditLimit update fails
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `Credit limit ${previousLimit === 0 ? 'set' : 'updated'} successfully from ₹${previousLimit.toLocaleString()} to ₹${parseInt(creditLimit).toLocaleString()}`
        });
    } catch (err) {
        console.error('Error updating credit limit:', err);
        console.error('Error stack:', err.stack);
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
        const { isBlocked, blockReason } = req.body;

        const updateData = { isBlocked };

        if (isBlocked && blockReason) {
            updateData.blockReason = blockReason;
        } else if (!isBlocked) {
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
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`
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
