const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
// and set the path in environment variables
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Alternative: Use default credentials or environment variables
    // For production, set GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp();
}

module.exports = admin;
