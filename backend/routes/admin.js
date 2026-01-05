const express = require('express');
const router = express.Router();
const admin = require('../utils/firebase');
const Admin = require('../models/Admin');

// @route   POST /api/admin/verify
// @desc    Verify Firebase token and get/create admin
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { idToken } = req.body;

        // Validate input
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Firebase ID token'
            });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decodedToken;

        // Only allow specific phone number
        const allowedPhoneNumber = '+918500216667';
        if (phone_number !== allowedPhoneNumber) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This phone number is not authorized.'
            });
        }

        // Check if admin exists by Firebase UID
        let adminUser = await Admin.findOne({ firebaseUid: uid });

        // If not found by UID, check by phone number (for first-time Firebase login)
        if (!adminUser) {
            adminUser = await Admin.findOne({ phoneNumber: phone_number });

            // If found by phone, update the firebaseUid
            if (adminUser) {
                adminUser.firebaseUid = uid;
                await adminUser.save();
                console.log('Updated existing admin with Firebase UID:', uid);
            } else {
                // Create new admin (auto-registration)
                adminUser = await Admin.create({
                    firebaseUid: uid,
                    phoneNumber: phone_number,
                    name: 'Admin', // Default name, can be updated later
                    role: 'admin'
                });
                console.log('Created new admin:', adminUser._id);
            }
        }

        res.status(200).json({
            success: true,
            admin: {
                id: adminUser._id,
                name: adminUser.name,
                phoneNumber: adminUser.phoneNumber,
                role: adminUser.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET /api/admin/me
// @desc    Get current admin
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            admin: {
                id: req.admin._id,
                name: req.admin.name,
                phoneNumber: req.admin.phoneNumber,
                role: req.admin.role
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

module.exports = router;
