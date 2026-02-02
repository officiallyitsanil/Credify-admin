const User = require('../models/User');
const KYC = require('../models/KYC');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');

/**
 * Calculate user's risk score based on multiple factors
 * @param {Object} user - User document
 * @param {Object} kyc - KYC document
 * @param {Number} loanAmount - Requested loan amount
 * @param {Object} settings - Loan settings for thresholds
 * @returns {Object} - { riskScore, riskCategory, riskFactors }
 */
const calculateRiskScore = async (user, kyc, loanAmount, settings) => {
    let riskScore = 0;
    const riskFactors = [];

    // 1. KYC Verification (0-20 points)
    if (!kyc || kyc.verificationStatus !== 'verified') {
        riskScore += 20;
        riskFactors.push('KYC not verified');
    } else if (kyc.riskScore && kyc.riskScore > 50) {
        riskScore += kyc.riskScore * 0.2; // Scale KYC risk score to 0-20
        riskFactors.push(`High KYC risk score: ${kyc.riskScore}`);
    }

    // 2. Age Check (0-15 points)
    if (user.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) {
            riskScore += 15;
            riskFactors.push(`Under age: ${age} years`);
        } else if (age > 30) {
            riskScore += 10;
            riskFactors.push(`Above preferred age: ${age} years`);
        } else if (age >= 18 && age <= 21) {
            riskScore += 5;
            riskFactors.push(`Young borrower: ${age} years`);
        }
    } else {
        riskScore += 10;
        riskFactors.push('Date of birth not provided');
    }

    // 3. Bank Account Verification (0-15 points)
    if (!user.bankDetails || !user.bankDetails.accountNumber || !user.bankDetails.isVerified) {
        riskScore += 15;
        riskFactors.push('Bank account not verified');
    }

    // 4. Mobile Number Verification (0-10 points)
    if (!user.phoneNumber || user.phoneNumber.length !== 10 || !user.phoneNumber.match(/^[6-9][0-9]{9}$/)) {
        riskScore += 10;
        riskFactors.push('Invalid Indian mobile number');
    }

    // 5. Blacklist/Fraud Flags (0-30 points - CRITICAL)
    if (user.isBlocked) {
        riskScore += 30;
        riskFactors.push('User is blocked/blacklisted');
    }
    if (user.fraudFlag) {
        riskScore += 30;
        riskFactors.push('Fraud flag detected');
    }

    // 6. Credit Score (0-20 points)
    if (user.cibilScore) {
        if (user.cibilScore < 600) {
            riskScore += 20;
            riskFactors.push(`Poor credit score: ${user.cibilScore}`);
        } else if (user.cibilScore < 700) {
            riskScore += 10;
            riskFactors.push(`Fair credit score: ${user.cibilScore}`);
        } else if (user.cibilScore < 750) {
            riskScore += 5;
            riskFactors.push(`Good credit score: ${user.cibilScore}`);
        }
        // Excellent score (750+) = 0 points
    } else {
        riskScore += 8;
        riskFactors.push('No credit score available');
    }

    // 7. Repayment History (0-20 points)
    const previousLoans = await Loan.find({ phoneNumber: user.phoneNumber });
    if (previousLoans.length > 0) {
        const overdueLoans = previousLoans.filter(loan => loan.status === 'OVERDUE').length;
        const repaidLoans = previousLoans.filter(loan => loan.status === 'REPAID').length;
        const totalLoans = previousLoans.length;

        if (overdueLoans > 0) {
            riskScore += overdueLoans * 10; // 10 points per overdue loan
            riskFactors.push(`${overdueLoans} overdue loan(s)`);
        }

        // Good repayment history reduces risk
        if (repaidLoans >= 3 && overdueLoans === 0) {
            riskScore = Math.max(0, riskScore - 10);
            riskFactors.push(`Good repayment history: ${repaidLoans} loans repaid`);
        }

        // Calculate average days overdue
        const overdueStats = await Repayment.find({
            user: user._id,
            status: { $in: ['overdue', 'paid_late'] }
        });

        if (overdueStats.length > 0) {
            const avgDaysOverdue = overdueStats.reduce((sum, r) => sum + (r.daysOverdue || 0), 0) / overdueStats.length;
            if (avgDaysOverdue > 10) {
                riskScore += 15;
                riskFactors.push(`High average overdue days: ${avgDaysOverdue.toFixed(1)}`);
            } else if (avgDaysOverdue > 5) {
                riskScore += 8;
                riskFactors.push(`Moderate average overdue days: ${avgDaysOverdue.toFixed(1)}`);
            }
        }
    }

    // 8. Device & Behavioral Checks (0-15 points)
    if (user.multipleAccountsFlag) {
        riskScore += 10;
        riskFactors.push('Multiple accounts detected from same device');
    }
    if (user.suspiciousActivityFlag) {
        riskScore += 15;
        riskFactors.push('Suspicious activity detected');
    }

    // 9. Loan Amount vs Available Credit Limit (0-10 points)
    const availableCredit = user.creditLimit - (user.usedCredit || 0);
    const utilizationRatio = (loanAmount / availableCredit) * 100;
    const totalUtilization = ((user.usedCredit || 0) + loanAmount) / user.creditLimit * 100;
    
    if (utilizationRatio > 100) {
        riskScore += 10;
        riskFactors.push(`Exceeds available credit: ${utilizationRatio.toFixed(1)}%`);
    } else if (totalUtilization > 90) {
        riskScore += 10;
        riskFactors.push(`High total credit utilization: ${totalUtilization.toFixed(1)}%`);
    } else if (totalUtilization > 75) {
        riskScore += 5;
        riskFactors.push(`Moderate credit utilization: ${totalUtilization.toFixed(1)}%`);
    }

    // 10. First Time Borrower (0-5 points)
    if (previousLoans.length === 0) {
        riskScore += 5;
        riskFactors.push('First time borrower');
    }

    // Determine risk category based on total score and settings thresholds
    const lowThreshold = settings?.lowRiskThreshold || 30;
    const mediumThreshold = settings?.mediumRiskThreshold || 60;
    
    let riskCategory;
    if (riskScore >= mediumThreshold) {
        riskCategory = 'HIGH';
    } else if (riskScore >= lowThreshold) {
        riskCategory = 'MEDIUM';
    } else {
        riskCategory = 'LOW';
    }

    return {
        riskScore: Math.min(100, riskScore), // Cap at 100
        riskCategory,
        riskFactors
    };
};

/**
 * Check if user meets all approval criteria
 * @param {Object} user - User document
 * @param {Object} kyc - KYC document
 * @param {Object} settings - Loan settings
 * @returns {Object} - { eligible, reasons }
 */
const checkEligibilityCriteria = async (user, kyc, settings) => {
    const reasons = [];
    let eligible = true;

    // 1. KYC Completion Check
    if (!kyc || kyc.verificationStatus !== 'verified') {
        eligible = false;
        reasons.push('KYC not completed or verified (PAN + Aadhaar + Selfie required)');
    } else {
        // Check if all required documents are present
        const hasAadhaar = kyc.documentType === 'aadhaar' || kyc.addressProofType === 'aadhaar';
        const hasPAN = kyc.documentType === 'pan';
        const hasSelfie = !!kyc.selfieUrl;

        if (!hasAadhaar) {
            eligible = false;
            reasons.push('Aadhaar card not provided');
        }
        if (!hasPAN && kyc.documentType !== 'pan') {
            eligible = false;
            reasons.push('PAN card not provided');
        }
        if (!hasSelfie) {
            eligible = false;
            reasons.push('Selfie not provided');
        }
    }

    // 2. Age Check
    const minAge = settings?.minAge || 18;
    const maxAge = settings?.maxAge || 30;

    if (user.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < minAge || age > maxAge) {
            eligible = false;
            reasons.push(`Age must be between ${minAge} and ${maxAge} years (Current: ${age})`);
        }
    } else {
        eligible = false;
        reasons.push('Date of birth not provided');
    }

    // 3. Indian Mobile Number Check
    if (!user.phoneNumber || !user.phoneNumber.match(/^[6-9][0-9]{9}$/)) {
        eligible = false;
        reasons.push('Valid Indian mobile number required');
    }

    // 4. Bank Account Verification
    if (!user.bankDetails || !user.bankDetails.accountNumber) {
        eligible = false;
        reasons.push('Bank account not added');
    } else if (!user.bankDetails.isVerified) {
        eligible = false;
        reasons.push('Bank account not verified');
    }

    // 5. Blacklist/Fraud Check (CRITICAL)
    if (user.isBlocked) {
        eligible = false;
        reasons.push('User is blacklisted');
    }
    if (user.fraudFlag) {
        eligible = false;
        reasons.push('Account flagged for fraudulent activity');
    }

    // 6. Credit Score Check (if available and minimum required)
    const minCreditScore = settings?.minCreditScore || 0;
    if (minCreditScore > 0 && user.cibilScore && user.cibilScore < minCreditScore) {
        eligible = false;
        reasons.push(`Credit score below minimum requirement (Required: ${minCreditScore}, Current: ${user.cibilScore})`);
    }

    return { eligible, reasons };
};

/**
 * Process loan approval based on risk assessment
 * @param {Object} loan - Loan document
 * @param {Object} settings - Loan settings
 * @returns {Object} - { action, status, message, riskAssessment }
 */
const processLoanApproval = async (loan, settings) => {
    try {
        // Fetch user and KYC data
        const user = await User.findOne({ phoneNumber: loan.phoneNumber });
        if (!user) {
            return {
                action: 'REJECT',
                status: 'REJECTED',
                message: 'User not found',
                riskAssessment: null
            };
        }

        const kyc = await KYC.findOne({ userId: user._id });

        // Check eligibility criteria
        const { eligible, reasons } = await checkEligibilityCriteria(user, kyc, settings);
        if (!eligible) {
            return {
                action: 'REJECT',
                status: 'REJECTED',
                message: reasons.join('; '),
                riskAssessment: null
            };
        }

        // Calculate risk score
        const riskAssessment = await calculateRiskScore(user, kyc, loan.amount, settings);

        // All loans require manual approval by admin
        let action, status, message;

        // Provide risk assessment information but always require manual review
        // The risk score and category will help admins make informed decisions
        switch (riskAssessment.riskCategory) {
            case 'LOW':
                action = 'MANUAL_REVIEW';
                status = 'UNDER_REVIEW';
                message = 'Loan requires manual review (Low risk profile)';
                break;

            case 'MEDIUM':
                action = 'MANUAL_REVIEW';
                status = 'UNDER_REVIEW';
                message = 'Loan requires manual review (Medium risk profile)';
                break;

            case 'HIGH':
                action = 'MANUAL_REVIEW';
                status = 'UNDER_REVIEW';
                message = 'Loan requires manual review (High risk profile - proceed with caution)';
                break;

            default:
                action = 'MANUAL_REVIEW';
                status = 'UNDER_REVIEW';
                message = 'Loan requires manual review';
        }

        return {
            action,
            status,
            message,
            riskAssessment
        };
    } catch (error) {
        console.error('Error in processLoanApproval:', error);
        throw error;
    }
};

module.exports = {
    calculateRiskScore,
    checkEligibilityCriteria,
    processLoanApproval
};
