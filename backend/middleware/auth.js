const admin = require('../utils/firebase');
const Admin = require('../models/Admin');

// Protect routes - verify Firebase token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Only allow specific phone number
        const allowedPhoneNumber = '+918500216667';
        if (decodedToken.phone_number !== allowedPhoneNumber) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This phone number is not authorized.'
            });
        }

        // Get admin from database using Firebase UID
        req.admin = await Admin.findOne({ firebaseUid: decodedToken.uid });

        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
            error: err.message
        });
    }
};

// Alias for protect - for admin routes
exports.verifyAdmin = exports.protect;
