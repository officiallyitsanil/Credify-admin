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
        default: 0,
        min: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
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
