const express = require('express');
const router = express.Router();
const { SupportTicket } = require('../models/CollectionRiskSupport');
const { verifyAdmin } = require('../middleware/auth');

// Get all support tickets
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status, priority, category, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;

        const tickets = await SupportTicket.find(query)
            .populate('userId', 'fullName phoneNumber email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await SupportTicket.countDocuments(query);

        res.json({
            tickets,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tickets by user
router.get('/user/:userId', async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.params.userId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create support ticket
router.post('/', async (req, res) => {
    try {
        const ticket = new SupportTicket(req.body);
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update ticket
router.patch('/:id', verifyAdmin, async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId').populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found' });
        }

        // Update resolvedAt if status is resolved
        if (req.body.status === 'resolved' && !ticket.resolvedAt) {
            ticket.resolvedAt = new Date();
            await ticket.save();
        }

        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add response to ticket
router.post('/:id/response', async (req, res) => {
    try {
        const { message, respondedBy, isInternal } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found' });
        }

        ticket.responses.push({
            message,
            respondedBy,
            respondedAt: new Date(),
            isInternal: isInternal || false
        });

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Close ticket
router.patch('/:id/close', verifyAdmin, async (req, res) => {
    try {
        const { resolution } = req.body;

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            {
                status: 'resolved',
                resolution,
                resolvedAt: new Date()
            },
            { new: true }
        ).populate('userId').populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete ticket
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found' });
        }
        res.json({ message: 'Support ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
