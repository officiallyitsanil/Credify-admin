const mongoose = require('mongoose');

const loanSettingsSchema = new mongoose.Schema({
    // Age Configuration
    minAge: {
        type: Number,
        default: 18,
        min: 18,
        max: 100
    },
    maxAge: {
        type: Number,
        default: 30,
        min: 18,
        max: 100
    },

    // Credit Score Configuration
    minCreditScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 900
    },
    idealCreditScore: {
        type: Number,
        default: 750,
        min: 0,
        max: 900
    },

    // Risk Score Thresholds
    lowRiskThreshold: {
        type: Number,
        default: 30,
        min: 0,
        max: 100,
        description: 'Risk scores below this are considered LOW risk'
    },
    mediumRiskThreshold: {
        type: Number,
        default: 60,
        min: 0,
        max: 100,
        description: 'Risk scores below this but above low threshold are MEDIUM risk'
    },
    // Scores >= mediumRiskThreshold are HIGH risk

    // Auto-approval Settings
    autoApprovalEnabled: {
        type: Boolean,
        default: true
    },
    autoRejectEnabled: {
        type: Boolean,
        default: true
    },
    maxAutoApprovalAmount: {
        type: Number,
        default: 50000,
        min: 0,
        description: 'Maximum loan amount that can be auto-approved'
    },

    // Loan Amount Limits
    minLoanAmount: {
        type: Number,
        default: 1000,
        min: 100
    },
    maxLoanAmount: {
        type: Number,
        default: 100000,
        min: 1000
    },

    // Tenure Settings (in days)
    allowedTenures: {
        type: [Number],
        default: [7, 15, 30, 45, 60]
    },

    // Device & Behavior Settings
    enableDeviceCheck: {
        type: Boolean,
        default: true
    },
    enableBehaviorAnalysis: {
        type: Boolean,
        default: true
    },
    maxAccountsPerDevice: {
        type: Number,
        default: 1,
        min: 1
    },

    // Repayment History Settings
    minRepaymentHistoryForAutoApproval: {
        type: Number,
        default: 0,
        description: 'Minimum number of successfully repaid loans required for auto-approval'
    },
    maxOverdueLoansAllowed: {
        type: Number,
        default: 0,
        description: 'Maximum number of overdue loans allowed for approval'
    },

    // KYC Requirements
    requirePAN: {
        type: Boolean,
        default: true
    },
    requireAadhaar: {
        type: Boolean,
        default: true
    },
    requireSelfie: {
        type: Boolean,
        default: true
    },
    requireBankVerification: {
        type: Boolean,
        default: true
    },

    // Fraud Detection
    enableFraudCheck: {
        type: Boolean,
        default: true
    },
    blockBlacklistedUsers: {
        type: Boolean,
        default: true
    },

    // Manual Review Settings
    manualReviewQueueEnabled: {
        type: Boolean,
        default: true
    },
    manualReviewTimeout: {
        type: Number,
        default: 48,
        description: 'Hours to wait for manual review before auto-rejection'
    },

    // Notification Settings
    notifyUserOnAutoApproval: {
        type: Boolean,
        default: true
    },
    notifyUserOnAutoReject: {
        type: Boolean,
        default: true
    },
    notifyAdminOnManualReview: {
        type: Boolean,
        default: true
    },

    // Credit Limit Utilization
    maxCreditUtilization: {
        type: Number,
        default: 90,
        min: 0,
        max: 100,
        description: 'Maximum percentage of credit limit that can be utilized'
    },

    // Active Status
    isActive: {
        type: Boolean,
        default: true
    },

    // Metadata
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Validation to ensure min age is less than max age
loanSettingsSchema.pre('save', function(next) {
    if (this.minAge > this.maxAge) {
        next(new Error('Minimum age cannot be greater than maximum age'));
    }
    if (this.lowRiskThreshold >= this.mediumRiskThreshold) {
        next(new Error('Low risk threshold must be less than medium risk threshold'));
    }
    if (this.minLoanAmount > this.maxLoanAmount) {
        next(new Error('Minimum loan amount cannot be greater than maximum loan amount'));
    }
    next();
});

// Static method to get active settings (singleton pattern)
loanSettingsSchema.statics.getActiveSettings = async function() {
    let settings = await this.findOne({ isActive: true });
    
    // If no settings exist, create default settings
    if (!settings) {
        settings = await this.create({
            isActive: true,
            notes: 'Default loan settings created automatically'
        });
    }
    
    return settings;
};

module.exports = mongoose.model('LoanSettings', loanSettingsSchema);
