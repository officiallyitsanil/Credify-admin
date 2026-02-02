const admin = require('firebase-admin');

/**
 * Send SMS using Firebase Admin SDK
 * Note: Firebase doesn't directly send SMS. This uses Firebase Cloud Messaging
 * For production, integrate with services like Twilio, AWS SNS, or similar
 */

/**
 * Send loan application SMS
 */
const sendLoanApplicationSMS = async (phoneNumber, loan) => {
    try {
        const message = `Dear Customer, your loan application (Ref: ${loan.loanReferenceNumber}) for ₹${loan.amount} has been received and is under review. You will be notified once processed. - Credify`;
        
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        // For production, integrate with actual SMS service like Twilio:
        // const client = require('twilio')(accountSid, authToken);
        // await client.messages.create({
        //     body: message,
        //     to: `+91${phoneNumber}`,
        //     from: process.env.TWILIO_PHONE_NUMBER
        // });
        
        return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
        console.error('Error sending loan application SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send loan approval SMS
 */
const sendLoanApprovalSMS = async (phoneNumber, loan) => {
    try {
        const message = `Congratulations! Your loan application (Ref: ${loan.loanReferenceNumber}) for ₹${loan.amount} has been APPROVED. Amount will be disbursed within 24-48 hours. Due date: ${new Date(loan.dueDate).toLocaleDateString()}. - Credify`;
        
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
        console.error('Error sending loan approval SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send loan disbursement SMS
 */
const sendDisbursementSMS = async (phoneNumber, loan) => {
    try {
        const message = `Your loan amount ₹${loan.amount} (Ref: ${loan.loanReferenceNumber}) has been disbursed to your registered bank account. Total repayable: ₹${loan.totalRepayable}. Due date: ${new Date(loan.dueDate).toLocaleDateString()}. - Credify`;
        
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
        console.error('Error sending disbursement SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment reminder SMS
 */
const sendRepaymentReminderSMS = async (phoneNumber, loan, daysUntilDue) => {
    try {
        let message;
        
        if (daysUntilDue === 0) {
            message = `URGENT: Your loan repayment of ₹${loan.totalRepayable} (Ref: ${loan.loanReferenceNumber}) is DUE TODAY. Please pay immediately to avoid late fees. - Credify`;
        } else if (daysUntilDue === 1) {
            message = `REMINDER: Your loan repayment of ₹${loan.totalRepayable} (Ref: ${loan.loanReferenceNumber}) is due TOMORROW. Please make the payment on time. - Credify`;
        } else {
            message = `REMINDER: Your loan repayment of ₹${loan.totalRepayable} (Ref: ${loan.loanReferenceNumber}) is due in ${daysUntilDue} days on ${new Date(loan.dueDate).toLocaleDateString()}. - Credify`;
        }
        
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
        console.error('Error sending repayment reminder SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment confirmation SMS
 */
const sendRepaymentConfirmationSMS = async (phoneNumber, loan, amount) => {
    try {
        const message = `Payment of ₹${amount} received successfully for loan (Ref: ${loan.loanReferenceNumber}). Your loan is now closed. Thank you for choosing Credify!`;
        
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        return { success: true, message: 'SMS sent (simulated)' };
    } catch (error) {
        console.error('Error sending repayment confirmation SMS:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendLoanApplicationSMS,
    sendLoanApprovalSMS,
    sendDisbursementSMS,
    sendRepaymentReminderSMS,
    sendRepaymentConfirmationSMS
};
