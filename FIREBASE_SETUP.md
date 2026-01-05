# Firebase Phone Authentication Setup Guide

## Firebase Configuration

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication → Phone sign-in method

### 2. Frontend Configuration

Update `/frontend/src/utils/firebase.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

You can find these credentials in:
- Firebase Console → Project Settings → General → Your apps → Web app

### 3. Backend Configuration

#### Download Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (e.g., `firebase-service-account.json`)

#### Set Environment Variables

Add to your `.env` file in the backend directory:

```env
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# OR use Google Application Credentials (recommended for production)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json
```

### 4. Firebase Console Settings

#### Add Authorized Domains
1. Go to Authentication → Settings → Authorized domains
2. Add your domains (e.g., `localhost`, `yourdomain.com`)

#### Configure reCAPTCHA (Optional)
- reCAPTCHA is automatically used for phone authentication
- For testing, you can add test phone numbers in Firebase Console:
  - Authentication → Sign-in method → Phone → Phone numbers for testing

### 5. Testing

#### Add Test Phone Numbers (Optional)
For development testing without sending real SMS:

1. Firebase Console → Authentication → Sign-in method → Phone
2. Scroll to "Phone numbers for testing"
3. Add test numbers with verification codes:
   - Phone: `+1 555-555-5555`
   - Code: `123456`

### 6. Migration Notes

#### Changes Made:
- ✅ Removed email/password authentication
- ✅ Added Firebase phone number authentication
- ✅ Updated Admin model to use `phoneNumber` and `firebaseUid` instead of `email` and `password`
- ✅ Backend now verifies Firebase ID tokens instead of JWT
- ✅ Frontend uses Firebase Auth SDK for phone authentication
- ✅ Auto-registration of admins on first login

#### Important Files Modified:
- `frontend/src/pages/Login.jsx` - Phone OTP login UI
- `frontend/src/utils/firebase.js` - Firebase configuration
- `frontend/src/utils/auth.js` - Authentication utilities
- `backend/models/Admin.js` - Admin schema updated
- `backend/middleware/auth.js` - Firebase token verification
- `backend/routes/admin.js` - Verify endpoint for Firebase auth
- `backend/utils/firebase.js` - Firebase Admin SDK initialization

### 7. Usage

1. User enters phone number with country code (e.g., `+911234567890`)
2. Firebase sends OTP via SMS
3. User enters OTP to verify
4. Backend receives Firebase ID token
5. Backend verifies token and creates/retrieves admin record
6. User is authenticated and redirected to dashboard

### 8. Security Considerations

- Store Firebase service account key securely
- Never commit service account keys to version control
- Add `firebase-service-account.json` to `.gitignore`
- Use environment variables for sensitive data
- Enable App Check for additional security (optional)
- Set up proper Firebase security rules

### 9. Production Deployment

For production:
1. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
2. Ensure Firebase service account has proper permissions
3. Configure allowed domains in Firebase Console
4. Enable Firebase App Check for additional security
5. Monitor authentication logs in Firebase Console

## Troubleshooting

### reCAPTCHA not visible
- Check if domain is authorized in Firebase Console
- Ensure browser allows third-party cookies

### SMS not received
- Check phone number format (must include country code)
- Verify Firebase project billing is enabled
- Check Firebase quota limits

### Token verification fails
- Ensure Firebase Admin SDK is properly initialized
- Verify service account key is correct
- Check that ID token hasn't expired (default: 1 hour)
