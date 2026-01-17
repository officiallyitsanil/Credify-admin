const express = require('express');
const router = express.Router();
const { Notification } = require('../models/Notification');
const { verifyAdmin } = require('../middleware/auth');

// Get all notifications
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { type, channel, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (type) query.type = type;
        if (channel) query.channel = channel;
        if (status) query.status = status;

        const notifications = await Notification.find(query)
            .populate('userId', 'fullName phoneNumber email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments(query);

        res.json({
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments({ userId: req.params.userId });

        res.json({
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create notification
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Send bulk notifications
router.post('/bulk', verifyAdmin, async (req, res) => {
    try {
        const { userIds, type, channel, subject, message, metadata } = req.body;

        const notifications = userIds.map(userId => ({
            userId,
            type,
            channel,
            subject,
            message,
            metadata
        }));

        const createdNotifications = await Notification.insertMany(notifications);
        res.status(201).json({
            message: `${createdNotifications.length} notifications created`,
            notifications: createdNotifications
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mark as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update notification status
router.patch('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                status,
                sentAt: status === 'sent' ? new Date() : null
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete notification
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
