const mongoose = require('mongoose');

const collectionCaseSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caseNumber: {
        type: String,
        unique: true,
        required: true
    },
    overdueAmount: {
        type: Number,
        required: true
    },
    principalOverdue: Number,
    interestOverdue: Number,
    penaltyOverdue: Number,
    totalOutstanding: Number,
    daysPastDue: {
        type: Number,
        required: true
    },
    bucketCategory: {
        type: String,
        enum: ['0-30', '31-60', '61-90', '91-120', '121-180', '180+'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    assignedAt: Date,
    status: {
        type: String,
        enum: ['open', 'in_progress', 'contacted', 'promise_to_pay', 'payment_plan', 'legal', 'settled', 'written_off', 'closed'],
        default: 'open'
    },
    collectionStrategy: {
        type: String,
        enum: ['soft_reminder', 'regular_follow_up', 'aggressive', 'legal_notice', 'field_visit']
    },
    contactAttempts: {
        type: Number,
        default: 0
    },
    lastContactDate: Date,
    nextFollowUpDate: Date,
    promiseToPayDate: Date,
    promiseToPayAmount: Number,
    paymentPlan: [{
        dueDate: Date,
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'paid', 'missed']
        },
        paidDate: Date,
        paidAmount: Number
    }],
    collectionActivities: [{
        activityType: {
            type: String,
            enum: ['call', 'email', 'sms', 'whatsapp', 'field_visit', 'legal_notice']
        },
        contactedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        contactDate: Date,
        responseReceived: Boolean,
        notes: String,
        nextAction: String,
        nextActionDate: Date
    }],
    legalStatus: {
        isLegalAction: {
            type: Boolean,
            default: false
        },
        legalNoticeDate: Date,
        courtCaseNumber: String,
        lawyerAssigned: String,
        legalNotes: String
    },
    resolutionDate: Date,
    resolutionType: {
        type: String,
        enum: ['full_payment', 'partial_settlement', 'payment_plan', 'written_off', 'legal_settlement']
    },
    recoveredAmount: {
        type: Number,
        default: 0
    },
    remarks: String
}, {
    timestamps: true
});

const riskAssessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessmentType: {
        type: String,
        enum: ['initial', 'periodic', 'loan_application', 'ad_hoc'],
        default: 'loan_application'
    },
    assessmentDate: {
        type: Date,
        default: Date.now
    },
    creditScore: {
        type: Number,
        min: 300,
        max: 900
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    riskCategory: {
        type: String,
        enum: ['low', 'medium', 'high', 'very_high'],
        required: true
    },
    factors: {
        creditHistory: {
            score: Number,
            weight: Number
        },
        incomeStability: {
            score: Number,
            weight: Number
        },
        debtToIncomeRatio: {
            score: Number,
            weight: Number
        },
        repaymentHistory: {
            score: Number,
            weight: Number
        },
        employmentHistory: {
            score: Number,
            weight: Number
        },
        kycVerification: {
            score: Number,
            weight: Number
        },
        fraudIndicators: {
            score: Number,
            weight: Number
        }
    },
    recommendations: [{
        type: String
    }],
    approvedCreditLimit: Number,
    maximumLoanAmount: Number,
    recommendedInterestRate: Number,
    assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    nextReviewDate: Date,
    remarks: String
}, {
    timestamps: true
});

const fraudDetectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan'
    },
    alertType: {
        type: String,
        enum: ['duplicate_application', 'suspicious_documents', 'identity_mismatch', 'velocity_check', 'device_fingerprint', 'ip_analysis', 'behavior_anomaly'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'investigating', 'confirmed_fraud', 'false_positive', 'resolved'],
        default: 'open'
    },
    detectionMethod: {
        type: String,
        enum: ['automated', 'manual', 'customer_report']
    },
    indicators: [{
        indicator: String,
        value: mongoose.Schema.Types.Mixed,
        confidence: Number
    }],
    deviceInfo: {
        deviceId: String,
        ipAddress: String,
        userAgent: String,
        location: String
    },
    investigatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    investigationNotes: String,
    actionTaken: {
        type: String,
        enum: ['none', 'account_suspended', 'application_rejected', 'verification_required', 'reported_to_authorities']
    },
    resolvedAt: Date,
    remarks: String
}, {
    timestamps: true
});

const supportTicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['loan_inquiry', 'payment_issue', 'kyc_issue', 'account_issue', 'technical_issue', 'complaint', 'feedback', 'other'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'assigned', 'in_progress', 'pending_customer', 'resolved', 'closed', 'reopened'],
        default: 'open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    assignedAt: Date,
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['loan', 'repayment', 'transaction', 'kyc']
        },
        entityId: mongoose.Schema.Types.ObjectId
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    responses: [{
        respondedBy: {
            type: String,
            enum: ['user', 'admin']
        },
        responderId: mongoose.Schema.Types.ObjectId,
        message: String,
        attachments: [{
            filename: String,
            url: String
        }],
        isInternal: {
            type: Boolean,
            default: false
        },
        respondedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        resolvedAt: Date,
        resolutionNotes: String
    },
    customerSatisfaction: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        ratedAt: Date
    },
    slaDeadline: Date,
    firstResponseTime: Number,
    resolutionTime: Number,
    reopenCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

collectionCaseSchema.index({ userId: 1, status: 1 });
collectionCaseSchema.index({ bucketCategory: 1, status: 1 });
collectionCaseSchema.index({ assignedTo: 1, status: 1 });
riskAssessmentSchema.index({ userId: 1, assessmentDate: -1 });
fraudDetectionSchema.index({ userId: 1, status: 1 });
fraudDetectionSchema.index({ severity: 1, status: 1 });
supportTicketSchema.index({ userId: 1, status: 1 });
// ticketNumber already indexed via unique: true

module.exports = {
    CollectionCase: mongoose.model('CollectionCase', collectionCaseSchema),
    RiskAssessment: mongoose.model('RiskAssessment', riskAssessmentSchema),
    FraudDetection: mongoose.model('FraudDetection', fraudDetectionSchema),
    SupportTicket: mongoose.model('SupportTicket', supportTicketSchema)
};
