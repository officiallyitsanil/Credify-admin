const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    disbursementMethod: {
        type: String,
        enum: ['bank_transfer', 'upi', 'wallet', 'check', 'cash'],
        default: 'bank_transfer'
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        bankName: String
    },
    upiId: String,
    walletId: String,
    status: {
        type: String,
        enum: ['pending', 'processing', 'approved', 'disbursed', 'failed', 'cancelled', 'reversed'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    disbursedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    disbursedAt: Date,
    transactionId: String,
    referenceNumber: String,
    paymentGateway: String,
    paymentGatewayResponse: mongoose.Schema.Types.Mixed,
    failureReason: String,
    retryCount: {
        type: Number,
        default: 0
    },
    nextRetryAt: Date,
    charges: {
        processingFee: {
            type: Number,
            default: 0
        },
        gst: {
            type: Number,
            default: 0
        },
        otherCharges: {
            type: Number,
            default: 0
        },
        totalCharges: {
            type: Number,
            default: 0
        }
    },
    netDisbursementAmount: Number,
    expectedDisbursementDate: Date,
    actualDisbursementDate: Date,
    remarks: String,
    documents: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

disbursementSchema.index({ loanId: 1 });
disbursementSchema.index({ userId: 1 });
disbursementSchema.index({ status: 1 });
disbursementSchema.index({ disbursedAt: 1 });

module.exports = mongoose.model('Disbursement', disbursementSchema);
