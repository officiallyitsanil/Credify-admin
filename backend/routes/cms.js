const express = require('express');
const router = express.Router();
const { CMSContent } = require('../models/CMSAuditSettings');
const { verifyAdmin } = require('../middleware/auth');

// Get all CMS content
router.get('/', async (req, res) => {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const content = await CMSContent.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await CMSContent.countDocuments(query);

        res.json({
            content,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get published content
router.get('/published', async (req, res) => {
    try {
        const { type } = req.query;
        const query = { status: 'published' };
        if (type) query.type = type;

        const content = await CMSContent.find(query).sort({ publishedAt: -1 });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get content by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const content = await CMSContent.findOne({ slug: req.params.slug })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get content by ID
router.get('/:id', async (req, res) => {
    try {
        const content = await CMSContent.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new content
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const content = new CMSContent(req.body);
        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update content
router.patch('/:id', verifyAdmin, async (req, res) => {
    try {
        const content = await CMSContent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json(content);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Publish content
router.patch('/:id/publish', verifyAdmin, async (req, res) => {
    try {
        const content = await CMSContent.findByIdAndUpdate(
            req.params.id,
            {
                status: 'published',
                publishedAt: new Date()
            },
            { new: true }
        );

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json(content);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete content
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const content = await CMSContent.findByIdAndDelete(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
