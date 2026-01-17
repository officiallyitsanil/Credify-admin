const express = require('express');
const router = express.Router();
const { RiskAssessment, FraudDetection } = require('../models/CollectionRiskSupport');
const { verifyAdmin } = require('../middleware/auth');

// Get all risk assessments
router.get('/assessment', verifyAdmin, async (req, res) => {
    try {
        const { riskLevel, page = 1, limit = 20 } = req.query;
        const query = {};
        if (riskLevel) query.riskLevel = riskLevel;

        const assessments = await RiskAssessment.find(query)
            .populate('userId', 'fullName phoneNumber email cibilScore')
            .populate('loanId', 'loanAmount loanType')
            .populate('assessedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await RiskAssessment.countDocuments(query);

        res.json({
            assessments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get risk assessment by user
router.get('/assessment/user/:userId', verifyAdmin, async (req, res) => {
    try {
        const assessments = await RiskAssessment.find({ userId: req.params.userId })
            .populate('loanId', 'loanAmount loanType')
            .populate('assessedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create risk assessment
router.post('/assessment', verifyAdmin, async (req, res) => {
    try {
        const assessment = new RiskAssessment(req.body);
        await assessment.save();
        res.status(201).json(assessment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all fraud alerts
router.get('/fraud', verifyAdmin, async (req, res) => {
    try {
        const { severity, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (severity) query.severity = severity;
        if (status) query.status = status;

        const alerts = await FraudDetection.find(query)
            .populate('userId', 'fullName phoneNumber email')
            .populate('detectedBy', 'name email')
            .sort({ detectedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await FraudDetection.countDocuments(query);

        res.json({
            alerts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create fraud alert
router.post('/fraud', verifyAdmin, async (req, res) => {
    try {
        const alert = new FraudDetection(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update fraud alert status
router.patch('/fraud/:id', verifyAdmin, async (req, res) => {
    try {
        const { status, resolution, investigatedBy } = req.body;

        const alert = await FraudDetection.findByIdAndUpdate(
            req.params.id,
            {
                status,
                resolution,
                investigatedBy,
                resolvedAt: status === 'resolved' ? new Date() : null
            },
            { new: true }
        ).populate('userId').populate('investigatedBy', 'name email');

        if (!alert) {
            return res.status(404).json({ message: 'Fraud alert not found' });
        }

        res.json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
