const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide loan amount']
    },
    interestRate: {
        type: Number,
        required: [true, 'Please provide interest rate'],
        default: 12
    },
    tenure: {
        type: Number,
        required: [true, 'Please provide tenure in months']
    },
    purpose: {
        type: String,
        required: [true, 'Please provide loan purpose']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectedAt: Date,
    rejectionReason: String,
    emiAmount: Number,
    totalAmount: Number,
    disbursedAt: Date,
    completedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate EMI and total amount before saving
loanSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isModified('interestRate') || this.isModified('tenure')) {
        const monthlyRate = this.interestRate / 12 / 100;
        const emi = (this.amount * monthlyRate * Math.pow(1 + monthlyRate, this.tenure)) /
            (Math.pow(1 + monthlyRate, this.tenure) - 1);
        this.emiAmount = Math.round(emi * 100) / 100;
        this.totalAmount = Math.round(this.emiAmount * this.tenure * 100) / 100;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Loan', loanSchema);
