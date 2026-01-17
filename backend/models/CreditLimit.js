const mongoose = require('mongoose');

const creditLimitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalLimit: {
        type: Number,
        required: true,
        default: 0
    },
    availableLimit: {
        type: Number,
        required: true,
        default: 0
    },
    utilizedLimit: {
        type: Number,
        default: 0
    },
    blockedLimit: {
        type: Number,
        default: 0
    },
    creditScore: {
        type: Number,
        min: 300,
        max: 900
    },
    riskCategory: {
        type: String,
        enum: ['low', 'medium', 'high', 'very_high'],
        default: 'medium'
    },
    limitType: {
        type: String,
        enum: ['auto_approved', 'manual_approved', 'provisional'],
        default: 'provisional'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: {
        type: Date
    },
    lastReviewDate: {
        type: Date
    },
    nextReviewDate: {
        type: Date
    },
    increaseEligibility: {
        eligible: {
            type: Boolean,
            default: false
        },
        potentialIncrease: Number,
        eligibilityDate: Date
    },
    limitHistory: [{
        previousLimit: Number,
        newLimit: Number,
        reason: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'suspended', 'frozen', 'closed'],
        default: 'active'
    },
    remarks: String
}, {
    timestamps: true
});

creditLimitSchema.index({ userId: 1 });
creditLimitSchema.index({ status: 1 });
creditLimitSchema.index({ riskCategory: 1 });

module.exports = mongoose.model('CreditLimit', creditLimitSchema);
