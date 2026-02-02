const emailService = require('./emailService');
const smsService = require('./smsService');
const User = require('../models/User');

/**
 * Send notifications for loan application
 */
const notifyLoanApplication = async (phoneNumber, loan) => {
    try {
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            console.log('User not found for notifications');
            return;
        }

        // Send email notification if user has email
        if (user.email) {
            await emailService.sendLoanApplicationEmail(user, loan);
        }

        // Send SMS notification
        await smsService.sendLoanApplicationSMS(phoneNumber, loan);

        console.log(`Loan application notifications sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending loan application notifications:', error);
    }
};

/**
 * Send notifications for loan approval
 */
const notifyLoanApproval = async (phoneNumber, loan) => {
    try {
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            console.log('User not found for notifications');
            return;
        }

        // Send email notification if user has email
        if (user.email) {
            await emailService.sendLoanApprovalEmail(user, loan);
        }

        // Send SMS notification
        await smsService.sendLoanApprovalSMS(phoneNumber, loan);

        console.log(`Loan approval notifications sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending loan approval notifications:', error);
    }
};

/**
 * Send notifications for loan disbursement
 */
const notifyLoanDisbursement = async (phoneNumber, loan, disbursement) => {
    try {
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            console.log('User not found for notifications');
            return;
        }

        // Send email notification if user has email
        if (user.email) {
            await emailService.sendDisbursementEmail(user, loan, disbursement);
        }

        // Send SMS notification
        await smsService.sendDisbursementSMS(phoneNumber, loan);

        console.log(`Disbursement notifications sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending disbursement notifications:', error);
    }
};

/**
 * Send repayment reminder notifications
 */
const notifyRepaymentReminder = async (phoneNumber, loan, daysUntilDue) => {
    try {
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            console.log('User not found for notifications');
            return;
        }

        // Send email notification if user has email
        if (user.email) {
            await emailService.sendRepaymentReminderEmail(user, loan, daysUntilDue);
        }

        // Send SMS notification
        await smsService.sendRepaymentReminderSMS(phoneNumber, loan, daysUntilDue);

        console.log(`Repayment reminder notifications sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending repayment reminder notifications:', error);
    }
};

/**
 * Send repayment confirmation notifications
 */
const notifyRepaymentConfirmation = async (phoneNumber, loan, payment) => {
    try {
        const user = await User.findOne({ phoneNumber });
        
        if (!user) {
            console.log('User not found for notifications');
            return;
        }

        // Send email notification if user has email
        if (user.email) {
            await emailService.sendRepaymentConfirmationEmail(user, loan, payment);
        }

        // Send SMS notification
        await smsService.sendRepaymentConfirmationSMS(phoneNumber, loan, payment?.amount || loan.totalRepayable);

        console.log(`Repayment confirmation notifications sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending repayment confirmation notifications:', error);
    }
};

module.exports = {
    notifyLoanApplication,
    notifyLoanApproval,
    notifyLoanDisbursement,
    notifyRepaymentReminder,
    notifyRepaymentConfirmation
};
