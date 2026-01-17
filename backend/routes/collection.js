const express = require('express');
const router = express.Router();
const { CollectionCase } = require('../models/CollectionRiskSupport');
const Loan = require('../models/Loan');
const { verifyAdmin } = require('../middleware/auth');

// Get all collection records
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const collections = await CollectionCase.find(query)
            .populate('loanId', 'loanAmount emiAmount')
            .populate({
                path: 'loanId',
                populate: { path: 'userId', select: 'fullName phoneNumber email' }
            })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await CollectionCase.countDocuments(query);

        res.json({
            collections,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get collection by loan ID
router.get('/loan/:loanId', verifyAdmin, async (req, res) => {
    try {
        const collections = await CollectionCase.find({ loanId: req.params.loanId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create collection record
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const collection = new CollectionCase(req.body);
        await collection.save();
        res.status(201).json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update collection record
router.patch('/:id', verifyAdmin, async (req, res) => {
    try {
        const collection = await CollectionCase.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('loanId').populate('assignedTo', 'name email');

        if (!collection) {
            return res.status(404).json({ message: 'Collection record not found' });
        }

        res.json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add follow-up action
router.post('/:id/followup', verifyAdmin, async (req, res) => {
    try {
        const { action, notes, nextFollowUpDate } = req.body;

        const collection = await CollectionCase.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection record not found' });
        }

        collection.followUpActions.push({
            action,
            notes,
            performedAt: new Date()
        });

        if (nextFollowUpDate) {
            collection.nextFollowUpDate = nextFollowUpDate;
        }

        await collection.save();
        res.json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete collection record
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const collection = await CollectionCase.findByIdAndDelete(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection record not found' });
        }
        res.json({ message: 'Collection record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
