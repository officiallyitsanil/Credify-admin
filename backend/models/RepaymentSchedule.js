const mongoose = require('mongoose');

const RepaymentScheduleSchema = new mongoose.Schema(
    {
        loanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Loan',
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        installments: [
            {
                installmentNumber: {
                    type: Number,
                    required: true,
                },
                dueDate: {
                    type: Date,
                    required: true,
                },
                principalAmount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                interestAmount: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                lateFee: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                totalAmount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                paidAmount: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                remainingAmount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                status: {
                    type: String,
                    enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED'],
                    default: 'PENDING',
                },
                paidAt: {
                    type: Date,
                },
                transactionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Transaction',
                },
                daysOverdue: {
                    type: Number,
                    default: 0,
                },
                reminderSent: {
                    type: Boolean,
                    default: false,
                },
                reminderSentAt: {
                    type: Date,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalRemaining: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
            default: 'ACTIVE',
        },
        nextDueDate: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const RepaymentSchedule = mongoose.model("RepaymentSchedule", RepaymentScheduleSchema);

module.exports = RepaymentSchedule;
