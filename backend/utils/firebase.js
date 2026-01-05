const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For production deployment (Render), use environment variables
// For local development, use service account file

let serviceAccount;

console.log('🔍 Checking Firebase credentials...');
console.log('FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
console.log('FIREBASE_SERVICE_ACCOUNT_PATH exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse service account from environment variable (for Render)
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Parsed FIREBASE_SERVICE_ACCOUNT from env');
        console.log('Project ID:', serviceAccount.project_id);
    } catch (error) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', error.message);
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Use service account file (for local development)
    try {
        serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        console.log('✅ Loaded service account from file');
        console.log('Project ID:', serviceAccount.project_id);
    } catch (error) {
        console.error('❌ Error loading service account file:', error.message);
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
} else {
    console.error('❌ Firebase Admin SDK not initialized - missing credentials');
    console.log('Please set FIREBASE_SERVICE_ACCOUNT environment variable on Render');
    console.log('See RENDER_FIREBASE_SETUP.md for instructions');
}

module.exports = admin;
