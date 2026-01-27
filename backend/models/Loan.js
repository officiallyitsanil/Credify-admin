const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    tenureDays: {
        type: Number,
        required: true,
        enum: [7, 15, 30, 45, 60],
    },

    interestRate: {
        type: Number,
        default: 0,
    },
    interestAmount: {
        type: Number,
        default: 0,
    },
    interestCalculationMethod: {
        type: String,
        enum: ['SIMPLE', 'COMPOUND'],
        default: 'SIMPLE',
    },
    interestBasis: {
        type: String,
        enum: ['DAILY', 'MONTHLY', 'YEARLY'],
        default: 'DAILY',
    },
    loanReferenceNumber: {
        type: String,
        unique: true,
        trim: true,
    },
    loanPurpose: {
        type: String,
        trim: true,
    },
    termsAccepted: {
        type: Boolean,
        default: false,
    },
    termsAcceptedAt: {
        type: Date,
    },
    termsVersion: {
        type: String,
        trim: true,
    },
    lateFee: {
        type: Number,
        default: 0,
    },
    lateFeeRate: {
        type: Number,
        default: 0,
    },
    lateFeeType: {
        type: String,
        enum: ['FIXED', 'PER_DAY', 'PERCENTAGE'],
        default: 'PER_DAY',
    },
    totalLateFeeCharged: {
        type: Number,
        default: 0,
    },
    totalRepayable: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: ['REQUESTED', 'APPROVED', 'DISBURSED', 'REPAID', 'OVERDUE', 'REJECTED', 'CANCELLED', 'PREPAID', 'FORECLOSED', 'UNDER_REVIEW'],
        default: 'REQUESTED',
    },

    requestedAt: {
        type: Date,
        default: Date.now,
    },
    approvedAt: {
        type: Date,
    },
    disbursementDate: {
        type: Date,
    },
    dueDate: {
        type: Date,
    },
    repaidAt: {
        type: Date,
    },

    razorpayPaymentId: {
        type: String,
        trim: true,
    },
    razorpayOrderId: {
        type: String,
        trim: true,
    },
    cashfreePaymentId: {
        type: String,
        trim: true,
    },

    disbursementAccount: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
    },

    rejectionReason: {
        type: String,
        trim: true,
    },

    approvedBy: {
        type: String,
        trim: true,
    },

    adminNotes: {
        type: String,
        trim: true,
    },

    // Risk Assessment Fields
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        description: 'Calculated risk score at time of application'
    },
    riskCategory: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        description: 'Risk category based on assessment'
    },
    riskFactors: {
        type: [String],
        description: 'List of factors contributing to risk score'
    },
    approvalMethod: {
        type: String,
        enum: ['AUTO', 'MANUAL', 'HYBRID'],
        description: 'How the loan was approved'
    },
    autoApprovalEligible: {
        type: Boolean,
        default: false,
        description: 'Whether loan was eligible for auto-approval'
    },
    manualReviewRequired: {
        type: Boolean,
        default: false
    },
    manualReviewReason: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: {
        type: Date
    },

    repaymentScheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RepaymentSchedule',
    },
    principalAmount: {
        type: Number,
        min: 0,
    },
    emiAmount: {
        type: Number,
        default: 0,
    },
    remainingAmount: {
        type: Number,
        default: 0,
    },
    daysOverdue: {
        type: Number,
        default: 0,
    },
    lastReminderSent: {
        type: Date,
    },
    reminderCount: {
        type: Number,
        default: 0,
    },
    preclosureCharge: {
        type: Number,
        default: 0,
    },
    preclosureChargeRate: {
        type: Number,
        default: 0,
    },
    prepaymentAmount: {
        type: Number,
        default: 0,
    },
    prepaymentDate: {
        type: Date,
    },
    foreclosureAmount: {
        type: Number,
        default: 0,
    },
    foreclosureDate: {
        type: Date,
    },
    foreclosureCharge: {
        type: Number,
        default: 0,
    },
    isPrepaid: {
        type: Boolean,
        default: false,
    },
    isForeclosed: {
        type: Boolean,
        default: false,
    },
    loanHistory: [
        {
            status: {
                type: String,
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
            metadata: {
                type: mongoose.Schema.Types.Mixed,
            },
        },
    ],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Loan', loanSchema);
