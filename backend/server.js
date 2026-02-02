const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    // Initialize repayment reminder scheduler after DB connection
    const { scheduleRepaymentReminders } = require('./utils/reminderScheduler');
    scheduleRepaymentReminders();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/loan-application', require('./routes/loanApplication')); // Public loan application route
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/credit-limit', require('./routes/creditLimit'));
app.use('/api/disbursement', require('./routes/disbursement'));
app.use('/api/interest-fees', require('./routes/interestFees'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/collection', require('./routes/collection'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/support', require('./routes/support'));
app.use('/api/cms', require('./routes/cms'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Credify API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
