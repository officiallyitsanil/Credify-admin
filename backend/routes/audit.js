const express = require('express');
const router = express.Router();
const { AuditLog } = require('../models/CMSAuditSettings');
const { verifyAdmin } = require('../middleware/auth');

// Get all audit logs
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { action, module, userId, page = 1, limit = 50 } = req.query;
        const query = {};
        if (action) query.action = action;
        if (module) query.module = module;
        if (userId) query.userId = userId;

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get audit logs by user
router.get('/user/:userId', verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const logs = await AuditLog.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments({ userId: req.params.userId });

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get audit logs by date range
router.get('/daterange', verifyAdmin, async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 50 } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create audit log (used internally by other routes)
router.post('/', async (req, res) => {
    try {
        const log = new AuditLog(req.body);
        await log.save();
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete old audit logs (maintenance)
router.delete('/cleanup', verifyAdmin, async (req, res) => {
    try {
        const { daysOld = 90 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await AuditLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        res.json({
            message: `Deleted ${result.deletedCount} audit logs older than ${daysOld} days`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
