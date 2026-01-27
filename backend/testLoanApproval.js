const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const KYC = require('./models/KYC');
const Loan = require('./models/Loan');
const LoanSettings = require('./models/LoanSettings');

// Test the loan approval system
async function testLoanApproval() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Create or get loan settings
        console.log('📋 Setting up loan settings...');
        let settings = await LoanSettings.findOne({ isActive: true });
        if (!settings) {
            settings = await LoanSettings.create({
                isActive: true,
                minAge: 18,
                maxAge: 30,
                lowRiskThreshold: 20,  // 0-20 = LOW
                mediumRiskThreshold: 50, // 20-50 = MEDIUM, 50+ = HIGH
                notes: 'Test settings'
            });
            console.log('✅ Created default loan settings\n');
        } else {
            // Update settings for testing
            settings.lowRiskThreshold = 20;
            settings.mediumRiskThreshold = 50;
            await settings.save();
            console.log('✅ Updated loan settings for testing\n');
        }

        // Test Case 1: Low Risk User (Should Auto-Approve)
        console.log('='.repeat(60));
        console.log('TEST CASE 1: LOW RISK USER (Should Auto-Approve)');
        console.log('='.repeat(60));
        
        const lowRiskUser = await User.create({
            phoneNumber: '9876543210',
            fullName: 'Test User - Low Risk',
            email: 'lowrisk@test.com',
            dateOfBirth: new Date('2000-01-15'), // 26 years old
            creditLimit: 50000,
            usedCredit: 0,
            cibilScore: 780,
            isBlocked: false,
            fraudFlag: false,
            kycStatus: 'VERIFIED',
            bankDetails: {
                accountNumber: '123456789012',
                ifscCode: 'HDFC0001234',
                accountHolderName: 'Test User',
                bankName: 'HDFC Bank',
                isVerified: true,
                verifiedAt: new Date()
            }
        });
        console.log(`✅ Created low risk user: ${lowRiskUser.phoneNumber}`);

        const lowRiskKYC = await KYC.create({
            userId: lowRiskUser._id,
            documentType: 'pan',
            documentNumber: 'ABCDE1234F',
            documentFrontUrl: 'https://example.com/pan.jpg',
            selfieUrl: 'https://example.com/selfie.jpg',
            addressProofType: 'aadhaar',
            addressProofUrl: 'https://example.com/aadhaar.jpg',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            riskScore: 10
        });
        console.log(`✅ Created KYC record: ${lowRiskKYC.documentNumber}`);

        const lowRiskLoan = await Loan.create({
            phoneNumber: lowRiskUser.phoneNumber,
            amount: 20000,
            tenureDays: 30,
            interestRate: 2.5,
            interestAmount: 500,
            totalRepayable: 20500,
            status: 'REQUESTED',
            loanPurpose: 'Personal expenses',
            loanReferenceNumber: `TEST-LR-${Date.now()}-1`,
            termsAccepted: true,
            termsAcceptedAt: new Date()
        });
        console.log(`✅ Created loan: ${lowRiskLoan._id}`);

        // Process the loan
        const { processLoanApproval } = require('./utils/loanApproval');
        const result1 = await processLoanApproval(lowRiskLoan, settings);
        
        console.log('\n📊 APPROVAL DECISION:');
        console.log(`   Action: ${result1.action}`);
        console.log(`   Status: ${result1.status}`);
        console.log(`   Message: ${result1.message}`);
        console.log(`   Risk Score: ${result1.riskAssessment?.riskScore}/100`);
        console.log(`   Risk Category: ${result1.riskAssessment?.riskCategory}`);
        console.log(`   Risk Factors: ${result1.riskAssessment?.riskFactors.join(', ')}`);
        console.log('\n');

        // Test Case 2: Medium Risk User (Should go to Manual Review)
        console.log('='.repeat(60));
        console.log('TEST CASE 2: MEDIUM RISK USER (Manual Review Required)');
        console.log('='.repeat(60));

        const mediumRiskUser = await User.create({
            phoneNumber: '9123456789',
            fullName: 'Test User - Medium Risk',
            email: 'mediumrisk@test.com',
            dateOfBirth: new Date('2006-06-15'), // 19 years old (very young)
            creditLimit: 30000,
            usedCredit: 22000, // High utilization
            cibilScore: 650, // Fair credit score
            isBlocked: false,
            fraudFlag: false,
            kycStatus: 'VERIFIED',
            bankDetails: {
                accountNumber: '987654321098',
                ifscCode: 'ICIC0002345',
                accountHolderName: 'Test User Medium',
                bankName: 'ICICI Bank',
                isVerified: true,
                verifiedAt: new Date()
            }
        });
        console.log(`✅ Created medium risk user: ${mediumRiskUser.phoneNumber}`);

        const mediumRiskKYC = await KYC.create({
            userId: mediumRiskUser._id,
            documentType: 'pan',
            documentNumber: 'XYZAB5678G',
            documentFrontUrl: 'https://example.com/pan2.jpg',
            selfieUrl: 'https://example.com/selfie2.jpg',
            addressProofType: 'aadhaar',
            addressProofUrl: 'https://example.com/aadhaar2.jpg',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            riskScore: 40 // Medium KYC risk
        });
        console.log(`✅ Created KYC record: ${mediumRiskKYC.documentNumber}`);

        const mediumRiskLoan = await Loan.create({
            phoneNumber: mediumRiskUser.phoneNumber,
            amount: 7000, // This will push utilization over 95%
            tenureDays: 30,
            interestRate: 2.5,
            interestAmount: 175,
            totalRepayable: 7175,
            status: 'REQUESTED',
            loanPurpose: 'Education',
            loanReferenceNumber: `TEST-MR-${Date.now()}-2`,
            termsAccepted: true,
            termsAcceptedAt: new Date()
        });
        console.log(`✅ Created loan: ${mediumRiskLoan._id}`);

        const result2 = await processLoanApproval(mediumRiskLoan, settings);
        
        console.log('\n📊 APPROVAL DECISION:');
        console.log(`   Action: ${result2.action}`);
        console.log(`   Status: ${result2.status}`);
        console.log(`   Message: ${result2.message}`);
        console.log(`   Risk Score: ${result2.riskAssessment?.riskScore}/100`);
        console.log(`   Risk Category: ${result2.riskAssessment?.riskCategory}`);
        console.log(`   Risk Factors: ${result2.riskAssessment?.riskFactors.join(', ')}`);
        console.log('\n');

        // Test Case 3: High Risk User (Should Auto-Reject)
        console.log('='.repeat(60));
        console.log('TEST CASE 3: HIGH RISK USER (Should Auto-Reject)');
        console.log('='.repeat(60));

        const highRiskUser = await User.create({
            phoneNumber: '9999888877',
            fullName: 'Test User - High Risk',
            email: 'highrisk@test.com',
            dateOfBirth: new Date('2007-03-10'), // 18 years old (very young)
            creditLimit: 25000,
            usedCredit: 0,
            cibilScore: 550, // Poor credit score
            isBlocked: false,
            fraudFlag: false,
            suspiciousActivityFlag: true, // Flagged for suspicious activity
            kycStatus: 'VERIFIED',
            bankDetails: {
                accountNumber: '555666777888',
                ifscCode: 'SBIN0003456',
                accountHolderName: 'Test User High',
                bankName: 'SBI',
                isVerified: true,
                verifiedAt: new Date()
            }
        });
        console.log(`✅ Created high risk user: ${highRiskUser.phoneNumber}`);

        const highRiskKYC = await KYC.create({
            userId: highRiskUser._id,
            documentType: 'pan',
            documentNumber: 'PQRST9012H',
            documentFrontUrl: 'https://example.com/pan3.jpg',
            selfieUrl: 'https://example.com/selfie3.jpg',
            addressProofType: 'aadhaar',
            addressProofUrl: 'https://example.com/aadhaar3.jpg',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            riskScore: 60 // High KYC risk
        });
        console.log(`✅ Created KYC record: ${highRiskKYC.documentNumber}`);

        const highRiskLoan = await Loan.create({
            phoneNumber: highRiskUser.phoneNumber,
            amount: 22000,
            tenureDays: 30,
            interestRate: 3.0,
            interestAmount: 660,
            totalRepayable: 22660,
            status: 'REQUESTED',
            loanPurpose: 'Medical emergency',
            loanReferenceNumber: `TEST-HR-${Date.now()}-3`,
            termsAccepted: true,
            termsAcceptedAt: new Date()
        });
        console.log(`✅ Created loan: ${highRiskLoan._id}`);

        const result3 = await processLoanApproval(highRiskLoan, settings);
        
        console.log('\n📊 APPROVAL DECISION:');
        console.log(`   Action: ${result3.action}`);
        console.log(`   Status: ${result3.status}`);
        console.log(`   Message: ${result3.message}`);
        console.log(`   Risk Score: ${result3.riskAssessment?.riskScore}/100`);
        console.log(`   Risk Category: ${result3.riskAssessment?.riskCategory}`);
        console.log(`   Risk Factors: ${result3.riskAssessment?.riskFactors.join(', ')}`);
        console.log('\n');

        // Test Case 4: Blacklisted User (Immediate Rejection)
        console.log('='.repeat(60));
        console.log('TEST CASE 4: BLACKLISTED USER (Immediate Rejection)');
        console.log('='.repeat(60));

        const blacklistedUser = await User.create({
            phoneNumber: '9111222333',
            fullName: 'Test User - Blacklisted',
            email: 'blacklisted@test.com',
            dateOfBirth: new Date('1998-05-20'),
            creditLimit: 30000,
            usedCredit: 0,
            cibilScore: 750,
            isBlocked: true, // BLACKLISTED
            blockedAt: new Date(),
            blockReason: 'Multiple fraud attempts',
            fraudFlag: true,
            kycStatus: 'VERIFIED',
            bankDetails: {
                accountNumber: '111222333444',
                ifscCode: 'HDFC0004567',
                accountHolderName: 'Test User Blocked',
                bankName: 'HDFC Bank',
                isVerified: true,
                verifiedAt: new Date()
            }
        });
        console.log(`✅ Created blacklisted user: ${blacklistedUser.phoneNumber}`);

        const blacklistedKYC = await KYC.create({
            userId: blacklistedUser._id,
            documentType: 'pan',
            documentNumber: 'BLKLS1234I',
            documentFrontUrl: 'https://example.com/pan4.jpg',
            selfieUrl: 'https://example.com/selfie4.jpg',
            addressProofType: 'aadhaar',
            addressProofUrl: 'https://example.com/aadhaar4.jpg',
            verificationStatus: 'verified',
            verifiedAt: new Date()
        });
        console.log(`✅ Created KYC record: ${blacklistedKYC.documentNumber}`);

        const blacklistedLoan = await Loan.create({
            phoneNumber: blacklistedUser.phoneNumber,
            amount: 10000,
            tenureDays: 15,
            interestRate: 2.0,
            interestAmount: 200,
            totalRepayable: 10200,
            status: 'REQUESTED',
            loanPurpose: 'Personal',
            loanReferenceNumber: `TEST-BL-${Date.now()}-4`,
            termsAccepted: true,
            termsAcceptedAt: new Date()
        });
        console.log(`✅ Created loan: ${blacklistedLoan._id}`);

        const result4 = await processLoanApproval(blacklistedLoan, settings);
        
        console.log('\n📊 APPROVAL DECISION:');
        console.log(`   Action: ${result4.action}`);
        console.log(`   Status: ${result4.status}`);
        console.log(`   Message: ${result4.message}`);
        console.log('\n');

        // Summary
        console.log('='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Test Case 1 (Low Risk): ${result1.action === 'AUTO_APPROVE' ? 'PASSED ✓' : 'FAILED ✗'}`);
        console.log(`✅ Test Case 2 (Medium Risk): ${result2.action === 'MANUAL_REVIEW' ? 'PASSED ✓' : 'FAILED ✗'}`);
        console.log(`✅ Test Case 3 (High Risk): ${result3.action === 'AUTO_REJECT' ? 'PASSED ✓' : 'FAILED ✗'}`);
        console.log(`✅ Test Case 4 (Blacklisted): ${result4.action === 'REJECT' ? 'PASSED ✓' : 'FAILED ✗'}`);
        console.log('='.repeat(60));

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await User.deleteMany({ 
            phoneNumber: { 
                $in: ['9876543210', '9123456789', '9999888877', '9111222333'] 
            } 
        });
        await KYC.deleteMany({ 
            documentNumber: { 
                $in: ['ABCDE1234F', 'XYZAB5678G', 'PQRST9012H', 'BLKLS1234I'] 
            } 
        });
        await Loan.deleteMany({ 
            phoneNumber: { 
                $in: ['9876543210', '9123456789', '9999888877', '9111222333'] 
            } 
        });
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
}

// Run the test
testLoanApproval();
