# Database Seeding Guide

## Overview
This guide will help you populate your database with sample data for testing the admin panel.

## Prerequisites
- MongoDB installed and running
- Node.js installed
- Backend dependencies installed (`npm install` in backend folder)

## Database Schema

### Users Collection
- Phone number-based authentication
- KYC status (PENDING, VERIFIED, REJECTED)
- Credit limit and used credit
- CIBIL score tracking
- Bank account details
- Address information

### Loans Collection
- Loan amount and tenure (7, 15, 30, 45, 60 days)
- Interest rate and calculation
- Status tracking (REQUESTED, APPROVED, DISBURSED, REPAID, OVERDUE, REJECTED, etc.)
- Payment gateway integration (Razorpay/Cashfree)
- Late fees and charges

### Transactions Collection
- Payment tracking
- Gateway integration
- Transaction types (DISBURSEMENT, REPAYMENT, LATE_FEE, etc.)

### Repayment Schedules Collection
- Installment tracking
- Due dates and amounts
- Payment status

## Seeding the Database

### Step 1: Configure Database Connection
Make sure your `.env` file in the backend folder has the correct MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/credify
```

### Step 2: Run the Seed Script

```bash
cd backend
npm run seed-db
```

This will:
1. Clear existing data from all collections
2. Create 5 sample users with different KYC statuses
3. Create 5 sample loans with various statuses
4. Create related transactions and repayments

### Step 3: Verify the Data

The script will output a summary showing:
- Number of users created
- Number of loans created
- Number of transactions created
- Number of repayments created
- Sample user credentials for testing

## Sample Data Created

### Users (5 total)

1. **Rajesh Kumar** - `+919876543210`
   - KYC: VERIFIED
   - Credit Limit: ₹50,000
   - Used Credit: ₹15,000
   - CIBIL Score: 750

2. **Priya Sharma** - `+919876543211`
   - KYC: VERIFIED
   - Credit Limit: ₹75,000
   - Used Credit: ₹25,000
   - CIBIL Score: 780

3. **Amit Patel** - `+919876543212`
   - KYC: PENDING
   - Credit Limit: ₹30,000
   - Used Credit: ₹0
   - CIBIL Score: 680

4. **Sneha Reddy** - `+919876543213`
   - KYC: REJECTED
   - Credit Limit: ₹0
   - Rejection Reason: Document quality not sufficient

5. **Vikram Singh** - `+919876543214`
   - KYC: VERIFIED
   - Credit Limit: ₹100,000
   - Used Credit: ₹60,000
   - CIBIL Score: 720

### Loans (5 total)

1. **Active Loan** - Rajesh Kumar
   - Amount: ₹15,000
   - Status: DISBURSED
   - Due Date: Jan 21, 2026

2. **Completed Loan** - Priya Sharma
   - Amount: ₹25,000
   - Status: REPAID
   - Repaid: Dec 15, 2025

3. **Pending Request** - Amit Patel
   - Amount: ₹10,000
   - Status: REQUESTED
   - Waiting for approval

4. **Overdue Loan** - Vikram Singh
   - Amount: ₹50,000
   - Status: OVERDUE
   - Days Overdue: 31
   - Late Fee: ₹500

5. **Approved Loan** - Vikram Singh
   - Amount: ₹10,000
   - Status: APPROVED
   - Pending disbursement

## Testing the Admin Panel

### 1. View Users
Navigate to `/users` in the admin panel to see all seeded users with their KYC status, credit limits, and account details.

### 2. View Loans
Navigate to `/loans` to see loan requests with different statuses:
- Filter by status (REQUESTED, APPROVED, DISBURSED, REPAID, OVERDUE)
- View loan details, amounts, and repayment info

### 3. View Repayments
Navigate to `/repayments` to see payment history and pending payments.

### 4. Test User Management
- Update credit limits
- Change KYC status (Verify/Reject)
- Block/Unblock users

### 5. Test Loan Management
- Approve pending loans
- Reject loan requests
- View loan details and history

## API Endpoints

### Users
- `GET /api/users` - Get all users (supports pagination, search, filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/credit-limit` - Update credit limit
- `PUT /api/users/:id/kyc-status` - Update KYC status
- `PUT /api/users/:id/block` - Block/Unblock user

### Loans
- `GET /api/loans` - Get all loans (supports pagination, status filter)
- `GET /api/loans/:id` - Get loan by ID
- `PUT /api/loans/:id/approve` - Approve loan
- `PUT /api/loans/:id/reject` - Reject loan
- `PUT /api/loans/:id/disburse` - Mark as disbursed

### Repayments
- `GET /api/repayments` - Get all repayments
- `GET /api/repayments/loan/:loanId` - Get repayments for a loan
- `POST /api/repayments` - Record a repayment

## Re-seeding the Database

To clear and re-seed the database at any time:

```bash
cd backend
npm run seed-db
```

**Warning:** This will delete all existing data!

## Customizing Sample Data

To modify the sample data, edit `/backend/seedDatabase.js`:

1. **Add more users**: Add objects to the `sampleUsers` array
2. **Modify loan scenarios**: Edit the `createSampleLoans` function
3. **Add transactions**: Update the `createSampleTransactions` function

After making changes, run `npm run seed-db` again.

## Troubleshooting

### Database Connection Error
- Ensure MongoDB is running: `sudo service mongod start` (Linux) or check MongoDB Compass
- Verify MONGODB_URI in `.env` file

### Schema Validation Error
- Make sure all required fields are present in sample data
- Check enum values match schema definitions

### Duplicate Key Error
- Run the seed script again (it clears data before inserting)
- Check for duplicate phone numbers or loan reference numbers

## Next Steps

1. Run the seed script to populate your database
2. Start the backend server: `npm start`
3. Start the frontend: `cd frontend && npm run dev`
4. Login to admin panel and explore the seeded data
5. Test all CRUD operations
6. Modify seed data as needed for your testing scenarios

## Notes

- All phone numbers start with +91 (India)
- Loan reference numbers are auto-generated
- Dates are set relative to current date for realistic testing
- CIBIL scores range from 680-780 (realistic values)
- Credit limits vary from ₹30,000 to ₹100,000

---

For questions or issues, check the backend logs or MongoDB console for detailed error messages.
