# Notification System Setup Guide

This guide explains how to configure and use the email and SMS notification system for Credify.

## Features

The notification system sends automated notifications for:
1. **Loan Application** - Confirmation when user applies for a loan
2. **Loan Approval** - Congratulations message when loan is approved
3. **Loan Disbursement** - Notification when loan amount is transferred
4. **Repayment Reminders** - Automated reminders at 7, 3, 1 days before due date and on due date
5. **Repayment Confirmation** - Receipt when payment is received

## Email Notifications (Gmail via Nodemailer)

### Setup Steps

1. **Enable 2-Step Verification in Gmail**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Credify Backend" as the name
   - Copy the generated 16-character password

3. **Configure Environment Variables**
   ```bash
   # In your .env file
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Email Templates

All email templates are located in `/backend/utils/emailService.js` and include:
- Professional HTML formatting
- Loan details and amounts
- Status updates
- Call-to-action buttons
- Branding elements

## SMS Notifications (Firebase)

### Current Implementation

The SMS service (`/backend/utils/smsService.js`) is currently set up as a simulation layer. For production, you can integrate with:

### Option 1: Twilio (Recommended)

1. **Sign up for Twilio**
   - Go to [Twilio](https://www.twilio.com)
   - Create an account and get your credentials

2. **Install Twilio SDK**
   ```bash
   npm install twilio
   ```

3. **Configure in .env**
   ```bash
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Update smsService.js**
   ```javascript
   const client = require('twilio')(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   await client.messages.create({
     body: message,
     to: `+91${phoneNumber}`,
     from: process.env.TWILIO_PHONE_NUMBER
   });
   ```

### Option 2: AWS SNS

1. Install AWS SDK
2. Configure AWS credentials
3. Use SNS to send SMS

### Option 3: Firebase Cloud Messaging

1. Use Firebase Admin SDK (already installed)
2. Set up FCM for mobile app notifications
3. Send push notifications instead of SMS

## Automated Repayment Reminders

The system uses `node-cron` to automatically send repayment reminders daily at 9:00 AM.

### Schedule Configuration

Located in `/backend/utils/reminderScheduler.js`:

```javascript
cron.schedule('0 9 * * *', async () => {
  // Sends reminders at 7, 3, 1 days before and on due date
});
```

### Customizing Schedule

You can modify the cron pattern:
- `'0 9 * * *'` - 9:00 AM daily
- `'0 */6 * * *'` - Every 6 hours
- `'0 9,15 * * *'` - 9:00 AM and 3:00 PM daily

## Testing Notifications

### Test Email Notification

```javascript
// In your test file or route
const { sendLoanApplicationEmail } = require('./utils/emailService');

const testUser = {
  fullName: 'John Doe',
  email: 'test@example.com'
};

const testLoan = {
  loanReferenceNumber: 'LN1234567890',
  amount: 50000,
  tenureDays: 30,
  interestRate: 2.5,
  totalRepayable: 51250,
  dueDate: new Date(),
  status: 'REQUESTED'
};

await sendLoanApplicationEmail(testUser, testLoan);
```

### Test SMS Notification

```javascript
const { sendLoanApprovalSMS } = require('./utils/smsService');

await sendLoanApprovalSMS('9876543210', testLoan);
```

## Notification Flow

### 1. Loan Application
```
User applies → Loan created → notifyLoanApplication() → Email + SMS sent
```

### 2. Loan Approval
```
Admin approves → Loan status updated → notifyLoanApproval() → Email + SMS sent
```

### 3. Disbursement
```
Admin disburses → Status: completed → notifyLoanDisbursement() → Email + SMS sent
```

### 4. Repayment Reminders
```
Cron job runs daily → Checks due dates → Sends reminders for loans due in 7,3,1 days
```

## Troubleshooting

### Email not sending

1. **Check Gmail settings**
   - Verify 2-step verification is enabled
   - Verify app password is correct
   - Check if less secure app access is needed (not recommended)

2. **Check environment variables**
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

3. **Check logs**
   ```bash
   # Backend logs will show email sending status
   "Loan application email sent: <messageId>"
   ```

### SMS not working

1. Currently SMS is simulated - check console logs
2. For production, integrate actual SMS service (Twilio, AWS SNS, etc.)
3. Verify phone number format (should be 10 digits without +91)

## Production Considerations

1. **Email Rate Limits**
   - Gmail has sending limits (500 emails/day for free accounts)
   - Consider using SendGrid, AWS SES, or Mailgun for production

2. **SMS Costs**
   - SMS services charge per message
   - Implement rate limiting to prevent abuse
   - Consider batching notifications

3. **Error Handling**
   - Notifications are sent asynchronously (won't block main flow)
   - Failures are logged but don't stop loan processing
   - Consider implementing retry logic for failed notifications

4. **User Preferences**
   - Add user settings to opt-in/opt-out of notifications
   - Allow users to choose notification channels

5. **Monitoring**
   - Track notification delivery rates
   - Monitor bounce rates and failures
   - Set up alerts for notification service downtime

## API Endpoints for Manual Notifications

You can also trigger notifications manually:

```javascript
// Send immediate repayment reminder
const { sendImmediateReminder } = require('./utils/reminderScheduler');
await sendImmediateReminder(loanId);
```

## Files Modified

- `/backend/utils/emailService.js` - Email notification templates
- `/backend/utils/smsService.js` - SMS notification service
- `/backend/utils/notificationService.js` - Unified notification interface
- `/backend/utils/reminderScheduler.js` - Automated reminder scheduler
- `/backend/routes/loanApplication.js` - Added notification on application
- `/backend/routes/loans.js` - Added notification on approval
- `/backend/routes/disbursement.js` - Added notification on disbursement
- `/backend/server.js` - Initialize reminder scheduler
- `/backend/.env.example` - Email configuration template

## Support

For issues or questions about the notification system, check:
1. Console logs in backend
2. Gmail account activity
3. Twilio/SMS service dashboard (if configured)
