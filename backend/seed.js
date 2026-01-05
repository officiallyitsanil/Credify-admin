const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');
const User = require('./models/User');
const Loan = require('./models/Loan');

// Sample data
const adminData = {
    name: 'Admin User',
    email: 'admin@credify.com',
    password: 'admin123',
    role: 'super_admin'
};

const usersData = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91 98765 43210',
        address: {
            street: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
        },
        dateOfBirth: new Date('1985-05-15'),
        kycStatus: 'verified',
        creditLimit: 500000,
        accountStatus: 'active'
    },
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43211',
        address: {
            street: '456 Park Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
        },
        dateOfBirth: new Date('1990-08-22'),
        kycStatus: 'pending',
        creditLimit: 0,
        accountStatus: 'active'
    },
    {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 98765 43212',
        address: {
            street: '789 Ring Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zipCode: '380001',
            country: 'India'
        },
        dateOfBirth: new Date('1988-03-10'),
        kycStatus: 'verified',
        creditLimit: 300000,
        accountStatus: 'active'
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '+91 98765 43213',
        address: {
            street: '321 Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500034',
            country: 'India'
        },
        dateOfBirth: new Date('1992-11-05'),
        kycStatus: 'rejected',
        kycRejectionReason: 'Documents not clear',
        creditLimit: 0,
        accountStatus: 'active'
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43214',
        address: {
            street: '654 Civil Lines',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110054',
            country: 'India'
        },
        dateOfBirth: new Date('1987-07-18'),
        kycStatus: 'verified',
        creditLimit: 750000,
        accountStatus: 'active'
    },
    {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        phone: '+91 98765 43215',
        address: {
            street: '987 Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600040',
            country: 'India'
        },
        dateOfBirth: new Date('1991-02-28'),
        kycStatus: 'pending',
        creditLimit: 0,
        accountStatus: 'active'
    },
    {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '+91 98765 43216',
        address: {
            street: '147 Hazratganj',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            zipCode: '226001',
            country: 'India'
        },
        dateOfBirth: new Date('1989-09-12'),
        kycStatus: 'verified',
        creditLimit: 400000,
        accountStatus: 'blocked',
        blockReason: 'Multiple payment defaults'
    },
    {
        name: 'Kavya Nair',
        email: 'kavya.nair@example.com',
        phone: '+91 98765 43217',
        address: {
            street: '258 Marine Drive',
            city: 'Kochi',
            state: 'Kerala',
            zipCode: '682011',
            country: 'India'
        },
        dateOfBirth: new Date('1993-04-20'),
        kycStatus: 'verified',
        creditLimit: 250000,
        accountStatus: 'active'
    },
    {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '+91 98765 43218',
        address: {
            street: '369 Koregaon Park',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001',
            country: 'India'
        },
        dateOfBirth: new Date('1986-12-08'),
        kycStatus: 'pending',
        creditLimit: 0,
        accountStatus: 'active'
    },
    {
        name: 'Divya Gupta',
        email: 'divya.gupta@example.com',
        phone: '+91 98765 43219',
        address: {
            street: '741 Sector 17',
            city: 'Chandigarh',
            state: 'Chandigarh',
            zipCode: '160017',
            country: 'India'
        },
        dateOfBirth: new Date('1994-06-14'),
        kycStatus: 'verified',
        creditLimit: 350000,
        accountStatus: 'active'
    },
    {
        name: 'Karthik Rao',
        email: 'karthik.rao@example.com',
        phone: '+91 98765 43220',
        address: {
            street: '852 Whitefield',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560066',
            country: 'India'
        },
        dateOfBirth: new Date('1990-01-25'),
        kycStatus: 'verified',
        creditLimit: 600000,
        accountStatus: 'active'
    },
    {
        name: 'Meera Joshi',
        email: 'meera.joshi@example.com',
        phone: '+91 98765 43221',
        address: {
            street: '963 Juhu Beach',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400049',
            country: 'India'
        },
        dateOfBirth: new Date('1988-10-30'),
        kycStatus: 'pending',
        creditLimit: 0,
        accountStatus: 'active'
    },
    {
        name: 'Sanjay Desai',
        email: 'sanjay.desai@example.com',
        phone: '+91 98765 43222',
        address: {
            street: '159 Satellite',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zipCode: '380015',
            country: 'India'
        },
        dateOfBirth: new Date('1987-03-17'),
        kycStatus: 'verified',
        creditLimit: 450000,
        accountStatus: 'active'
    },
    {
        name: 'Pooja Kapoor',
        email: 'pooja.kapoor@example.com',
        phone: '+91 98765 43223',
        address: {
            street: '357 Connaught Place',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
        },
        dateOfBirth: new Date('1991-08-09'),
        kycStatus: 'verified',
        creditLimit: 550000,
        accountStatus: 'active'
    },
    {
        name: 'Aditya Malhotra',
        email: 'aditya.malhotra@example.com',
        phone: '+91 98765 43224',
        address: {
            street: '753 Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560038',
            country: 'India'
        },
        dateOfBirth: new Date('1989-05-23'),
        kycStatus: 'rejected',
        kycRejectionReason: 'Invalid address proof',
        creditLimit: 0,
        accountStatus: 'active'
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB Connected');

        // Clear existing data
        await Admin.deleteMany({});
        await User.deleteMany({});
        await Loan.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin
        const admin = await Admin.create(adminData);
        console.log('✅ Admin created:', admin.email);

        // Create users
        const users = await User.insertMany(usersData);
        console.log(`✅ Created ${users.length} users`);

        // Create sample loan requests
        const loansData = [
            {
                user: users[0]._id, // Rajesh Kumar (verified)
                amount: 200000,
                interestRate: 12,
                tenure: 24,
                purpose: 'Home renovation',
                status: 'approved',
                approvedBy: admin._id,
                approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                disbursedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                user: users[2]._id, // Amit Patel (verified)
                amount: 150000,
                interestRate: 11.5,
                tenure: 18,
                purpose: 'Business expansion',
                status: 'pending'
            },
            {
                user: users[4]._id, // Vikram Singh (verified)
                amount: 500000,
                interestRate: 13,
                tenure: 36,
                purpose: 'Vehicle purchase',
                status: 'approved',
                approvedBy: admin._id,
                approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                disbursedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
                user: users[7]._id, // Kavya Nair (verified)
                amount: 100000,
                interestRate: 10.5,
                tenure: 12,
                purpose: 'Education',
                status: 'pending'
            },
            {
                user: users[10]._id, // Karthik Rao (verified)
                amount: 300000,
                interestRate: 12.5,
                tenure: 24,
                purpose: 'Medical emergency',
                status: 'rejected',
                rejectedBy: admin._id,
                rejectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                rejectionReason: 'Insufficient credit history'
            },
            {
                user: users[12]._id, // Sanjay Desai (verified)
                amount: 250000,
                interestRate: 11,
                tenure: 30,
                purpose: 'Debt consolidation',
                status: 'pending'
            },
            {
                user: users[13]._id, // Pooja Kapoor (verified)
                amount: 400000,
                interestRate: 12,
                tenure: 36,
                purpose: 'Home purchase',
                status: 'approved',
                approvedBy: admin._id,
                approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                disbursedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                user: users[1]._id, // Priya Sharma (pending KYC)
                amount: 180000,
                interestRate: 12,
                tenure: 24,
                purpose: 'Wedding expenses',
                status: 'pending'
            },
            {
                user: users[5]._id, // Ananya Iyer (pending KYC)
                amount: 120000,
                interestRate: 11,
                tenure: 18,
                purpose: 'Travel',
                status: 'pending'
            },
            {
                user: users[8]._id, // Arjun Mehta (pending KYC)
                amount: 220000,
                interestRate: 12.5,
                tenure: 24,
                purpose: 'Business startup',
                status: 'pending'
            }
        ];

        const loans = await Loan.insertMany(loansData);
        console.log(`✅ Created ${loans.length} loan requests`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Admin: ${admin.email} / admin123`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Verified Users: ${users.filter(u => u.kycStatus === 'verified').length}`);
        console.log(`   - Pending KYC: ${users.filter(u => u.kycStatus === 'pending').length}`);
        console.log(`   - Rejected KYC: ${users.filter(u => u.kycStatus === 'rejected').length}`);
        console.log(`   - Loan Requests: ${loans.length}`);
        console.log(`   - Pending Loans: ${loans.filter(l => l.status === 'pending').length}`);
        console.log(`   - Approved Loans: ${loans.filter(l => l.status === 'approved').length}`);
        console.log(`   - Rejected Loans: ${loans.filter(l => l.status === 'rejected').length}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
