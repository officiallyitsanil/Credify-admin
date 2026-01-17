require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Loan = require('./models/Loan');
const Repayment = require('./models/Repayment');
const Transaction = require('./models/Transaction');
const RepaymentSchedule = require('./models/RepaymentSchedule');
const KYC = require('./models/KYC');
const CreditLimit = require('./models/CreditLimit');
const Disbursement = require('./models/Disbursement');
const { InterestConfig, FeesConfig, PenaltyConfig } = require('./models/InterestFeesConfig');
const { Notification, CommunicationTemplate, SMSLog, EmailLog } = require('./models/Notification');
const { CollectionCase, RiskAssessment, FraudDetection, SupportTicket } = require('./models/CollectionRiskSupport');
const { CMSContent, AuditLog, SystemSettings, IntegrationConfig, ReportConfig } = require('./models/CMSAuditSettings');
const Admin = require('./models/Admin');

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
        try {
            await User.deleteMany({});
            await Loan.deleteMany({});
            await Repayment.deleteMany({});
            await Transaction.deleteMany({});
            await RepaymentSchedule.deleteMany({});
            await KYC.deleteMany({});
            await CreditLimit.deleteMany({});
            await Disbursement.deleteMany({});
            await InterestConfig.deleteMany({});
            await FeesConfig.deleteMany({});
            await PenaltyConfig.deleteMany({});
            await Notification.deleteMany({});
            await Collection.deleteMany({});
            await RiskAssessment.deleteMany({});
            await FraudDetection.deleteMany({});
            await SupportTicket.deleteMany({});
            await CMSContent.deleteMany({});
            await AuditLog.deleteMany({});
            await SystemSettings.deleteMany({});
            await Admin.deleteMany({});
        } catch (e) {
            console.log('Some collections may not exist yet:', e.message);
        }

        console.log('Creating sample admin...');
        let admin = await Admin.findOne({ email: 'admin@credify.com' });
        if (!admin) {
            admin = await Admin.create({
                name: 'System Admin',
                email: 'admin@credify.com',
                phoneNumber: '+919999999999',
                firebaseUid: 'admin_uid_12345',
                password: 'admin123',
                role: 'super_admin',
                permissions: ['all']
            });
            console.log('✓ Created admin user');
        } else {
            console.log('✓ Admin user already exists');
        }

        console.log('Creating sample users...');
        let users = [];
        const userEmails = sampleUsers.map(u => u.email);
        const existingUsers = await User.find({ email: { $in: userEmails } });

        if (existingUsers.length === 0) {
            users = await User.insertMany(sampleUsers);
            console.log(`✓ Created ${users.length} users`);
        } else if (existingUsers.length < sampleUsers.length) {
            const existingEmails = existingUsers.map(u => u.email);
            const newUsers = sampleUsers.filter(u => !existingEmails.includes(u.email));
            const created = await User.insertMany(newUsers);
            users = [...existingUsers, ...created];
            console.log(`✓ Found ${existingUsers.length} existing, created ${created.length} new users`);
        } else {
            users = existingUsers;
            console.log(`✓ All ${users.length} users already exist`);
        }

        console.log('Creating KYC records...');
        const kycRecords = [];
        for (let i = 0; i < 3; i++) {
            kycRecords.push({
                userId: users[i]._id,
                documentType: 'aadhaar',
                documentNumber: `123456${i}890${i}`,
                documentFrontUrl: `https://example.com/kyc/aadhaar_front_${i}.jpg`,
                documentBackUrl: `https://example.com/kyc/aadhaar_back_${i}.jpg`,
                selfieUrl: `https://example.com/kyc/selfie_${i}.jpg`,
                status: i === 0 ? 'approved' : i === 1 ? 'pending' : 'rejected',
                verificationType: 'manual',
                verifiedBy: i === 0 ? admin._id : null,
                verifiedAt: i === 0 ? new Date() : null,
                remarks: i === 2 ? 'Document not clear' : 'All good'
            });
        }
        const kycs = await KYC.insertMany(kycRecords);
        console.log(`✓ Created ${kycs.length} KYC records`);

        console.log('Creating credit limits...');
        const creditLimits = [];
        for (let i = 0; i < users.length; i++) {
            if (users[i].creditLimit > 0) {
                creditLimits.push({
                    userId: users[i]._id,
                    totalLimit: users[i].creditLimit,
                    utilizedLimit: users[i].usedCredit,
                    availableLimit: users[i].creditLimit - users[i].usedCredit,
                    creditScore: users[i].cibilScore,
                    riskCategory: users[i].cibilScore > 750 ? 'low' : users[i].cibilScore > 650 ? 'medium' : 'high',
                    limitType: 'manual_approved',
                    approvedBy: admin._id,
                    approvedAt: new Date(),
                    status: 'active'
                });
            }
        }
        const limits = await CreditLimit.insertMany(creditLimits);
        console.log(`✓ Created ${limits.length} credit limits`);

        console.log('Creating sample loans...');
        const loanData = createSampleLoans(users);
        const loans = await Loan.insertMany(loanData);
        console.log(`✓ Created ${loans.length} loans`);

        console.log('Creating disbursements...');
        const disbursements = [
            {
                loanId: loans[0]._id,
                userId: users[0]._id,
                amount: loans[0].amount,
                disbursementMethod: 'bank_transfer',
                bankDetails: {
                    accountNumber: users[0].bankDetails?.accountNumber || '1234567890',
                    ifscCode: users[0].bankDetails?.ifscCode || 'SBIN0001234',
                    accountHolderName: users[0].fullName,
                    bankName: 'State Bank of India'
                },
                status: 'disbursed',
                approvedBy: admin._id,
                approvedAt: loans[0].disbursementDate,
                disbursedBy: admin._id,
                disbursedAt: loans[0].disbursementDate,
                transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            },
            {
                loanId: loans[1]._id,
                userId: users[1]._id,
                amount: loans[1].amount,
                disbursementMethod: 'upi',
                upiId: 'priya@paytm',
                status: 'disbursed',
                approvedBy: admin._id,
                approvedAt: loans[1].disbursementDate,
                disbursedBy: admin._id,
                disbursedAt: loans[1].disbursementDate,
                transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            }
        ];
        const disb = await Disbursement.insertMany(disbursements);
        console.log(`✓ Created ${disb.length} disbursements`);

        console.log('Creating interest/fees configurations...');
        const configs = [
            {
                name: 'Standard Interest Rate',
                description: 'Default interest rate for personal loans',
                interestType: 'reducing',
                rateType: 'fixed',
                annualRate: 24,
                monthlyRate: 2,
                dailyRate: 0.07,
                applicableTo: 'all',
                loanTypes: ['personal'],
                isActive: true,
                effectiveFrom: new Date()
            },
            {
                name: 'Premium User Interest',
                description: 'Lower rate for premium users',
                interestType: 'reducing',
                rateType: 'fixed',
                annualRate: 18,
                monthlyRate: 1.5,
                dailyRate: 0.05,
                applicableTo: 'premium_users',
                loanTypes: ['personal', 'business'],
                isActive: true,
                effectiveFrom: new Date()
            }
        ];
        const feeConfigs = await InterestConfig.insertMany(configs);
        console.log(`✓ Created ${feeConfigs.length} interest configurations`);

        console.log('Creating notifications...');
        const notifications = [
            {
                userId: users[0]._id,
                title: 'Loan Approved',
                message: 'Your loan application has been approved!',
                type: 'success',
                category: 'loan_update',
                channels: {
                    inApp: true,
                    sms: true
                },
                status: 'sent',
                sentAt: new Date()
            },
            {
                userId: users[0]._id,
                title: 'Payment Due Reminder',
                message: 'Your EMI payment is due in 3 days',
                type: 'reminder',
                category: 'payment_reminder',
                channels: {
                    inApp: true,
                    email: true
                },
                status: 'sent',
                sentAt: new Date()
            },
            {
                userId: users[1]._id,
                title: 'Payment Successful',
                message: 'Your payment of ₹25,750 has been received',
                type: 'success',
                category: 'loan_update',
                channels: {
                    inApp: true,
                    push: true
                },
                status: 'delivered',
                isRead: true,
                readAt: new Date()
            }
        ];
        const notifs = await Notification.insertMany(notifications);
        console.log(`✓ Created ${notifs.length} notifications`);

        console.log('Creating collection records...');
        const collections = [
            {
                loanId: loans[3]._id,
                userId: users[4]._id,
                caseNumber: 'COL' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                overdueAmount: 15000,
                principalOverdue: 10000,
                interestOverdue: 3000,
                penaltyOverdue: 2000,
                totalOutstanding: 15000,
                daysPastDue: 45,
                bucketCategory: '31-60',
                status: 'in_progress',
                priority: 'high',
                assignedTo: admin._id,
                assignedAt: new Date(),
                contactAttempts: 2,
                lastContactDate: new Date(),
                nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                collectionActivities: [{
                    activityType: 'call',
                    contactedBy: admin._id,
                    contactDate: new Date(),
                    responseReceived: true,
                    notes: 'Customer promised to pay by end of week',
                    nextAction: 'Follow-up call'
                }]
            }
        ];
        const coll = await CollectionCase.insertMany(collections);
        console.log(`✓ Created ${coll.length} collection records`);

        console.log('Creating risk assessments...');
        const risks = [
            {
                userId: users[0]._id,
                assessmentType: 'loan_application',
                creditScore: 750,
                riskScore: 85,
                riskCategory: 'low',
                factors: {
                    creditHistory: { score: 85, weight: 0.3 },
                    repaymentHistory: { score: 90, weight: 0.25 },
                    incomeStability: { score: 80, weight: 0.2 },
                    debtToIncomeRatio: { score: 75, weight: 0.15 },
                    kycVerification: { score: 100, weight: 0.1 }
                },
                approvedCreditLimit: 50000,
                assessedBy: admin._id
            },
            {
                userId: users[4]._id,
                assessmentType: 'periodic',
                creditScore: 600,
                riskScore: 45,
                riskCategory: 'high',
                factors: {
                    creditHistory: { score: 50, weight: 0.3 },
                    repaymentHistory: { score: 30, weight: 0.25 },
                    incomeStability: { score: 60, weight: 0.2 },
                    debtToIncomeRatio: { score: 40, weight: 0.15 }
                },
                recommendations: ['Close monitoring', 'Consider collection agency'],
                assessedBy: admin._id
            }
        ];
        const riskAssess = await RiskAssessment.insertMany(risks);
        console.log(`✓ Created ${riskAssess.length} risk assessments`);

        console.log('Creating fraud alerts...');
        const frauds = [
            {
                userId: users[2]._id,
                alertType: 'duplicate_application',
                severity: 'medium',
                status: 'investigating',
                detectionMethod: 'automated',
                indicators: [{
                    indicator: 'duplicate_device',
                    value: 'DEV12345',
                    confidence: 85
                }],
                deviceInfo: {
                    deviceId: 'DEV12345',
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0',
                    location: 'Mumbai, India'
                },
                investigationNotes: 'Multiple loan applications from same device detected',
                investigatedBy: admin._id
            }
        ];
        const fraudAlerts = await FraudDetection.insertMany(frauds);
        console.log(`✓ Created ${fraudAlerts.length} fraud alerts`);

        console.log('Creating support tickets...');
        const tickets = [
            {
                ticketNumber: 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                userId: users[0]._id,
                category: 'loan_inquiry',
                priority: 'medium',
                subject: 'Query about interest rate',
                description: 'I want to know how interest is calculated',
                status: 'assigned',
                assignedTo: admin._id,
                assignedAt: new Date(),
                responses: [
                    {
                        respondedBy: 'admin',
                        responderId: admin._id,
                        message: 'We use simple interest calculation method',
                        respondedAt: new Date(),
                        isInternal: false
                    }
                ]
            },
            {
                ticketNumber: 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                userId: users[1]._id,
                category: 'payment_issue',
                priority: 'high',
                subject: 'Payment not reflecting',
                description: 'I made a payment but it is not showing in my account',
                status: 'resolved',
                assignedTo: admin._id,
                resolution: {
                    resolvedBy: admin._id,
                    resolvedAt: new Date(),
                    resolutionNotes: 'Payment was processed successfully. Updated in system.'
                }
            }
        ];
        const supportTickets = await SupportTicket.insertMany(tickets);
        console.log(`✓ Created ${supportTickets.length} support tickets`);

        console.log('Creating CMS content...');
        const cmsContent = [
            {
                title: 'Terms and Conditions',
                slug: 'terms-and-conditions',
                contentType: 'terms',
                content: 'This is the terms and conditions page content...',
                status: 'published',
                publishedAt: new Date(),
                author: admin._id,
                visibility: 'public'
            },
            {
                title: 'How to apply for a loan?',
                slug: 'how-to-apply-loan',
                contentType: 'faq',
                content: 'Step 1: Register... Step 2: Complete KYC...',
                status: 'published',
                publishedAt: new Date(),
                author: admin._id,
                category: 'loan_application',
                visibility: 'public'
            },
            {
                title: 'Welcome Offer',
                slug: 'welcome-offer',
                contentType: 'banner',
                content: 'Get 0% interest on your first loan',
                shortDescription: 'Special offer for new users',
                status: 'published',
                author: admin._id,
                featuredImage: 'https://example.com/banner.jpg',
                visibility: 'public'
            }
        ];
        const cms = await CMSContent.insertMany(cmsContent);
        console.log(`✓ Created ${cms.length} CMS entries`);

        console.log('Creating audit logs...');
        const auditLogs = [
            {
                userId: admin._id,
                action: 'create',
                module: 'loan',
                description: 'Created new loan application',
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
                metadata: {
                    loanId: loans[0]._id,
                    amount: loans[0].amount
                }
            },
            {
                userId: admin._id,
                action: 'update',
                module: 'user',
                description: 'Updated user KYC status',
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
                metadata: {
                    userId: users[0]._id,
                    oldStatus: 'pending',
                    newStatus: 'approved'
                }
            }
        ];
        const logs = await AuditLog.insertMany(auditLogs);
        console.log(`✓ Created ${logs.length} audit logs`);

        console.log('Creating system settings...');
        const settings = [
            {
                category: 'general',
                key: 'app_name',
                value: 'Credify',
                description: 'Application name',
                isActive: true,
                updatedBy: admin._id
            },
            {
                category: 'loan',
                key: 'max_loan_amount',
                value: '100000',
                description: 'Maximum loan amount allowed',
                isActive: true,
                updatedBy: admin._id
            },
            {
                category: 'loan',
                key: 'min_cibil_score',
                value: '650',
                description: 'Minimum CIBIL score required',
                isActive: true,
                updatedBy: admin._id
            },
            {
                category: 'notification',
                key: 'sms_enabled',
                value: 'true',
                description: 'Enable SMS notifications',
                isActive: true,
                updatedBy: admin._id
            },
            {
                category: 'notification',
                key: 'email_enabled',
                value: 'true',
                description: 'Enable email notifications',
                isActive: true,
                updatedBy: admin._id
            }
        ];
        const sysSettings = await SystemSettings.insertMany(settings);
        console.log(`✓ Created ${sysSettings.length} system settings`);

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
        console.log(`- KYC Records: ${kycs.length}`);
        console.log(`- Credit Limits: ${limits.length}`);
        console.log(`- Loans: ${loans.length}`);
        console.log(`- Disbursements: ${disb.length}`);
        console.log(`- Interest/Fee Configs: ${feeConfigs.length}`);
        console.log(`- Notifications: ${notifs.length}`);
        console.log(`- Collections: ${coll.length}`);
        console.log(`- Risk Assessments: ${riskAssess.length}`);
        console.log(`- Fraud Alerts: ${fraudAlerts.length}`);
        console.log(`- Support Tickets: ${supportTickets.length}`);
        console.log(`- CMS Entries: ${cms.length}`);
        console.log(`- Audit Logs: ${logs.length}`);
        console.log(`- System Settings: ${sysSettings.length}`);
        console.log(`- Transactions: ${transactions.length}`);
        console.log(`- Repayments: ${repayments.length}`);

        console.log('\nAdmin Credentials:');
        console.log('- Email: admin@credify.com');
        console.log('- Password: admin123');

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
