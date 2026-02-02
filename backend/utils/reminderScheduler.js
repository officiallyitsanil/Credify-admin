const cron = require('node-cron');
const Loan = require('../models/Loan');
const { notifyRepaymentReminder } = require('./notificationService');

/**
 * Schedule daily repayment reminder checks
 * Runs every day at 9:00 AM
 */
const scheduleRepaymentReminders = () => {
    // Run at 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
        console.log('Running repayment reminder job...');
        
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Find all active loans
            const activeLoans = await Loan.find({
                status: { $in: ['APPROVED', 'DISBURSED'] }
            });

            for (const loan of activeLoans) {
                const dueDate = new Date(loan.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                // Calculate days until due
                const diffTime = dueDate.getTime() - today.getTime();
                const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Send reminders at 7 days, 3 days, 1 day, and on due date
                if (daysUntilDue === 7 || daysUntilDue === 3 || daysUntilDue === 1 || daysUntilDue === 0) {
                    console.log(`Sending reminder for loan ${loan.loanReferenceNumber}, ${daysUntilDue} days until due`);
                    
                    await notifyRepaymentReminder(loan.phoneNumber, loan, daysUntilDue);
                }
            }

            console.log('Repayment reminder job completed');
        } catch (error) {
            console.error('Error in repayment reminder job:', error);
        }
    });

    console.log('Repayment reminder scheduler initialized - will run daily at 9:00 AM');
};

/**
 * Send immediate repayment reminder for a specific loan
 */
const sendImmediateReminder = async (loanId) => {
    try {
        const loan = await Loan.findById(loanId);
        
        if (!loan) {
            throw new Error('Loan not found');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueDate = new Date(loan.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        await notifyRepaymentReminder(loan.phoneNumber, loan, daysUntilDue);
        
        return { success: true, message: 'Reminder sent successfully' };
    } catch (error) {
        console.error('Error sending immediate reminder:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    scheduleRepaymentReminders,
    sendImmediateReminder
};
