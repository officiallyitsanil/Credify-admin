const express = require('express');
const router = express.Router();
const { SystemSettings } = require('../models/CMSAuditSettings');
const LoanSettings = require('../models/LoanSettings');
const { verifyAdmin } = require('../middleware/auth');

// Get all settings
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { category, isActive } = req.query;
        const query = {};
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const settings = await SystemSettings.find(query)
            .populate('updatedBy', 'name email')
            .sort({ category: 1, key: 1 });

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active settings
router.get('/active', async (req, res) => {
    try {
        const settings = await SystemSettings.find({ isActive: true });

        // Format as key-value pairs
        const settingsMap = {};
        settings.forEach(setting => {
            if (!settingsMap[setting.category]) {
                settingsMap[setting.category] = {};
            }
            settingsMap[setting.category][setting.key] = setting.value;
        });

        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get setting by key
router.get('/key/:key', verifyAdmin, async (req, res) => {
    try {
        const setting = await SystemSettings.findOne({ key: req.params.key })
            .populate('updatedBy', 'name email');

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get settings by category
router.get('/category/:category', verifyAdmin, async (req, res) => {
    try {
        const settings = await SystemSettings.find({ category: req.params.category })
            .populate('updatedBy', 'name email');

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new setting
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const setting = new SystemSettings(req.body);
        await setting.save();
        res.status(201).json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update setting
router.patch('/:id', verifyAdmin, async (req, res) => {
    try {
        const setting = await SystemSettings.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update setting by key
router.patch('/key/:key', verifyAdmin, async (req, res) => {
    try {
        const setting = await SystemSettings.findOneAndUpdate(
            { key: req.params.key },
            req.body,
            { new: true, runValidators: true }
        );

        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Toggle setting
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
    try {
        const setting = await SystemSettings.findById(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        setting.isActive = !setting.isActive;
        await setting.save();

        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Bulk update settings
router.post('/bulk', verifyAdmin, async (req, res) => {
    try {
        const { settings } = req.body; // Array of { key, value }

        const updates = settings.map(({ key, value, updatedBy }) =>
            SystemSettings.findOneAndUpdate(
                { key },
                { value, updatedBy },
                { new: true, upsert: true }
            )
        );

        const updatedSettings = await Promise.all(updates);
        res.json(updatedSettings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete setting
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const setting = await SystemSettings.findByIdAndDelete(req.params.id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== LOAN SETTINGS ROUTES ====================

// Get active loan settings
router.get('/loan', verifyAdmin, async (req, res) => {
    try {
        const settings = await LoanSettings.getActiveSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update loan settings
router.put('/loan', verifyAdmin, async (req, res) => {
    try {
        let settings = await LoanSettings.findOne({ isActive: true });

        if (!settings) {
            // Create new settings if none exist
            settings = new LoanSettings(req.body);
            settings.isActive = true;
        } else {
            // Update existing settings
            Object.assign(settings, req.body);
        }

        settings.lastModifiedBy = req.user._id;
        await settings.save();

        res.json({
            success: true,
            data: settings,
            message: 'Loan settings updated successfully'
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Reset loan settings to defaults
router.post('/loan/reset', verifyAdmin, async (req, res) => {
    try {
        // Deactivate all existing settings
        await LoanSettings.updateMany({}, { isActive: false });

        // Create new default settings
        const settings = await LoanSettings.create({
            isActive: true,
            lastModifiedBy: req.user._id,
            notes: 'Settings reset to defaults by admin'
        });

        res.json({
            success: true,
            data: settings,
            message: 'Loan settings reset to defaults'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

module.exports = router;
