const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },

        loanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Loans',
        },

        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['DISBURSEMENT', 'REPAYMENT', 'LATE_FEE', 'INTEREST', 'REFUND', 'ADJUSTMENT', 'PREPAYMENT', 'FORECLOSURE', 'PRECLOSURE_CHARGE'],
            required: true,
        },

        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
            default: 'PENDING',
        },

        gatewayId: {
            type: String,
            trim: true,
        },
        gatewayOrderId: {
            type: String,
            trim: true,
        },
        gatewayTransactionId: {
            type: String,
            trim: true,
        },
        gateway: {
            type: String,
            enum: ['RAZORPAY', 'CASHFREE'],
            trim: true,
        },

        paymentMethod: {
            type: String,
            enum: ['UPI', 'NET_BANKING', 'DEBIT_CARD', 'CREDIT_CARD', 'WALLET', 'BANK_TRANSFER'],
        },

        description: {
            type: String,
            trim: true,
        },
        referenceNumber: {
            type: String,
            trim: true,
        },

        failureReason: {
            type: String,
            trim: true,
        },

        transactionDate: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
