# Loan Application Portal

## Overview
A separate public-facing portal for users to apply for loans, which can be tracked and managed from the admin panel.

## Features

### 🌐 Public Loan Application Portal
- **Route**: `/apply-loan` (No authentication required)
- **Features**:
  - User-friendly loan application form
  - Real-time interest calculation
  - Loan amount validation
  - Multiple tenure options (7, 15, 30, 45, 60 days)
  - Terms and conditions acceptance
  - Automatic loan reference number generation
  - Success confirmation with reference number

### 📊 Admin Loan Tracking Panel
- **Route**: `/loans` (Authentication required)
- **Features**:
  - Dashboard with loan statistics
  - Filter by loan status
  - Approve/Reject applications
  - View all loan details
  - Direct link to public application portal
  - Real-time application tracking

## Technical Implementation

### Backend API Endpoints

#### 1. Apply for Loan (Public)
```
POST /api/loan-application/apply
```
**Request Body**:
```json
{
  "phoneNumber": "9876543210",
  "fullName": "John Doe",
  "email": "john@example.com",
  "amount": 10000,
  "tenureDays": 30,
  "loanPurpose": "Personal",
  "termsAccepted": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Loan application submitted successfully!",
  "data": {
    "loanReferenceNumber": "LN1738229000123",
    "amount": 10000,
    "tenureDays": 30,
    "interestAmount": "205.48",
    "totalRepayable": "10205.48",
    "status": "REQUESTED",
    "dueDate": "2026-02-28T..."
  }
}
```

#### 2. Check Application Status (Public)
```
GET /api/loan-application/status/:phoneNumber
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "loanReferenceNumber": "LN1738229000123",
      "amount": 10000,
      "status": "REQUESTED",
      "requestedAt": "2026-01-29T...",
      "totalRepayable": 10205.48
    }
  ]
}
```

#### 3. Get Loan Settings (Public)
```
GET /api/loan-application/settings
```

**Response**:
```json
{
  "success": true,
  "data": {
    "minLoanAmount": 1000,
    "maxLoanAmount": 50000,
    "interestRate": 2.5,
    "availableTenures": [7, 15, 30, 45, 60],
    "interestCalculationMethod": "SIMPLE",
    "interestBasis": "DAILY"
  }
}
```

### Frontend Components

#### 1. LoanApplication.jsx
- **Location**: `frontend/src/pages/LoanApplication.jsx`
- **Purpose**: Public-facing loan application form
- **Features**:
  - Dynamic interest calculation
  - Form validation
  - Success confirmation screen
  - Responsive design

#### 2. Loans.jsx (Enhanced)
- **Location**: `frontend/src/pages/Loans.jsx`
- **Purpose**: Admin panel for tracking applications
- **Features**:
  - Statistics cards (Total, Pending, Approved, Disbursed, Rejected)
  - Filter by status
  - Approve/Reject actions
  - Link to public portal

### Styling
- **LoanApplication.css**: Beautiful gradient design with responsive layout
- **Loans.css**: Enhanced with statistics cards and improved filtering

## Workflow

### User Journey
1. User visits `/apply-loan`
2. Fills out the application form
3. Reviews calculated interest and total repayable amount
4. Submits application
5. Receives loan reference number
6. Application status: `REQUESTED`

### Admin Journey
1. Admin logs into the panel
2. Navigates to "Loans" section (`/loans`)
3. Views all pending applications in statistics cards
4. Filters applications by status
5. Reviews application details
6. Approves or Rejects application with reason
7. Application status updates to `APPROVED` or `REJECTED`

## Validation Rules

### Phone Number
- Must be 10 digits
- Required field

### Full Name
- Minimum 2 characters
- Required field

### Loan Amount
- Must be between configured min and max amounts
- Default: ₹1,000 - ₹50,000
- Required field

### Tenure
- Must be one of: 7, 15, 30, 45, or 60 days
- Required field

### Terms Acceptance
- Must be checked
- Required field

## Interest Calculation

### Simple Interest (Default)
```
Interest = (Principal × Rate × Days) / (100 × 365)
Total Repayable = Principal + Interest
```

### Example
- Principal: ₹10,000
- Rate: 2.5% per annum
- Tenure: 30 days
- Interest: (10000 × 2.5 × 30) / (100 × 365) = ₹205.48
- Total Repayable: ₹10,205.48

## Loan Status Flow

```
REQUESTED → APPROVED → DISBURSED → REPAID
    ↓
REJECTED
```

## Security Features

1. **Public Routes**: No authentication required for loan applications
2. **Protected Routes**: Admin panel requires authentication
3. **Input Validation**: Server-side validation for all inputs
4. **User Blocking**: Blocked users cannot apply for loans
5. **Duplicate Prevention**: Users with pending loans cannot apply again

## Database Schema

### Loan Model
```javascript
{
  phoneNumber: String,
  amount: Number,
  tenureDays: Number,
  interestRate: Number,
  interestAmount: Number,
  totalRepayable: Number,
  loanReferenceNumber: String (unique),
  loanPurpose: String,
  termsAccepted: Boolean,
  status: String (REQUESTED, APPROVED, DISBURSED, REPAID, REJECTED),
  requestedAt: Date,
  approvedAt: Date,
  rejectionReason: String
}
```

### User Model (Auto-created)
```javascript
{
  phoneNumber: String (unique),
  fullName: String,
  email: String,
  kycStatus: String (default: PENDING),
  creditLimit: Number (default: 0),
  isBlocked: Boolean (default: false)
}
```

## Usage Instructions

### For Users

1. **Apply for a Loan**:
   - Visit: `http://localhost:5173/apply-loan` (dev) or your production URL
   - Fill in all required fields
   - Review the loan summary
   - Accept terms and conditions
   - Submit application
   - Save the reference number

2. **Check Application Status**:
   - Currently requires admin to check
   - Future enhancement: Public status check page

### For Admins

1. **Access the Admin Panel**:
   - Login at `/login`
   - Navigate to "Loans" section

2. **Review Applications**:
   - View statistics at the top
   - Filter by status (Pending, Approved, etc.)
   - Click on applications for details

3. **Process Applications**:
   - Click "Approve" for approval
   - Click "Reject" and provide reason for rejection

4. **Share Application Portal**:
   - Click "Open Application Portal" button
   - Share the link with users

## Testing

### Test Case 1: Submit Loan Application
```bash
curl -X POST http://localhost:5003/api/loan-application/apply \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "fullName": "Test User",
    "email": "test@example.com",
    "amount": 10000,
    "tenureDays": 30,
    "loanPurpose": "Personal",
    "termsAccepted": true
  }'
```

### Test Case 2: Check Status
```bash
curl http://localhost:5003/api/loan-application/status/9876543210
```

### Test Case 3: Get Settings
```bash
curl http://localhost:5003/api/loan-application/settings
```

## Future Enhancements

1. **Public Status Check Page**: Allow users to check their application status
2. **Email Notifications**: Send email on application submission/approval
3. **SMS Notifications**: Send SMS updates
4. **Document Upload**: Allow users to upload KYC documents
5. **Credit Score Check**: Integrate credit score verification
6. **Automated Approval**: Auto-approve based on criteria
7. **Loan Calculator**: Standalone calculator page
8. **Application Analytics**: Track conversion rates and metrics

## Troubleshooting

### Issue: Application not appearing in admin panel
- **Solution**: Check if the backend server is running
- **Solution**: Verify MongoDB connection
- **Solution**: Check browser console for errors

### Issue: Interest calculation incorrect
- **Solution**: Verify loan settings in database
- **Solution**: Check LoanSettings model configuration

### Issue: Cannot approve/reject loans
- **Solution**: Ensure admin is authenticated
- **Solution**: Check loan status (only REQUESTED loans can be approved)

## Configuration

### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5003
```

### Loan Settings
Update in database or via Settings API:
- `minLoanAmount`: Minimum loan amount (default: 1000)
- `maxLoanAmount`: Maximum loan amount (default: 50000)
- `interestRate`: Annual interest rate percentage (default: 2.5)
- `interestCalculationMethod`: SIMPLE or COMPOUND
- `interestBasis`: DAILY, MONTHLY, or YEARLY

## Deployment

### Frontend
- Build: `npm run build` in frontend directory
- Deploy to Vercel/Netlify
- Update API_URL in `frontend/src/utils/api.js`

### Backend
- Deploy to Render/Heroku
- Set environment variables
- Update CORS settings for your frontend domain

## Support

For issues or questions:
- Email: support@credify.com
- Phone: 1800-XXX-XXXX

---

**Created**: January 29, 2026
**Version**: 1.0.0
**Author**: Credify Development Team
