require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Loan = require('./models/Loan');
const Repayment = require('./models/Repayment');
const Transaction = require('./models/Transaction');
const RepaymentSchedule = require('./models/RepaymentSchedule');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credify');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Sample data
const sampleUsers = [
    {
        phoneNumber: '+919876543210',
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        dateOfBirth: new Date('1990-05-15'),
        kycStatus: 'VERIFIED',
        creditLimit: 50000,
        usedCredit: 15000,
        cibilScore: 750,
        cibilScoreUpdatedAt: new Date(),
        isBlocked: false,
        address: {
            street: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001'
        },
        bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            accountHolderName: 'Rajesh Kumar',
            bankName: 'HDFC Bank',
            branchName: 'MG Road',
            accountType: 'SAVINGS',
            isVerified: true,
            verifiedAt: new Date()
        },
        kycDocs: {
            panCardUrl: 'https://example.com/pan/rajesh.jpg',
            aadharCardUrl: 'https://example.com/aadhar/rajesh.jpg',
            selfieUrl: 'https://example.com/selfie/rajesh.jpg'
        },
        creditLimitHistory: [
            {
                previousLimit: 0,
                newLimit: 50000,
                changedAt: new Date('2024-01-15'),
                changedBy: 'admin@credify.com',
                reason: 'Initial credit limit'
            }
        ]
    },
    {
        phoneNumber: '+919876543211',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        dateOfBirth: new Date('1995-08-22'),
        kycStatus: 'VERIFIED',
        creditLimit: 75000,
        usedCredit: 25000,
        cibilScore: 780,
        cibilScoreUpdatedAt: new Date(),
        isBlocked: false,
        address: {
            street: '456 Park Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
        },
        bankDetails: {
            accountNumber: '9876543210',
            ifscCode: 'ICIC0001234',
            accountHolderName: 'Priya Sharma',
            bankName: 'ICICI Bank',
            branchName: 'Andheri',
            accountType: 'SAVINGS',
            isVerified: true,
            verifiedAt: new Date()
        },
        kycDocs: {
            panCardUrl: 'https://example.com/pan/priya.jpg',
            aadharCardUrl: 'https://example.com/aadhar/priya.jpg',
            selfieUrl: 'https://example.com/selfie/priya.jpg'
        }
    },
    {
        phoneNumber: '+919876543212',
        fullName: 'Amit Patel',
        email: 'amit.patel@example.com',
        dateOfBirth: new Date('1988-12-10'),
        kycStatus: 'PENDING',
        creditLimit: 30000,
        usedCredit: 0,
        cibilScore: 680,
        cibilScoreUpdatedAt: new Date(),
        isBlocked: false,
        address: {
            street: '789 Ring Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380001'
        },
        kycDocs: {
            panCardUrl: 'https://example.com/pan/amit.jpg',
            aadharCardUrl: 'https://example.com/aadhar/amit.jpg',
            selfieUrl: 'https://example.com/selfie/amit.jpg'
        }
    },
    {
        phoneNumber: '+919876543213',
        fullName: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        dateOfBirth: new Date('1992-03-18'),
        kycStatus: 'REJECTED',
        creditLimit: 0,
        usedCredit: 0,
        isBlocked: false,
        kycRejectionReason: 'Document quality not sufficient',
        address: {
            street: '321 Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033'
        },
        kycDocs: {
            panCardUrl: 'https://example.com/pan/sneha.jpg',
            aadharCardUrl: 'https://example.com/aadhar/sneha.jpg'
        }
    },
    {
        phoneNumber: '+919876543214',
        fullName: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        dateOfBirth: new Date('1985-07-25'),
        kycStatus: 'VERIFIED',
        creditLimit: 100000,
        usedCredit: 60000,
        cibilScore: 720,
        cibilScoreUpdatedAt: new Date(),
        isBlocked: false,
        address: {
            street: '555 Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001'
        },
        bankDetails: {
            accountNumber: '5555666677',
            ifscCode: 'SBIN0001234',
            accountHolderName: 'Vikram Singh',
            bankName: 'State Bank of India',
            branchName: 'Connaught Place',
            accountType: 'CURRENT',
            isVerified: true,
            verifiedAt: new Date()
        },
        kycDocs: {
            panCardUrl: 'https://example.com/pan/vikram.jpg',
            aadharCardUrl: 'https://example.com/aadhar/vikram.jpg',
            selfieUrl: 'https://example.com/selfie/vikram.jpg'
        }
    }
];

const generateLoanReferenceNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LN${timestamp}${random}`;
};

const createSampleLoans = (users) => {
    const loans = [];

    // Active loan for Rajesh
    loans.push({
        phoneNumber: users[0].phoneNumber,
        amount: 15000,
        tenureDays: 30,
        interestRate: 2.5,
        interestAmount: 375,
        totalRepayable: 15375,
        principalAmount: 15000,
        remainingAmount: 15375,
        status: 'DISBURSED',
        loanReferenceNumber: generateLoanReferenceNumber(),
        loanPurpose: 'Personal expense',
        requestedAt: new Date('2025-12-20'),
        approvedAt: new Date('2025-12-21'),
        disbursementDate: new Date('2025-12-22'),
        dueDate: new Date('2026-01-21'),
        approvedBy: 'admin@credify.com',
        termsAccepted: true,
        termsAcceptedAt: new Date('2025-12-20'),
        interestCalculationMethod: 'SIMPLE',
        interestBasis: 'MONTHLY',
        razorpayOrderId: 'order_' + Date.now(),
        disbursementAccount: {
            accountNumber: users[0].bankDetails.accountNumber,
            ifscCode: users[0].bankDetails.ifscCode,
            accountHolderName: users[0].bankDetails.accountHolderName
        }
    });

    // Completed loan for Priya
    loans.push({
        phoneNumber: users[1].phoneNumber,
        amount: 25000,
        tenureDays: 45,
        interestRate: 3,
        interestAmount: 750,
        totalRepayable: 25750,
        principalAmount: 25000,
        remainingAmount: 0,
        status: 'REPAID',
        loanReferenceNumber: generateLoanReferenceNumber(),
        loanPurpose: 'Medical emergency',
        requestedAt: new Date('2025-11-01'),
        approvedAt: new Date('2025-11-02'),
        disbursementDate: new Date('2025-11-03'),
        dueDate: new Date('2025-12-18'),
        repaidAt: new Date('2025-12-15'),
        approvedBy: 'admin@credify.com',
        termsAccepted: true,
        termsAcceptedAt: new Date('2025-11-01'),
        interestCalculationMethod: 'SIMPLE',
        interestBasis: 'MONTHLY'
    });

    // Pending loan request for Amit
    loans.push({
        phoneNumber: users[2].phoneNumber,
        amount: 10000,
        tenureDays: 15,
        interestRate: 2,
        interestAmount: 200,
        totalRepayable: 10200,
        principalAmount: 10000,
        remainingAmount: 10200,
        status: 'REQUESTED',
        loanReferenceNumber: generateLoanReferenceNumber(),
        loanPurpose: 'Home repair',
        requestedAt: new Date('2026-01-15'),
        termsAccepted: true,
        termsAcceptedAt: new Date('2026-01-15'),
        interestCalculationMethod: 'SIMPLE',
        interestBasis: 'MONTHLY'
    });

    // Overdue loan for Vikram
    loans.push({
        phoneNumber: users[4].phoneNumber,
        amount: 50000,
        tenureDays: 60,
        interestRate: 3.5,
        interestAmount: 1750,
        totalRepayable: 51750,
        principalAmount: 50000,
        remainingAmount: 51750,
        lateFee: 500,
        totalLateFeeCharged: 500,
        status: 'OVERDUE',
        loanReferenceNumber: generateLoanReferenceNumber(),
        loanPurpose: 'Business expansion',
        requestedAt: new Date('2025-10-15'),
        approvedAt: new Date('2025-10-16'),
        disbursementDate: new Date('2025-10-17'),
        dueDate: new Date('2025-12-16'),
        approvedBy: 'admin@credify.com',
        termsAccepted: true,
        daysOverdue: 31,
        interestCalculationMethod: 'SIMPLE',
        interestBasis: 'MONTHLY',
        lateFeeType: 'PER_DAY',
        lateFeeRate: 50
    });

    // Another approved loan for Vikram
    loans.push({
        phoneNumber: users[4].phoneNumber,
        amount: 10000,
        tenureDays: 7,
        interestRate: 1.5,
        interestAmount: 150,
        totalRepayable: 10150,
        principalAmount: 10000,
        remainingAmount: 10150,
        status: 'APPROVED',
        loanReferenceNumber: generateLoanReferenceNumber(),
        loanPurpose: 'Short term need',
        requestedAt: new Date('2026-01-14'),
        approvedAt: new Date('2026-01-15'),
        approvedBy: 'admin@credify.com',
        termsAccepted: true,
        termsAcceptedAt: new Date('2026-01-14'),
        interestCalculationMethod: 'SIMPLE',
        interestBasis: 'MONTHLY'
    });

    return loans;
};

const createSampleTransactions = (loans) => {
    const transactions = [];

    // Disbursement for Rajesh's loan
    transactions.push({
        phoneNumber: loans[0].phoneNumber,
        loanId: null, // Will be set after loan creation
        amount: loans[0].amount,
        type: 'DISBURSEMENT',
        status: 'SUCCESS',
        gatewayId: 'pay_' + Date.now(),
        gatewayOrderId: loans[0].razorpayOrderId,
        gateway: 'RAZORPAY',
        paymentMethod: 'BANK_TRANSFER',
        description: `Loan disbursement for ${loans[0].loanReferenceNumber}`,
        referenceNumber: 'TXN' + Date.now(),
        transactionDate: loans[0].disbursementDate,
        processedAt: loans[0].disbursementDate
    });

    // Repayment for Priya's completed loan
    transactions.push({
        phoneNumber: loans[1].phoneNumber,
        loanId: null,
        amount: loans[1].totalRepayable,
        type: 'REPAYMENT',
        status: 'SUCCESS',
        gatewayId: 'pay_' + (Date.now() + 1),
        gateway: 'RAZORPAY',
        paymentMethod: 'UPI',
        description: `Full repayment for ${loans[1].loanReferenceNumber}`,
        referenceNumber: 'TXN' + (Date.now() + 1),
        transactionDate: loans[1].repaidAt,
        processedAt: loans[1].repaidAt
    });

    return transactions;
};

const createSampleRepayments = (loans, users) => {
    const repayments = [];

    // Calculate repayment details for Priya's completed loan
    const completedLoan = loans[1];
    const emiAmount = completedLoan.totalRepayable;
    const dueDate = new Date(completedLoan.disbursementDate);
    dueDate.setDate(dueDate.getDate() + completedLoan.tenureDays);

    // Repayment for Priya's completed loan
    repayments.push({
        loan: null, // Will be set after loan creation
        user: null, // Will be set after user creation
        emiNumber: 1,
        emiAmount: emiAmount,
        dueDate: dueDate,
        paidDate: completedLoan.repaidAt,
        paidAmount: emiAmount,
        paymentMethod: 'upi',
        transactionId: 'pay_completed_' + Date.now(),
        status: 'paid'
    });

    return repayments;
};

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Loan.deleteMany({});
        await Repayment.deleteMany({});
        await Transaction.deleteMany({});
        await RepaymentSchedule.deleteMany({});

        console.log('Creating sample users...');
        const users = await User.insertMany(sampleUsers);
        console.log(`✓ Created ${users.length} users`);

        console.log('Creating sample loans...');
        const loanData = createSampleLoans(users);
        const loans = await Loan.insertMany(loanData);
        console.log(`✓ Created ${loans.length} loans`);

        console.log('Creating sample transactions...');
        const transactionData = createSampleTransactions(loans);
        // Update loanId references
        transactionData[0].loanId = loans[0]._id;
        transactionData[1].loanId = loans[1]._id;
        const transactions = await Transaction.insertMany(transactionData);
        console.log(`✓ Created ${transactions.length} transactions`);

        console.log('Creating sample repayments...');
        const repaymentData = createSampleRepayments(loans, users);
        repaymentData[0].loan = loans[1]._id;
        repaymentData[0].user = users[1]._id;
        const repayments = await Repayment.insertMany(repaymentData);
        console.log(`✓ Created ${repayments.length} repayments`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nSummary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Loans: ${loans.length}`);
        console.log(`- Transactions: ${transactions.length}`);
        console.log(`- Repayments: ${repayments.length}`);

        console.log('\nSample User Credentials for Testing:');
        users.forEach(user => {
            console.log(`- ${user.fullName}: ${user.phoneNumber} (KYC: ${user.kycStatus})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();
