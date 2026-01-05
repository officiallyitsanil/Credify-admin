const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emiNumber: {
        type: Number,
        required: true
    },
    emiAmount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: Date,
    paidAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'partial'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'bank_transfer', 'cash', 'cheque', 'card'],
    },
    transactionId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Update status to overdue if past due date
repaymentSchema.methods.checkOverdue = function () {
    if (this.status === 'pending' && new Date() > this.dueDate) {
        this.status = 'overdue';
    }
};

module.exports = mongoose.model('Repayment', repaymentSchema);
