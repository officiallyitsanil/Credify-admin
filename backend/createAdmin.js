const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ MongoDB Connected');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ phoneNumber: '+918500216667' });

        if (existingAdmin) {
            console.log('ℹ️  Admin already exists:', existingAdmin);
            process.exit(0);
        }

        // Create new admin
        // Note: firebaseUid will be updated when user logs in with Firebase
        const admin = await Admin.create({
            name: 'Admin User',
            phoneNumber: '+918500216667',
            firebaseUid: 'temp-uid-' + Date.now(), // Temporary UID, will be replaced on first login
            role: 'super_admin'
        });

        console.log('✅ Admin created successfully:', admin);
        console.log('\nYou can now login with phone number: +918500216667');
        console.log('Note: The firebaseUid will be updated automatically on first Firebase login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
