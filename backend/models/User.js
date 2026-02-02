const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    kycDocs: {
        panCardUrl: {
            type: String,
            trim: true,
        },
        aadharCardUrl: {
            type: String,
            trim: true,
        },
        selfieUrl: {
            type: String,
            trim: true,
        },
    },
    kycStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING',
    },
    creditLimit: {
        type: Number,
        default: 50000,
        min: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedAt: {
        type: Date,
    },
    blockReason: {
        type: String,
        trim: true,
    },
    fraudFlag: {
        type: Boolean,
        default: false,
        description: 'Flag indicating potential fraudulent activity'
    },
    fraudFlagReason: {
        type: String,
        trim: true,
    },
    fraudFlaggedAt: {
        type: Date,
    },
    multipleAccountsFlag: {
        type: Boolean,
        default: false,
        description: 'Flag for multiple accounts from same device'
    },
    suspiciousActivityFlag: {
        type: Boolean,
        default: false,
        description: 'Flag for suspicious behavioral patterns'
    },
    deviceFingerprint: {
        type: String,
        trim: true,
        description: 'Unique device identifier for fraud detection'
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    fcmToken: {
        type: String,
        trim: true,
        description: 'Firebase Cloud Messaging token for push notifications'
    },
    kycRejectionReason: {
        type: String,
        trim: true,
    },
    usedCredit: {
        type: Number,
        default: 0,
        min: 0,
    },
    cibilScore: {
        type: Number,
        min: 300,
        max: 900,
    },
    cibilScoreUpdatedAt: {
        type: Date,
    },
    bankDetails: {
        accountNumber: {
            type: String,
            trim: true,
        },
        ifscCode: {
            type: String,
            trim: true,
            uppercase: true,
        },
        accountHolderName: {
            type: String,
            trim: true,
        },
        bankName: {
            type: String,
            trim: true,
        },
        branchName: {
            type: String,
            trim: true,
        },
        accountType: {
            type: String,
            enum: ['SAVINGS', 'CURRENT', 'SALARY'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
    },
    creditLimitHistory: [
        {
            previousLimit: {
                type: Number,
                default: 0,
            },
            newLimit: {
                type: Number,
                required: true,
            },
            changedAt: {
                type: Date,
                default: Date.now,
            },
            changedBy: {
                type: String,
                trim: true,
            },
            reason: {
                type: String,
                trim: true,
            },
        },
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for available credit
userSchema.virtual('availableCredit').get(function () {
    return Math.max(0, (this.creditLimit || 0) - (this.usedCredit || 0));
});

module.exports = mongoose.model('User', userSchema);
