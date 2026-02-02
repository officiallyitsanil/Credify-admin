const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Email credentials not configured. Email notifications will be skipped.');
        console.warn('   To enable email notifications:');
        console.warn('   1. Go to https://myaccount.google.com/apppasswords');
        console.warn('   2. Generate an App Password for "Credify Backend"');
        console.warn('   3. Add EMAIL_USER and EMAIL_PASSWORD to your .env file');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send loan application confirmation email
 */
const sendLoanApplicationEmail = async (user, loan) => {
    try {
        const transporter = createTransporter();
        
        // Skip if transporter is not configured
        if (!transporter) {
            console.log('📧 Email notification skipped - credentials not configured');
            return { success: false, skipped: true, message: 'Email credentials not configured' };
        }
        
        const mailOptions = {
            from: 'Credify Loans <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: 'Loan Application Received - Credify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6C63FF;">Loan Application Received</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Your loan application has been successfully submitted and is under review.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Loan Details:</h3>
                        <p><strong>Loan Reference:</strong> ${loan.loanReferenceNumber}</p>
                        <p><strong>Amount:</strong> ₹${loan.amount.toLocaleString()}</p>
                        <p><strong>Tenure:</strong> ${loan.tenureDays} days</p>
                        <p><strong>Interest Rate:</strong> ${loan.interestRate}%</p>
                        <p><strong>Total Repayable:</strong> ₹${loan.totalRepayable.toLocaleString()}</p>
                        <p><strong>Due Date:</strong> ${new Date(loan.dueDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${loan.status}</p>
                    </div>
                    
                    <p>We will review your application and notify you once it's processed.</p>
                    <p>You can track your application status using reference number: <strong>${loan.loanReferenceNumber}</strong></p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>Credify Team</p>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Loan application email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending loan application email:', error.message);
        if (error.code === 'EAUTH') {
            console.error('   Gmail authentication failed. Please check:');
            console.error('   1. EMAIL_USER is correct in .env');
            console.error('   2. EMAIL_PASSWORD is a valid App Password (not your regular Gmail password)');
            console.error('   3. 2-Step Verification is enabled in your Google account');
        }
        return { success: false, error: error.message };
    }
};

/**
 * Send loan approval email
 */
const sendLoanApprovalEmail = async (user, loan) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log('📧 Email notification skipped - credentials not configured');
            return { success: false, skipped: true };
        }
        
        const mailOptions = {
            from: 'Credify Loans <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: '🎉 Loan Approved - Credify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">🎉 Congratulations! Your Loan is Approved</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Great news! Your loan application has been approved.</p>
                    
                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="margin-top: 0; color: #28a745;">Approved Loan Details:</h3>
                        <p><strong>Loan Reference:</strong> ${loan.loanReferenceNumber}</p>
                        <p><strong>Approved Amount:</strong> ₹${loan.amount.toLocaleString()}</p>
                        <p><strong>Tenure:</strong> ${loan.tenureDays} days</p>
                        <p><strong>Interest Amount:</strong> ₹${loan.interestAmount.toLocaleString()}</p>
                        <p><strong>Total Repayable:</strong> ₹${loan.totalRepayable.toLocaleString()}</p>
                        <p><strong>Repayment Due Date:</strong> ${new Date(loan.dueDate).toLocaleDateString()}</p>
                        <p><strong>Approved On:</strong> ${new Date(loan.approvedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Your loan amount will be disbursed to your registered bank account within 24-48 hours</li>
                        <li>You will receive a disbursement confirmation once the amount is transferred</li>
                        <li>Please ensure timely repayment on or before the due date</li>
                    </ul>
                    
                    <p style="margin-top: 30px;">Thank you for choosing Credify!</p>
                    <p style="margin-top: 30px;">Best regards,<br>Credify Team</p>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Loan approval email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending loan approval email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send loan disbursement email
 */
const sendDisbursementEmail = async (user, loan, disbursement) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log('📧 Email notification skipped - credentials not configured');
            return { success: false, skipped: true };
        }
        
        const mailOptions = {
            from: 'Credify Loans <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: '💰 Loan Amount Disbursed - Credify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6C63FF;">💰 Loan Amount Disbursed</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Your loan amount has been successfully disbursed to your bank account.</p>
                    
                    <div style="background-color: #f0f4ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6C63FF;">
                        <h3 style="margin-top: 0; color: #6C63FF;">Disbursement Details:</h3>
                        <p><strong>Loan Reference:</strong> ${loan.loanReferenceNumber}</p>
                        <p><strong>Disbursed Amount:</strong> ₹${loan.amount.toLocaleString()}</p>
                        <p><strong>Disbursement Date:</strong> ${new Date(disbursement?.disbursedAt || Date.now()).toLocaleDateString()}</p>
                        <p><strong>Bank Account:</strong> ${user.bankDetails?.accountNumber ? '****' + user.bankDetails.accountNumber.slice(-4) : 'Your registered account'}</p>
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h3 style="margin-top: 0; color: #856404;">Repayment Reminder:</h3>
                        <p><strong>Total Amount to Repay:</strong> ₹${loan.totalRepayable.toLocaleString()}</p>
                        <p><strong>Due Date:</strong> ${new Date(loan.dueDate).toLocaleDateString()}</p>
                        <p>Please ensure timely repayment to maintain a good credit score.</p>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>Credify Team</p>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Disbursement email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending disbursement email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment reminder email
 */
const sendRepaymentReminderEmail = async (user, loan, daysUntilDue) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log('📧 Email notification skipped - credentials not configured');
            return { success: false, skipped: true };
        }
        
        const urgency = daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'important' : 'reminder';
        const color = daysUntilDue <= 1 ? '#dc3545' : daysUntilDue <= 3 ? '#ffc107' : '#17a2b8';
        
        const mailOptions = {
            from: 'Credify Loans <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: `${urgency === 'urgent' ? '🚨 URGENT: ' : '⏰ '}Loan Repayment ${urgency === 'urgent' ? 'Due' : 'Reminder'} - Credify`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${color};">⏰ Loan Repayment Reminder</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>This is a ${urgency} reminder about your upcoming loan repayment.</p>
                    
                    <div style="background-color: ${urgency === 'urgent' ? '#f8d7da' : '#fff3cd'}; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${color};">
                        <h3 style="margin-top: 0; color: ${color};">Repayment Details:</h3>
                        <p><strong>Loan Reference:</strong> ${loan.loanReferenceNumber}</p>
                        <p><strong>Amount Due:</strong> ₹${loan.totalRepayable.toLocaleString()}</p>
                        <p><strong>Due Date:</strong> ${new Date(loan.dueDate).toLocaleDateString()}</p>
                        <p><strong>Days Until Due:</strong> ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}</p>
                    </div>
                    
                    ${urgency === 'urgent' ? `
                        <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>⚠️ URGENT ACTION REQUIRED</strong>
                            <p>Your payment is due ${daysUntilDue === 0 ? 'today' : 'tomorrow'}! Late payments may result in additional charges.</p>
                        </div>
                    ` : ''}
                    
                    <p><strong>Payment Instructions:</strong></p>
                    <ul>
                        <li>Log in to your Credify account</li>
                        <li>Navigate to the Repayments section</li>
                        <li>Complete the payment using your preferred method</li>
                    </ul>
                    
                    <p>Please make the payment on or before the due date to avoid late fees and maintain your credit score.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>Credify Team</p>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Repayment reminder email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending repayment reminder email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send repayment confirmation email
 */
const sendRepaymentConfirmationEmail = async (user, loan, payment) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log('📧 Email notification skipped - credentials not configured');
            return { success: false, skipped: true };
        }
        
        const mailOptions = {
            from: 'Credify Loans <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: '✅ Payment Received - Credify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">✅ Payment Received Successfully</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Thank you! We have received your loan repayment.</p>
                    
                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="margin-top: 0; color: #28a745;">Payment Details:</h3>
                        <p><strong>Loan Reference:</strong> ${loan.loanReferenceNumber}</p>
                        <p><strong>Payment Amount:</strong> ₹${(payment?.amount || loan.totalRepayable).toLocaleString()}</p>
                        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Loan Status:</strong> ${loan.status}</p>
                    </div>
                    
                    <p>Your loan has been successfully closed. Thank you for your timely repayment!</p>
                    <p>We look forward to serving you again in the future.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>Credify Team</p>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Repayment confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending repayment confirmation email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendLoanApplicationEmail,
    sendLoanApprovalEmail,
    sendDisbursementEmail,
    sendRepaymentReminderEmail,
    sendRepaymentConfirmationEmail
};
