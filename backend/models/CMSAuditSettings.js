const mongoose = require('mongoose');

const cmsContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    contentType: {
        type: String,
        enum: ['page', 'blog', 'faq', 'terms', 'privacy', 'announcement', 'banner'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    shortDescription: String,
    featuredImage: String,
    category: String,
    tags: [String],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: Date,
    scheduledPublishAt: Date,
    seo: {
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
        ogImage: String
    },
    visibility: {
        type: String,
        enum: ['public', 'authenticated', 'admin_only'],
        default: 'public'
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'create', 'read', 'update', 'delete',
            'login', 'logout', 'login_failed',
            'loan_approved', 'loan_rejected', 'loan_disbursed',
            'payment_received', 'payment_failed',
            'kyc_verified', 'kyc_rejected',
            'user_suspended', 'user_activated',
            'settings_changed', 'config_updated',
            'export_data', 'bulk_operation'
        ]
    },
    entityType: {
        type: String,
        enum: ['user', 'admin', 'loan', 'repayment', 'kyc', 'transaction', 'settings', 'report', 'other']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        location: String,
        deviceInfo: String
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    description: String,
    errorMessage: String
}, {
    timestamps: true
});

const systemSettingsSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['general', 'loan', 'payment', 'notification', 'security', 'integration', 'compliance']
    },
    key: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'array', 'object'],
        default: 'string'
    },
    description: String,
    isEncrypted: {
        type: Boolean,
        default: false
    },
    isEditable: {
        type: Boolean,
        default: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const integrationConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['payment_gateway', 'sms_provider', 'email_provider', 'kyc_verification', 'credit_bureau', 'banking_api', 'analytics', 'other'],
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    credentials: {
        apiKey: String,
        apiSecret: String,
        clientId: String,
        clientSecret: String,
        webhookUrl: String,
        additionalConfig: mongoose.Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isSandbox: {
        type: Boolean,
        default: true
    },
    endpoints: {
        baseUrl: String,
        authUrl: String,
        transactionUrl: String,
        webhookUrl: String
    },
    rateLimits: {
        requestsPerMinute: Number,
        requestsPerDay: Number
    },
    lastHealthCheck: Date,
    healthStatus: {
        type: String,
        enum: ['healthy', 'degraded', 'down', 'unknown'],
        default: 'unknown'
    },
    statistics: {
        totalRequests: {
            type: Number,
            default: 0
        },
        successfulRequests: {
            type: Number,
            default: 0
        },
        failedRequests: {
            type: Number,
            default: 0
        },
        lastRequestAt: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

const reportConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    reportType: {
        type: String,
        enum: ['loan_summary', 'collection', 'disbursement', 'financial', 'user_activity', 'kyc_status', 'custom'],
        required: true
    },
    description: String,
    frequency: {
        type: String,
        enum: ['on_demand', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'on_demand'
    },
    schedule: {
        dayOfWeek: Number, // 0-6 for weekly
        dayOfMonth: Number, // 1-31 for monthly
        time: String // HH:mm
    },
    filters: mongoose.Schema.Types.Mixed,
    recipients: [{
        type: String // email addresses
    }],
    format: {
        type: String,
        enum: ['pdf', 'excel', 'csv', 'json'],
        default: 'excel'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastGeneratedAt: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// slug already indexed via unique: true
cmsContentSchema.index({ contentType: 1, status: 1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
systemSettingsSchema.index({ category: 1, key: 1 }, { unique: true });
integrationConfigSchema.index({ type: 1, isActive: 1 });

module.exports = {
    CMSContent: mongoose.model('CMSContent', cmsContentSchema),
    AuditLog: mongoose.model('AuditLog', auditLogSchema),
    SystemSettings: mongoose.model('SystemSettings', systemSettingsSchema),
    IntegrationConfig: mongoose.model('IntegrationConfig', integrationConfigSchema),
    ReportConfig: mongoose.model('ReportConfig', reportConfigSchema)
};
