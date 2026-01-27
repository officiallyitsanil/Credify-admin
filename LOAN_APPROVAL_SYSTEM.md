# Loan Approval System Documentation

## Overview

The Credify loan approval system implements an intelligent, automated risk-based approval process that evaluates loan applications against multiple criteria and automatically approves, rejects, or flags them for manual review.

## Approval Flow

```
User Applies for Loan
        ↓
Loan Created (Status: REQUESTED)
        ↓
Auto-Process Endpoint Called
        ↓
Risk Assessment Performed
        ↓
    ┌───────────────┐
    │ Risk Category │
    └───────┬───────┘
            │
    ┌───────┴────────┬──────────┐
    ↓                ↓          ↓
  LOW            MEDIUM       HIGH
    ↓                ↓          ↓
Auto-Approve  Manual Review  Auto-Reject
```

## Approval Criteria

### 1. **KYC Verification** (Required)
- ✅ PAN card uploaded and verified
- ✅ Aadhaar card uploaded and verified
- ✅ Selfie uploaded and verified
- Status must be: `verified`

### 2. **Age Requirements** (Configurable)
- Default: 18-30 years
- Configurable via LoanSettings
- Must have valid `dateOfBirth` in user profile

### 3. **Mobile Number**
- Must be valid Indian mobile number
- Format: 10 digits starting with 6-9
- Regex: `^[6-9][0-9]{9}$`

### 4. **Bank Account**
- Must have bank details added
- Account must be verified
- Required fields: accountNumber, ifscCode, accountHolderName

### 5. **Blacklist/Fraud Check** (Critical)
- `isBlocked` must be `false`
- `fraudFlag` must be `false`
- Any flag results in automatic rejection

### 6. **Credit Score** (Optional)
- If available and minimum threshold set, must meet requirement
- Excellent: 750+ (Risk reduction)
- Good: 700-749 (Low risk)
- Fair: 600-699 (Medium risk)
- Poor: <600 (High risk)

### 7. **Repayment History**
- Existing users: Evaluated based on past loan performance
- Overdue loans increase risk score
- Successfully repaid loans reduce risk score
- New users: Slight risk increase as first-time borrowers

### 8. **Device & Behavioral Checks**
- `multipleAccountsFlag`: Multiple accounts from same device
- `suspiciousActivityFlag`: Unusual behavioral patterns
- Both increase risk score

## Risk Scoring System

### Risk Score Calculation (0-100)

| Factor | Points | Details |
|--------|--------|---------|
| **KYC Issues** | 0-20 | Not verified (20), High KYC risk score (0-20) |
| **Age** | 0-15 | Under 18 (15), >30 (10), 18-21 (5), 22-30 (0) |
| **Bank Verification** | 0-15 | Not verified (15), Verified (0) |
| **Mobile Number** | 0-10 | Invalid (10), Valid (0) |
| **Blacklist/Fraud** | 0-30 | Blocked/Fraud flag (30 each) |
| **Credit Score** | 0-20 | <600 (20), 600-699 (10), 700-749 (5), 750+ (0) |
| **Repayment History** | 0-20 | Overdue loans (+10 each), Good history (-10) |
| **Device/Behavior** | 0-15 | Multiple accounts (10), Suspicious (15) |
| **Credit Utilization** | 0-10 | >90% (10), >75% (5), <75% (0) |
| **First Time Borrower** | 0-5 | New user (5), Existing (0) |

### Risk Categories

- **LOW RISK** (0-29): Auto-approve eligible
- **MEDIUM RISK** (30-59): Manual review required
- **HIGH RISK** (60-100): Auto-reject

## API Endpoints

### 1. Auto-Process Loan Application

Automatically evaluates a loan application and makes an approval decision.

**Endpoint:** `POST /api/loans/:id/auto-process`

**Request:**
```json
// No body required - processes based on loan ID
```

**Response (Low Risk - Auto Approved):**
```json
{
  "success": true,
  "data": {
    "loan": {
      "_id": "loan_id",
      "status": "APPROVED",
      "riskScore": 25,
      "riskCategory": "LOW",
      "riskFactors": [
        "First time borrower",
        "No credit score available"
      ],
      "approvalMethod": "AUTO",
      "autoApprovalEligible": true
    },
    "decision": {
      "action": "AUTO_APPROVE",
      "status": "APPROVED",
      "message": "Loan auto-approved based on low risk profile",
      "riskAssessment": {
        "riskScore": 25,
        "riskCategory": "LOW",
        "riskFactors": [...]
      }
    }
  },
  "message": "Loan auto-approved based on low risk profile"
}
```

**Response (Medium Risk - Manual Review):**
```json
{
  "success": true,
  "data": {
    "loan": {
      "_id": "loan_id",
      "status": "UNDER_REVIEW",
      "riskScore": 45,
      "riskCategory": "MEDIUM",
      "manualReviewRequired": true,
      "manualReviewReason": "Loan requires manual review due to medium risk factors"
    },
    "decision": {
      "action": "MANUAL_REVIEW",
      "status": "UNDER_REVIEW",
      "message": "Loan requires manual review due to medium risk factors"
    }
  }
}
```

**Response (High Risk - Auto Rejected):**
```json
{
  "success": true,
  "data": {
    "loan": {
      "_id": "loan_id",
      "status": "REJECTED",
      "riskScore": 75,
      "riskCategory": "HIGH",
      "rejectionReason": "Loan auto-rejected due to high risk (Score: 75)"
    },
    "decision": {
      "action": "AUTO_REJECT",
      "status": "REJECTED",
      "message": "Loan auto-rejected due to high risk (Score: 75)"
    }
  }
}
```

### 2. Manual Approval (Admin)

**Endpoint:** `PUT /api/loans/:id/approve`

**Request:**
```json
{
  // No additional body required
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "loan_id",
    "status": "APPROVED",
    "approvalMethod": "MANUAL",
    "reviewedBy": "admin_id",
    "reviewedAt": "2026-01-22T10:30:00Z"
  },
  "message": "Loan approved successfully"
}
```

### 3. Manual Rejection (Admin)

**Endpoint:** `PUT /api/loans/:id/reject`

**Request:**
```json
{
  "rejectionReason": "Insufficient income proof"
}
```

### 4. Get Manual Review Queue

**Endpoint:** `GET /api/loans/manual-review/pending`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "loan_id",
      "phoneNumber": "9876543210",
      "amount": 25000,
      "status": "UNDER_REVIEW",
      "riskScore": 45,
      "riskCategory": "MEDIUM",
      "riskFactors": ["Fair credit score: 680", "First time borrower"],
      "manualReviewRequired": true,
      "requestedAt": "2026-01-22T10:00:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 47
}
```

## Loan Settings Configuration

### Get Loan Settings

**Endpoint:** `GET /api/settings/loan`

**Response:**
```json
{
  "success": true,
  "data": {
    "minAge": 18,
    "maxAge": 30,
    "minCreditScore": 0,
    "idealCreditScore": 750,
    "lowRiskThreshold": 30,
    "mediumRiskThreshold": 60,
    "autoApprovalEnabled": true,
    "autoRejectEnabled": true,
    "maxAutoApprovalAmount": 50000,
    "minLoanAmount": 1000,
    "maxLoanAmount": 100000,
    "allowedTenures": [7, 15, 30, 45, 60],
    "enableDeviceCheck": true,
    "enableBehaviorAnalysis": true,
    "maxAccountsPerDevice": 1,
    "requirePAN": true,
    "requireAadhaar": true,
    "requireSelfie": true,
    "requireBankVerification": true,
    "blockBlacklistedUsers": true,
    "maxCreditUtilization": 90,
    "isActive": true
  }
}
```

### Update Loan Settings

**Endpoint:** `PUT /api/settings/loan`

**Request:**
```json
{
  "minAge": 21,
  "maxAge": 35,
  "lowRiskThreshold": 25,
  "mediumRiskThreshold": 55,
  "maxAutoApprovalAmount": 75000,
  "minCreditScore": 650
}
```

### Reset to Defaults

**Endpoint:** `POST /api/settings/loan/reset`

## Database Schema Updates

### User Model - New Fields

```javascript
{
  // Existing fields...
  
  // Fraud & Security
  fraudFlag: Boolean,
  fraudFlagReason: String,
  fraudFlaggedAt: Date,
  multipleAccountsFlag: Boolean,
  suspiciousActivityFlag: Boolean,
  deviceFingerprint: String,
  
  // Blocking
  blockedAt: Date,
  blockReason: String
}
```

### Loan Model - New Fields

```javascript
{
  // Existing fields...
  
  status: {
    // Added 'UNDER_REVIEW' to existing statuses
    enum: ['REQUESTED', 'APPROVED', 'DISBURSED', 'REPAID', 
           'OVERDUE', 'REJECTED', 'CANCELLED', 'PREPAID', 
           'FORECLOSED', 'UNDER_REVIEW']
  },
  
  // Risk Assessment
  riskScore: Number (0-100),
  riskCategory: String (LOW/MEDIUM/HIGH),
  riskFactors: [String],
  
  // Approval Tracking
  approvalMethod: String (AUTO/MANUAL/HYBRID),
  autoApprovalEligible: Boolean,
  manualReviewRequired: Boolean,
  manualReviewReason: String,
  reviewedBy: ObjectId (Admin),
  reviewedAt: Date
}
```

## Implementation Workflow

### For User Loan Application (Frontend → Backend)

1. **User submits loan application** → Creates Loan document with status `REQUESTED`

2. **Immediately call auto-process**:
   ```javascript
   // After creating loan
   const response = await fetch(`/api/loans/${loanId}/auto-process`, {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

3. **Handle response**:
   - `AUTO_APPROVE`: Show success, loan approved
   - `MANUAL_REVIEW`: Show "under review" message
   - `AUTO_REJECT`: Show rejection with reason

### For Admin Panel

1. **Monitor Manual Review Queue**:
   ```javascript
   GET /api/loans/manual-review/pending
   ```

2. **Review loan details including risk assessment**:
   ```javascript
   GET /api/loans/:id
   ```

3. **Take action**:
   ```javascript
   // Approve
   PUT /api/loans/:id/approve
   
   // Reject
   PUT /api/loans/:id/reject
   {
     "rejectionReason": "Reason here"
   }
   ```

## Configuration Best Practices

### Conservative Settings (Lower Approval Rate)
```javascript
{
  minAge: 21,
  maxAge: 28,
  lowRiskThreshold: 20,
  mediumRiskThreshold: 40,
  minCreditScore: 700,
  maxAutoApprovalAmount: 25000
}
```

### Liberal Settings (Higher Approval Rate)
```javascript
{
  minAge: 18,
  maxAge: 35,
  lowRiskThreshold: 40,
  mediumRiskThreshold: 70,
  minCreditScore: 0,
  maxAutoApprovalAmount: 100000
}
```

## Testing Scenarios

### Test Case 1: Perfect Applicant (Should Auto-Approve)
- ✅ KYC verified (PAN + Aadhaar + Selfie)
- ✅ Age: 25
- ✅ Valid mobile: 9876543210
- ✅ Bank account verified
- ✅ No fraud flags
- ✅ Credit score: 780
- ✅ No previous loans
- **Expected: AUTO_APPROVE, Risk Score: ~5-15**

### Test Case 2: Medium Risk (Should Go to Manual Review)
- ✅ KYC verified
- ✅ Age: 19
- ✅ Valid mobile
- ✅ Bank verified
- ✅ No fraud flags
- ⚠️ Credit score: 680
- ⚠️ First time borrower
- **Expected: MANUAL_REVIEW, Risk Score: ~30-50**

### Test Case 3: High Risk (Should Auto-Reject)
- ❌ KYC not verified
- ❌ Age: 17
- ✅ Valid mobile
- ❌ Bank not verified
- ❌ Previous overdue loans
- **Expected: AUTO_REJECT, Risk Score: ~60+**

### Test Case 4: Blacklisted (Immediate Rejection)
- ✅ KYC verified
- ❌ isBlocked: true
- **Expected: AUTO_REJECT immediately**

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

Common error codes:
- `404`: Loan/User not found
- `400`: Invalid request/Business logic error
- `500`: Server error

## Monitoring & Analytics

Track these metrics:
1. Auto-approval rate
2. Auto-rejection rate
3. Manual review queue size
4. Average risk score by category
5. Most common risk factors
6. Time to approval/rejection

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Audit Trail**: All decisions logged in `loanHistory`
3. **Fraud Prevention**: Multiple layers of fraud detection
4. **Data Privacy**: Sensitive data properly secured
5. **Rate Limiting**: Consider implementing for auto-process endpoint

## Future Enhancements

1. ML-based risk scoring
2. External credit bureau integration
3. Real-time fraud detection
4. Automated document verification
5. A/B testing for approval thresholds
6. Predictive analytics for default probability
