# Firebase Cloud Messaging (FCM) Setup Guide

## Overview
Your Credify backend is now configured to send push notifications to mobile devices using Firebase Cloud Messaging instead of traditional SMS.

## ✅ Backend Setup (Complete)

The backend is already configured with:
- Firebase Admin SDK initialized
- FCM notification service in `backend/utils/smsService.js`
- `fcmToken` field added to User model
- API endpoint to register FCM tokens: `POST /api/users/register-fcm-token`

## 📱 Mobile App Integration Required

To receive notifications, your mobile app needs to:

### 1. Add Firebase to Your Mobile App

**For React Native:**
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

**For Flutter:**
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
```

**For Native Android:**
Add to `build.gradle`:
```gradle
implementation 'com.google.firebase:firebase-messaging:23.3.1'
```

### 2. Request Permission & Get FCM Token

**React Native Example:**
```javascript
import messaging from '@react-native-firebase/messaging';

// Request permission (iOS)
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

// Get FCM token
async function getFCMToken() {
  const fcmToken = await messaging().getToken();
  console.log('FCM Token:', fcmToken);
  return fcmToken;
}
```

### 3. Register FCM Token with Backend

After user login, send the FCM token to the backend:

```javascript
// After successful login
const fcmToken = await getFCMToken();

// Register token with backend
await fetch('http://your-backend-url/api/users/register-fcm-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}` // JWT token from login
  },
  body: JSON.stringify({ fcmToken })
});
```

### 4. Handle Incoming Notifications

**Foreground Messages:**
```javascript
messaging().onMessage(async remoteMessage => {
  console.log('Notification received in foreground:', remoteMessage);
  // Show notification to user
  Alert.alert(
    remoteMessage.notification.title,
    remoteMessage.notification.body
  );
});
```

**Background Messages:**
```javascript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in background:', remoteMessage);
});
```

## 🔔 Notification Types

Your app will receive these notification types:

| Type | Title | When Sent |
|------|-------|-----------|
| `LOAN_APPLICATION` | 📋 Loan Application Received | After loan application submitted |
| `LOAN_APPROVAL` | 🎉 Loan Approved! | When admin approves loan |
| `LOAN_DISBURSEMENT` | 💰 Loan Disbursed | When loan amount is disbursed |
| `REPAYMENT_REMINDER` | ⏰ Payment Reminder | 7, 3, 1 day(s) before due date |
| `REPAYMENT_CONFIRMATION` | ✅ Payment Received | After successful repayment |

## 📊 Notification Data Payload

Each notification includes data you can use to navigate users:

```javascript
{
  type: 'LOAN_APPROVAL',
  loanId: '60d5ec49f1b2c72b8c8e4f1a',
  loanReferenceNumber: 'LN-2024-001',
  amount: '50000',
  // Additional fields based on notification type
}
```

## 🔧 Testing Notifications

### Test from Backend Console:
```javascript
// You can test FCM directly
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'Test Notification',
    body: 'This is a test from backend'
  },
  token: 'USER_FCM_TOKEN_HERE'
};

admin.messaging().send(message)
  .then(response => console.log('Success:', response))
  .catch(error => console.log('Error:', error));
```

## ⚠️ Important Notes

1. **Token Management**: 
   - FCM tokens can expire or become invalid
   - App should refresh token periodically
   - Backend automatically removes invalid tokens

2. **iOS Setup**:
   - Requires APNs certificate
   - Add capabilities in Xcode (Push Notifications)
   - Request permission from user

3. **Android Setup**:
   - Add `google-services.json` to your app
   - Add Firebase configuration to `build.gradle`

4. **Notification Channels (Android 8+)**:
   ```javascript
   import { PushNotificationIOS, Platform } from 'react-native';
   
   if (Platform.OS === 'android') {
     // Create notification channel
     await notifee.createChannel({
       id: 'loan-updates',
       name: 'Loan Updates',
       importance: AndroidImportance.HIGH,
     });
   }
   ```

## 📝 Sample Mobile App Code

### Complete Setup Example (React Native):

```javascript
// firebase.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setupFCM = async () => {
  // Request permission
  const authStatus = await messaging().requestPermission();
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;

  if (!enabled) {
    console.log('FCM permission denied');
    return;
  }

  // Get token
  const fcmToken = await messaging().getToken();
  console.log('FCM Token:', fcmToken);

  // Save token
  await AsyncStorage.setItem('fcmToken', fcmToken);

  // Handle token refresh
  messaging().onTokenRefresh(async newToken => {
    console.log('New FCM token:', newToken);
    await AsyncStorage.setItem('fcmToken', newToken);
    await registerTokenWithBackend(newToken);
  });

  return fcmToken;
};

export const registerTokenWithBackend = async (fcmToken) => {
  const userToken = await AsyncStorage.getItem('userToken');
  
  try {
    const response = await fetch('http://localhost:5003/api/users/register-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ fcmToken })
    });
    
    const data = await response.json();
    console.log('FCM token registered:', data);
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Setup notification handlers
export const setupNotificationHandlers = () => {
  // Foreground
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);
    // Show local notification or alert
  });

  // Background/Quit
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);
  });

  // Notification opened app
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    // Navigate to relevant screen based on data.type
  });

  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
      }
    });
};
```

### Usage in App.js:

```javascript
import { setupFCM, setupNotificationHandlers, registerTokenWithBackend } from './firebase';

useEffect(() => {
  // Setup FCM on app start
  setupFCM().then(fcmToken => {
    if (fcmToken) {
      registerTokenWithBackend(fcmToken);
    }
  });

  // Setup handlers
  setupNotificationHandlers();
}, []);
```

## 🎯 Next Steps

1. ✅ Backend is ready (already done)
2. ⏳ Add Firebase to your mobile app
3. ⏳ Request notification permissions
4. ⏳ Get and register FCM token with backend
5. ⏳ Test receiving notifications

## 🆘 Troubleshooting

### Not receiving notifications?
1. Check if FCM token is registered in database
2. Verify Firebase Admin SDK is initialized correctly
3. Check mobile app has notification permissions
4. Test with Firebase Console first
5. Check backend logs for FCM errors

### Common Errors:
- `messaging/invalid-registration-token`: Token expired, app should refresh
- `messaging/registration-token-not-registered`: Token not valid, remove and get new one
- No permission: User denied notification permission in app settings

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Flutter Firebase Messaging](https://firebase.flutter.dev/docs/messaging/overview)
- [Firebase Console](https://console.firebase.google.com/)
