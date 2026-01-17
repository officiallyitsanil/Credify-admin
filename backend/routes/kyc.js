const express = require('express');
const router = express.Router();
const KYC = require('../models/KYC');
const User = require('../models/User');
const { verifyAdmin } = require('../middleware/auth');

// Get all KYC records
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status, verificationType, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (verificationType) query.verificationType = verificationType;

        const kycRecords = await KYC.find(query)
            .populate('userId', 'fullName phoneNumber email')
            .populate('verifiedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await KYC.countDocuments(query);

        res.json({
            kycRecords,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get KYC by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const kyc = await KYC.findOne({ userId: req.params.userId })
            .populate('userId', 'fullName phoneNumber email')
            .populate('verifiedBy', 'name email');

        if (!kyc) {
            return res.status(404).json({ message: 'KYC record not found' });
        }

        res.json(kyc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create/Update KYC record
router.post('/', async (req, res) => {
    try {
        const { userId, ...kycData } = req.body;

        // Check if KYC already exists
        let kyc = await KYC.findOne({ userId });

        if (kyc) {
            // Update existing KYC
            Object.assign(kyc, kycData);
            await kyc.save();
        } else {
            // Create new KYC
            kyc = new KYC({ userId, ...kycData });
            await kyc.save();

            // Update user's KYC reference
            await User.findByIdAndUpdate(userId, { kycId: kyc._id });
        }

        res.status(201).json(kyc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Verify KYC
router.patch('/:id/verify', verifyAdmin, async (req, res) => {
    try {
        const { status, remarks, verifiedBy } = req.body;

        const kyc = await KYC.findByIdAndUpdate(
            req.params.id,
            {
                status,
                remarks,
                verifiedBy,
                verifiedAt: status === 'approved' || status === 'rejected' ? new Date() : null
            },
            { new: true }
        ).populate('userId', 'fullName phoneNumber email');

        if (!kyc) {
            return res.status(404).json({ message: 'KYC record not found' });
        }

        // Update user's KYC status
        await User.findByIdAndUpdate(kyc.userId._id, { kycStatus: status });

        res.json(kyc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete KYC record
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const kyc = await KYC.findByIdAndDelete(req.params.id);
        if (!kyc) {
            return res.status(404).json({ message: 'KYC record not found' });
        }
        res.json({ message: 'KYC record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
