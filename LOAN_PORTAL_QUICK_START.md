# Quick Start Guide - Loan Application Portal

## 🚀 Getting Started

### Step 1: Start the Backend Server
```bash
cd backend
npm install  # if not already installed
npm start
```
Server will run on: `http://localhost:5003`

### Step 2: Start the Frontend Development Server
```bash
cd frontend
npm install  # if not already installed
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Step 3: Access the Application

#### For Users (Public Portal)
- **URL**: `http://localhost:5173/apply-loan`
- **No login required**
- Fill the form and submit your loan application

#### For Admins (Admin Panel)
1. **Login**: `http://localhost:5173/login`
2. **Navigate to Loans**: Click "Loans" in the sidebar
3. **Track Applications**: View, approve, or reject applications

## 📝 Quick Test Flow

### As a User:
1. Open `http://localhost:5173/apply-loan`
2. Fill in the form:
   - Phone: 9876543210
   - Full Name: John Doe
   - Email: john@example.com
   - Amount: 10000
   - Tenure: 30 days
   - Loan Purpose: Personal loan
   - ✓ Accept terms
3. Click "Submit Application"
4. **Save the reference number** shown on success screen

### As an Admin:
1. Login to admin panel (`/login`)
2. Navigate to "Loans" section
3. You'll see the new application in "Pending" status
4. Click "Approve" or "Reject" to process it

## 🎯 Key Features

### Public Portal Features:
✅ Simple application form  
✅ Real-time interest calculation  
✅ Instant loan reference number  
✅ Mobile-responsive design  
✅ No login required  

### Admin Panel Features:
✅ Dashboard with statistics  
✅ Filter by status (Pending, Approved, Rejected, etc.)  
✅ One-click approve/reject  
✅ View all application details  
✅ Link to share public portal  

## 📊 Loan Application Status Flow

```
User Applies → REQUESTED
     ↓
Admin Reviews
     ↓
[APPROVED] ──or──> [REJECTED]
     ↓
  DISBURSED
     ↓
   REPAID
```

## 🔧 Common Commands

### Backend
```bash
# Start server
npm start

# Run with nodemon (auto-reload)
npm run dev

# Create admin user
node createAdmin.js

# Seed database
node seedDatabase.js
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 API Endpoints (Public)

All public endpoints are accessible without authentication:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/loan-application/apply` | POST | Submit loan application |
| `/api/loan-application/status/:phoneNumber` | GET | Check application status |
| `/api/loan-application/settings` | GET | Get loan configuration |

## 📱 Share the Portal

### Development URL:
```
http://localhost:5173/apply-loan
```

### Production URL (after deployment):
```
https://your-domain.com/apply-loan
```

You can share this link with users to let them apply for loans!

## ⚙️ Configuration

### Loan Settings (Default):
- **Min Amount**: ₹1,000
- **Max Amount**: ₹50,000
- **Interest Rate**: 2.5% per annum
- **Tenures**: 7, 15, 30, 45, 60 days
- **Calculation**: Simple interest, daily basis

To change these settings, update the `LoanSettings` collection in MongoDB or use the Settings API.

## 🎨 Customization

### Update Interest Rate:
Edit in database `LoanSettings` collection or create via Settings API.

### Update Portal Branding:
Edit `frontend/src/pages/LoanApplication.jsx` and `LoanApplication.css`

### Update Contact Information:
Edit the "Need Help?" section in `LoanApplication.jsx`

## 📞 Support

**For Technical Issues:**
- Check browser console for errors
- Check backend terminal for API errors
- Ensure MongoDB is connected

**For Questions:**
- Email: support@credify.com
- Phone: 1800-XXX-XXXX

## ✨ What's Next?

After basic setup, you can:
1. 📧 Add email notifications
2. 📱 Add SMS alerts
3. 🔍 Create public status checker
4. 📄 Add document upload
5. 🤖 Implement auto-approval rules

---

**Happy Lending! 🎉**
