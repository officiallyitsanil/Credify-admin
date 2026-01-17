const express = require('express');
const router = express.Router();
const CreditLimit = require('../models/CreditLimit');
const User = require('../models/User');
const { verifyAdmin } = require('../middleware/auth');

// Get all credit limits
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status, riskCategory, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (riskCategory) query.riskCategory = riskCategory;

        const creditLimits = await CreditLimit.find(query)
            .populate('userId', 'fullName phoneNumber email cibilScore')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await CreditLimit.countDocuments(query);

        res.json({
            creditLimits,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get credit limit by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const creditLimit = await CreditLimit.findOne({ userId: req.params.userId })
            .populate('userId', 'fullName phoneNumber email')
            .populate('approvedBy', 'name email');

        if (!creditLimit) {
            return res.status(404).json({ message: 'Credit limit not found' });
        }

        res.json(creditLimit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create credit limit
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const creditLimit = new CreditLimit({
            ...req.body,
            approvedBy: req.admin._id,
            approvedAt: new Date()
        });
        await creditLimit.save();

        // Update user's credit limit
        await User.findByIdAndUpdate(req.body.userId, {
            creditLimit: creditLimit.totalLimit,
            riskCategory: creditLimit.riskCategory
        });

        res.status(201).json(creditLimit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update credit limit
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const creditLimit = await CreditLimit.findById(req.params.id);
        const previousLimit = creditLimit.totalLimit;

        // Add to history
        if (req.body.totalLimit && req.body.totalLimit !== previousLimit) {
            creditLimit.limitHistory.push({
                previousLimit,
                newLimit: req.body.totalLimit,
                reason: req.body.changeReason || 'Manual update',
                changedBy: req.admin._id
            });
        }

        Object.assign(creditLimit, req.body);
        await creditLimit.save();

        // Update user's credit limit
        await User.findByIdAndUpdate(creditLimit.userId, {
            creditLimit: creditLimit.totalLimit,
            riskCategory: creditLimit.riskCategory
        });

        res.json(creditLimit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update available limit (after loan disbursement/repayment)
router.put('/:userId/update-available', async (req, res) => {
    try {
        const { amount, action } = req.body; // action: 'utilize' or 'release'

        const creditLimit = await CreditLimit.findOne({ userId: req.params.userId });

        if (!creditLimit) {
            return res.status(404).json({ message: 'Credit limit not found' });
        }

        if (action === 'utilize') {
            creditLimit.utilizedLimit += amount;
            creditLimit.availableLimit -= amount;
        } else if (action === 'release') {
            creditLimit.utilizedLimit -= amount;
            creditLimit.availableLimit += amount;
        }

        await creditLimit.save();

        // Update user's used credit
        await User.findByIdAndUpdate(req.params.userId, {
            usedCredit: creditLimit.utilizedLimit
        });

        res.json(creditLimit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Suspend/Freeze credit limit
router.put('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const creditLimit = await CreditLimit.findByIdAndUpdate(
            req.params.id,
            { status, remarks },
            { new: true }
        );

        res.json(creditLimit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete credit limit
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const creditLimit = await CreditLimit.findByIdAndDelete(req.params.id);

        // Reset user's credit limit
        await User.findByIdAndUpdate(creditLimit.userId, {
            creditLimit: 0
        });

        res.json({ message: 'Credit limit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
