const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipientType: {
        type: String,
        enum: ['user', 'admin', 'all_users', 'specific_segment'],
        default: 'user'
    },
    segment: {
        type: String,
        enum: ['defaulters', 'premium', 'new_users', 'active_borrowers']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'reminder', 'promotional'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['loan_update', 'payment_reminder', 'kyc_update', 'promotional', 'system', 'account'],
        required: true
    },
    channels: {
        inApp: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        },
        sms: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: false
        },
        whatsapp: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    scheduledFor: Date,
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['loan', 'repayment', 'kyc', 'transaction', 'support_ticket']
        },
        entityId: mongoose.Schema.Types.ObjectId
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: String,
    expiresAt: Date,
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

const communicationTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp'],
        required: true
    },
    category: {
        type: String,
        enum: ['loan_approval', 'loan_rejection', 'disbursement', 'payment_reminder', 'payment_received', 'overdue', 'kyc_verification', 'welcome', 'otp'],
        required: true
    },
    subject: String,
    body: {
        type: String,
        required: true
    },
    variables: [{
        key: String,
        description: String,
        example: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    language: {
        type: String,
        default: 'en'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const smsLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    phoneNumber: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ['twilio', 'aws_sns', 'msg91', 'other']
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
    },
    providerResponse: mongoose.Schema.Types.Mixed,
    messageId: String,
    cost: Number,
    sentAt: Date,
    deliveredAt: Date,
    failureReason: String
}, {
    timestamps: true
});

const emailLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ['sendgrid', 'aws_ses', 'mailgun', 'other']
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
        default: 'pending'
    },
    providerResponse: mongoose.Schema.Types.Mixed,
    messageId: String,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    failureReason: String,
    attachments: [{
        filename: String,
        url: String
    }]
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
smsLogSchema.index({ userId: 1, status: 1 });
emailLogSchema.index({ userId: 1, status: 1 });

module.exports = {
    Notification: mongoose.model('Notification', notificationSchema),
    CommunicationTemplate: mongoose.model('CommunicationTemplate', communicationTemplateSchema),
    SMSLog: mongoose.model('SMSLog', smsLogSchema),
    EmailLog: mongoose.model('EmailLog', emailLogSchema)
};
