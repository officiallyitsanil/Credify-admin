const admin = require('firebase-admin');
const User = require('../models/User');

/**
 * Dual notification system: Firebase Cloud Messaging (Push) + SMS
 * - FCM for in-app push notifications
 * - SMS for text messages to phone numbers
 */

/**
 * Helper function to send actual SMS via Twilio
 * Configure Twilio credentials in .env file
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        // Check if Twilio is configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            console.log('⚠️  Twilio not configured. SMS will be skipped.');
            console.log('   To enable SMS, add to .env:');
            console.log('   TWILIO_ACCOUNT_SID=your_account_sid');
            console.log('   TWILIO_AUTH_TOKEN=your_auth_token');
            console.log('   TWILIO_PHONE_NUMBER=your_twilio_number');
            return { success: false, skipped: true, message: 'Twilio not configured' };
        }

        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Format phone number for India (add country code if not present)
        const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

        const response = await client.messages.create({
            body: message,
            to: formattedPhone,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        console.log(`✅ SMS sent to ${phoneNumber}:`, response.sid);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error(`❌ Error sending SMS to ${phoneNumber}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Helper function to send FCM notification
 */
const sendFCMNotification = async (phoneNumber, title, body, data = {}) => {
    try {
        // Get user's FCM token from database
        const user = await User.findOne({ phoneNumber });
        
        if (!user || !user.fcmToken) {
            console.log(`⚠️  No FCM token found for ${phoneNumber}. Push notification skipped.`);
            return { success: false, message: 'No FCM token registered' };
        }

        const message = {
            notification: {
                title: title,
                body: body
            },
            data: data,
            token: user.fcmToken
        };

        const response = await admin.messaging().send(message);
        console.log(`✅ FCM notification sent to ${phoneNumber}:`, response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error(`❌ Error sending FCM notification to ${phoneNumber}:`, error.message);
        
        // If token is invalid, clear it from database
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
            await User.findOneAndUpdate({ phoneNumber }, { $unset: { fcmToken: 1 } });
            console.log(`Cleared invalid FCM token for ${phoneNumber}`);
        }
        
        return { success: false, error: error.message };
    }
};

/**
 * Send both SMS and FCM notification
 */
const sendDualNotification = async (phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData = {}) => {
    const results = {
        sms: null,
        fcm: null
    };

    // Send SMS
    results.sms = await sendSMS(phoneNumber, smsMessage);

    // Send FCM push notification
    results.fcm = await sendFCMNotification(phoneNumber, fcmTitle, fcmBody, fcmData);

    return results;
};

/**
 * Send loan application notification
 */
/**
 * Send loan application notification
 */
const sendLoanApplicationSMS = async (phoneNumber, loan) => {
    try {
        const smsMessage = `Dear Customer, your loan application (Ref: ${loan.loanReferenceNumber}) for ₹${loan.amount.toLocaleString()} has been received and is under review. - Credify`;
        const fcmTitle = '📋 Loan Application Received';
        const fcmBody = `Your loan application (Ref: ${loan.loanReferenceNumber}) for ₹${loan.amount.toLocaleString()} has been received and is under review.`;
        
        const fcmData = {
            type: 'LOAN_APPLICATION',
            loanId: loan._id.toString(),
            loanReferenceNumber: loan.loanReferenceNumber,
            amount: loan.amount.toString()
        };
        
        return await sendDualNotification(phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData);
    } catch (error) {
        console.error('Error sending loan application notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send loan approval notification
 */
const sendLoanApprovalSMS = async (phoneNumber, loan) => {
    try {
        const smsMessage = `Congratulations! Your loan of ₹${loan.amount.toLocaleString()} (Ref: ${loan.loanReferenceNumber}) has been APPROVED. Amount will be disbursed within 24-48 hours. - Credify`;
        const fcmTitle = '🎉 Loan Approved!';
        const fcmBody = `Congratulations! Your loan of ₹${loan.amount.toLocaleString()} has been APPROVED. Amount will be disbursed within 24-48 hours.`;
        
        const fcmData = {
            type: 'LOAN_APPROVAL',
            loanId: loan._id.toString(),
            loanReferenceNumber: loan.loanReferenceNumber,
            amount: loan.amount.toString(),
            dueDate: loan.dueDate.toString()
        };
        
        return await sendDualNotification(phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData);
    } catch (error) {
        console.error('Error sending loan approval notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send loan disbursement notification
 */
const sendDisbursementSMS = async (phoneNumber, loan) => {
    try {
        const smsMessage = `Your loan of ₹${loan.amount.toLocaleString()} (Ref: ${loan.loanReferenceNumber}) has been disbursed to your bank account. Total repayable: ₹${loan.totalRepayable.toLocaleString()}. - Credify`;
        const fcmTitle = '💰 Loan Disbursed';
        const fcmBody = `Your loan amount ₹${loan.amount.toLocaleString()} has been disbursed to your bank account. Total repayable: ₹${loan.totalRepayable.toLocaleString()}.`;
        
        const fcmData = {
            type: 'LOAN_DISBURSEMENT',
            loanId: loan._id.toString(),
            loanReferenceNumber: loan.loanReferenceNumber,
            amount: loan.amount.toString(),
            totalRepayable: loan.totalRepayable.toString()
        };
        
        return await sendDualNotification(phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData);
    } catch (error) {
        console.error('Error sending disbursement notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment reminder notification
 */
const sendRepaymentReminderSMS = async (phoneNumber, loan, daysUntilDue) => {
    try {
        let smsMessage;
        let fcmTitle;
        let fcmBody;
        
        if (daysUntilDue === 0) {
            smsMessage = `URGENT: Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} (Ref: ${loan.loanReferenceNumber}) is DUE TODAY. Please pay immediately to avoid late fees. - Credify`;
            fcmTitle = '🚨 Payment Due Today!';
            fcmBody = `URGENT: Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} is DUE TODAY. Please pay immediately to avoid late fees.`;
        } else if (daysUntilDue === 1) {
            smsMessage = `REMINDER: Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} (Ref: ${loan.loanReferenceNumber}) is due TOMORROW. Please make the payment on time. - Credify`;
            fcmTitle = '⏰ Payment Due Tomorrow';
            fcmBody = `REMINDER: Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} is due TOMORROW. Please make the payment on time.`;
        } else {
            smsMessage = `REMINDER: Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} (Ref: ${loan.loanReferenceNumber}) is due in ${daysUntilDue} days. - Credify`;
            fcmTitle = '⏰ Payment Reminder';
            fcmBody = `Your loan repayment of ₹${loan.totalRepayable.toLocaleString()} is due in ${daysUntilDue} days on ${new Date(loan.dueDate).toLocaleDateString()}.`;
        }
        
        const fcmData = {
            type: 'REPAYMENT_REMINDER',
            loanId: loan._id.toString(),
            loanReferenceNumber: loan.loanReferenceNumber,
            amount: loan.totalRepayable.toString(),
            daysUntilDue: daysUntilDue.toString(),
            dueDate: loan.dueDate.toString()
        };
        
        return await sendDualNotification(phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData);
    } catch (error) {
        console.error('Error sending repayment reminder notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment confirmation notification
 */
const sendRepaymentConfirmationSMS = async (phoneNumber, loan, amount) => {
    try {
        const smsMessage = `Payment of ₹${amount.toLocaleString()} received successfully for loan (Ref: ${loan.loanReferenceNumber}). Your loan is now closed. Thank you! - Credify`;
        const fcmTitle = '✅ Payment Received';
        const fcmBody = `Payment of ₹${amount.toLocaleString()} received successfully. Your loan is now closed. Thank you for choosing Credify!`;
        
        const fcmData = {
            type: 'REPAYMENT_CONFIRMATION',
            loanId: loan._id.toString(),
            loanReferenceNumber: loan.loanReferenceNumber,
            amount: amount.toString()
        };
        
        return await sendDualNotification(phoneNumber, smsMessage, fcmTitle, fcmBody, fcmData);
    } catch (error) {
        console.error('Error sending repayment confirmation notification:', error);
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
