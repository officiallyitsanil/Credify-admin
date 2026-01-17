const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
        required: true
    },
    documentNumber: {
        type: String,
        required: true,
        unique: true
    },
    documentFrontUrl: {
        type: String,
        required: true
    },
    documentBackUrl: {
        type: String
    },
    selfieUrl: {
        type: String,
        required: true
    },
    addressProofType: {
        type: String,
        enum: ['aadhaar', 'utility_bill', 'bank_statement', 'rental_agreement']
    },
    addressProofUrl: {
        type: String
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'verified', 'rejected', 'expired'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    verifiedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    verificationMethod: {
        type: String,
        enum: ['manual', 'automated', 'hybrid'],
        default: 'manual'
    },
    ocrData: {
        name: String,
        address: String,
        dateOfBirth: Date,
        documentNumber: String
    },
    livenessCheck: {
        passed: Boolean,
        score: Number,
        timestamp: Date
    },
    expiryDate: {
        type: Date
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Only index verificationStatus - userId and documentNumber already indexed via unique: true
kycSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('KYC', kycSchema);
