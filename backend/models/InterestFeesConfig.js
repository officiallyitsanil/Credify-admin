const mongoose = require('mongoose');

const interestConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    interestType: {
        type: String,
        enum: ['flat', 'reducing', 'compound'],
        default: 'reducing'
    },
    rateType: {
        type: String,
        enum: ['fixed', 'variable'],
        default: 'fixed'
    },
    annualRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    monthlyRate: {
        type: Number
    },
    dailyRate: {
        type: Number
    },
    applicableTo: {
        type: String,
        enum: ['all', 'new_users', 'existing_users', 'premium_users'],
        default: 'all'
    },
    loanTypes: [{
        type: String,
        enum: ['personal', 'business', 'education', 'medical', 'home', 'vehicle']
    }],
    minAmount: Number,
    maxAmount: Number,
    minTenure: Number,
    maxTenure: Number,
    riskBasedRates: [{
        riskCategory: {
            type: String,
            enum: ['low', 'medium', 'high', 'very_high']
        },
        rateModifier: Number // +/- percentage
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true
    },
    effectiveTo: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const feesConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    feeType: {
        type: String,
        enum: ['processing', 'documentation', 'late_payment', 'prepayment', 'bounced_payment', 'legal', 'foreclosure', 'other'],
        required: true
    },
    chargeType: {
        type: String,
        enum: ['fixed', 'percentage', 'tiered'],
        default: 'fixed'
    },
    amount: Number,
    percentage: Number,
    minAmount: Number,
    maxAmount: Number,
    tieredStructure: [{
        fromAmount: Number,
        toAmount: Number,
        fee: Number
    }],
    gstApplicable: {
        type: Boolean,
        default: true
    },
    gstPercentage: {
        type: Number,
        default: 18
    },
    applicableTo: {
        type: String,
        enum: ['all', 'new_loans', 'specific_loans'],
        default: 'all'
    },
    loanTypes: [{
        type: String,
        enum: ['personal', 'business', 'education', 'medical', 'home', 'vehicle']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true
    },
    effectiveTo: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const penaltyConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    penaltyType: {
        type: String,
        enum: ['late_payment', 'missed_payment', 'partial_payment', 'bounced_check', 'default'],
        required: true
    },
    calculationType: {
        type: String,
        enum: ['fixed', 'percentage_of_emi', 'percentage_of_outstanding', 'daily_percentage'],
        default: 'percentage_of_emi'
    },
    amount: Number,
    percentage: Number,
    dailyRate: Number,
    gracePeriodDays: {
        type: Number,
        default: 0
    },
    maxPenaltyAmount: Number,
    compounding: {
        type: Boolean,
        default: false
    },
    applicableTo: {
        type: String,
        enum: ['all', 'specific_risk_category'],
        default: 'all'
    },
    riskCategories: [{
        type: String,
        enum: ['low', 'medium', 'high', 'very_high']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true
    },
    effectiveTo: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

interestConfigSchema.index({ isActive: 1, effectiveFrom: 1 });
feesConfigSchema.index({ feeType: 1, isActive: 1 });
penaltyConfigSchema.index({ penaltyType: 1, isActive: 1 });

module.exports = {
    InterestConfig: mongoose.model('InterestConfig', interestConfigSchema),
    FeesConfig: mongoose.model('FeesConfig', feesConfigSchema),
    PenaltyConfig: mongoose.model('PenaltyConfig', penaltyConfigSchema)
};
