const mongoose = require('mongoose');
const User = require('./models/User');
const CreditLimit = require('./models/CreditLimit');
require('dotenv').config();

const backfillCreditLimits = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get all users
        const users = await User.find({});
        console.log(`\n📊 Found ${users.length} users in the database\n`);

        let updated = 0;
        let created = 0;
        let skipped = 0;

        for (const user of users) {
            console.log(`Processing user: ${user.phoneNumber} (${user.fullName || 'No name'})`);

            // Set default credit limit if not set
            if (!user.creditLimit || user.creditLimit === 0) {
                user.creditLimit = 50000;
                await user.save();
                console.log(`  ✅ Updated User creditLimit to ₹50,000`);
                updated++;
            } else {
                console.log(`  ℹ️  User already has creditLimit: ₹${user.creditLimit}`);
            }

            // Check if CreditLimit entry exists
            let creditLimitEntry = await CreditLimit.findOne({ userId: user._id });

            if (!creditLimitEntry) {
                // Create CreditLimit entry
                creditLimitEntry = new CreditLimit({
                    userId: user._id,
                    totalLimit: user.creditLimit,
                    availableLimit: user.creditLimit,
                    utilizedLimit: 0,
                    blockedLimit: 0,
                    riskCategory: 'medium',
                    limitType: 'provisional'
                });
                await creditLimitEntry.save();
                console.log(`  ✅ Created CreditLimit entry`);
                created++;
            } else {
                // Update existing entry to match user's credit limit
                if (creditLimitEntry.totalLimit !== user.creditLimit) {
                    const difference = user.creditLimit - creditLimitEntry.totalLimit;
                    creditLimitEntry.totalLimit = user.creditLimit;
                    creditLimitEntry.availableLimit += difference;
                    await creditLimitEntry.save();
                    console.log(`  ✅ Updated CreditLimit entry to match User creditLimit`);
                    updated++;
                } else {
                    console.log(`  ℹ️  CreditLimit entry already exists and is up to date`);
                    skipped++;
                }
            }

            console.log('');
        }

        console.log('\n📈 Summary:');
        console.log(`   Total Users: ${users.length}`);
        console.log(`   User creditLimit Updated: ${updated}`);
        console.log(`   CreditLimit Entries Created: ${created}`);
        console.log(`   Skipped (already up to date): ${skipped}`);
        console.log('\n✅ Backfill completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during backfill:', error);
        process.exit(1);
    }
};

backfillCreditLimits();
