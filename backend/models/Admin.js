const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        trim: true
    },
    firebaseUid: {
        type: String,
        required: [true, 'Please provide a Firebase UID'],
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Admin', adminSchema);
