const express = require('express');
const router = express.Router();
const { InterestConfig, FeesConfig, PenaltyConfig } = require('../models/InterestFeesConfig');
const { verifyAdmin } = require('../middleware/auth');

// Get all interest configurations
router.get('/interest', verifyAdmin, async (req, res) => {
    try {
        const { isActive, page = 1, limit = 20 } = req.query;
        const query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const configs = await InterestConfig.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await InterestConfig.countDocuments(query);

        res.json({
            data: configs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all fees configurations
router.get('/fees', verifyAdmin, async (req, res) => {
    try {
        const { feeType, isActive, page = 1, limit = 20 } = req.query;
        const query = {};
        if (feeType) query.feeType = feeType;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const configs = await FeesConfig.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await FeesConfig.countDocuments(query);

        res.json({
            data: configs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all penalty configurations
router.get('/penalties', verifyAdmin, async (req, res) => {
    try {
        const { penaltyType, isActive, page = 1, limit = 20 } = req.query;
        const query = {};
        if (penaltyType) query.penaltyType = penaltyType;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const configs = await PenaltyConfig.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await PenaltyConfig.countDocuments(query);

        res.json({
            data: configs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all interest/fees configurations (legacy route)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const [interestConfigs, feesConfigs, penaltyConfigs] = await Promise.all([
            InterestConfig.find({ isActive: true }),
            FeesConfig.find({ isActive: true }),
            PenaltyConfig.find({ isActive: true })
        ]);

        res.json({
            interest: interestConfigs,
            fees: feesConfigs,
            penalties: penaltyConfigs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active configs
router.get('/active', async (req, res) => {
    try {
        const [interestConfigs, feesConfigs, penaltyConfigs] = await Promise.all([
            InterestConfig.find({ isActive: true }),
            FeesConfig.find({ isActive: true }),
            PenaltyConfig.find({ isActive: true })
        ]);

        res.json({
            interest: interestConfigs,
            fees: feesConfigs,
            penalties: penaltyConfigs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
