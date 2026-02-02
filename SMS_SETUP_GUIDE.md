# SMS & Push Notification Setup Guide

## Overview
Your Credify backend now sends **BOTH** SMS and Push Notifications:
- **SMS** - Text messages to phone numbers via Twilio
- **Push Notifications** - Firebase Cloud Messaging to mobile apps

## ✅ What's Already Configured

### Backend Features:
- Email notifications via Gmail ✅
- SMS notifications via Twilio (needs setup)
- Push notifications via Firebase FCM (needs mobile app integration)
- Dual notification system that sends both SMS + Push

## 📱 How It Works

When a loan event happens (application, approval, disbursement, etc.):
1. **Email** is sent to user's email address (if configured)
2. **SMS** is sent to user's phone number (if Twilio configured)
3. **Push Notification** is sent to user's mobile device (if FCM token registered)

## 🔧 Twilio SMS Setup (Required for SMS)

### Step 1: Sign Up for Twilio
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your phone number
4. Get **$15 free credit** for testing

### Step 2: Get Your Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. Find these on your dashboard:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
3. Get a phone number:
   - Click "Get a Trial Number" or "Buy a Number"
   - Select a number from your country
   - Note: Trial accounts can only send to verified numbers

### Step 3: Configure Backend
Add to your `.env` file:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Install Twilio Package
```bash
cd backend
npm install twilio
```

### Step 5: Test SMS
The system will now automatically send SMS for:
- Loan applications
- Loan approvals
- Loan disbursements
- Repayment reminders (daily at 9 AM)
- Payment confirmations

## 📊 Notification Matrix

| Event | Email | SMS | Push Notification |
|-------|-------|-----|-------------------|
| Loan Application | ✅ | ✅ | ✅ |
| Loan Approval | ✅ | ✅ | ✅ |
| Loan Disbursement | ✅ | ✅ | ✅ |
| Repayment Reminder | ✅ | ✅ | ✅ |
| Payment Confirmation | ✅ | ✅ | ✅ |

## 🧪 Testing

### Test SMS Only:
```javascript
// In Node.js console or test file
const smsService = require('./utils/smsService');

const testLoan = {
    _id: 'test123',
    loanReferenceNumber: 'LN-TEST-001',
    amount: 50000,
    totalRepayable: 55000,
    dueDate: new Date()
};

// Test loan approval SMS
smsService.sendLoanApprovalSMS('9876543210', testLoan)
    .then(result => console.log('Result:', result));
```

### Expected Behavior:
- **No Twilio**: SMS skipped, logs warning message
- **With Twilio**: SMS sent, logs success with SID
- Push notification always attempts (skipped if no FCM token)

## 💰 Twilio Pricing

### Free Trial:
- $15 credit
- Can only send to **verified numbers**
- Each SMS costs ~$0.0075 (varies by country)

### Paid Account:
- Send to any number
- SMS to India: ~₹0.40 per SMS
- SMS to US: ~$0.0079 per SMS

### India-Specific:
For sending SMS in India, you may need:
1. Register your business
2. Get DLT (Distributed Ledger Technology) approval
3. Register your sender ID and templates

## 🌍 International SMS

The system automatically adds country code:
```javascript
// Input: 9876543210
// Sent to: +919876543210 (India)
```

To change country code, update `smsService.js`:
```javascript
const formattedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `+91${phoneNumber}`; // Change +91 to your country code
```

## 🔔 Firebase Push Notifications

For mobile app integration, see [FCM_SETUP_GUIDE.md](FCM_SETUP_GUIDE.md)

Quick summary:
1. User installs mobile app
2. App gets FCM token from Firebase
3. App sends token to backend: `POST /api/users/register-fcm-token`
4. Backend stores token in database
5. Push notifications sent automatically

## ⚠️ Important Notes

### SMS Limitations:
1. **Trial Account**: Can only send to verified numbers
2. **Rate Limits**: Twilio has sending limits
3. **Character Limits**: SMS limited to 160 characters (longer messages split)
4. **India Regulations**: May require DLT registration for production

### Best Practices:
1. Keep SMS messages concise (under 160 chars)
2. Include reference number for tracking
3. Use proper templates for compliance
4. Monitor Twilio usage and costs
5. Handle opt-outs properly (required by law)

## 🛠️ Troubleshooting

### SMS Not Sending?
1. Check `.env` has correct Twilio credentials
2. Verify phone number format (+91xxxxxxxxxx)
3. Check Twilio Console for error logs
4. Ensure account has sufficient balance
5. For trial accounts, verify recipient's number in Twilio

### Common Errors:
```
Error 21608: Unverified number
Solution: Verify the number in Twilio Console (for trial)

Error 21211: Invalid 'To' Number
Solution: Check phone number format

Error 20003: Authentication Error
Solution: Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
```

### Check Logs:
```bash
# Backend logs show SMS status
✅ SMS sent to 9876543210: SMxxxxxxxxxxxxxxx
⚠️  Twilio not configured. SMS will be skipped.
❌ Error sending SMS to 9876543210: [error message]
```

## 📝 Sample Notification Messages

### Loan Application:
**SMS**: "Dear Customer, your loan application (Ref: LN-2024-001) for ₹50,000 has been received and is under review. - Credify"

### Loan Approval:
**SMS**: "Congratulations! Your loan of ₹50,000 (Ref: LN-2024-001) has been APPROVED. Amount will be disbursed within 24-48 hours. - Credify"

### Payment Reminder:
**SMS**: "URGENT: Your loan repayment of ₹55,000 (Ref: LN-2024-001) is DUE TODAY. Please pay immediately to avoid late fees. - Credify"

## 🔐 Security

1. **Never commit** `.env` file with real credentials
2. Keep Twilio Auth Token secret
3. Use environment variables for all sensitive data
4. Rotate credentials periodically
5. Monitor for unusual activity in Twilio Console

## 🎯 Next Steps

1. ✅ Backend configured (done)
2. ⏳ Sign up for Twilio account
3. ⏳ Get Twilio credentials
4. ⏳ Add credentials to `.env`
5. ⏳ Install twilio package: `npm install twilio`
6. ⏳ Test SMS sending
7. ⏳ Set up mobile app for push notifications (optional)

## 📚 Resources

- [Twilio Console](https://console.twilio.com/)
- [Twilio SMS API Docs](https://www.twilio.com/docs/sms)
- [Twilio Pricing](https://www.twilio.com/sms/pricing)
- [Firebase FCM Setup](FCM_SETUP_GUIDE.md)
- [Twilio India DLT Guide](https://www.twilio.com/docs/sms/regulatory/a2p-10dlc)
