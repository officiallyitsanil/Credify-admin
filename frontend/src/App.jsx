import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Loans from './pages/Loans';
import Repayments from './pages/Repayments';
import KYC from './pages/KYC';
import CreditLimit from './pages/CreditLimit';
import Disbursement from './pages/Disbursement';
import InterestFees from './pages/InterestFees';
import Notifications from './pages/Notifications';
import Collections from './pages/Collections';
import RiskManagement from './pages/RiskManagement';
import Support from './pages/Support';
import CMS from './pages/CMS';
import Settings from './pages/Settings';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  console.log('ProtectedRoute check - authenticated:', authenticated);
  return authenticated ? children : <Navigate to="/login" replace />;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Layout>
                <Loans />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/repayments"
          element={
            <ProtectedRoute>
              <Layout>
                <Repayments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc"
          element={
            <ProtectedRoute>
              <Layout>
                <KYC />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/credit-limit"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditLimit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/disbursement"
          element={
            <ProtectedRoute>
              <Layout>
                <Disbursement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interest-fees"
          element={
            <ProtectedRoute>
              <Layout>
                <InterestFees />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <Layout>
                <Collections />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-management"
          element={
            <ProtectedRoute>
              <Layout>
                <RiskManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Layout>
                <Support />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms"
          element={
            <ProtectedRoute>
              <Layout>
                <CMS />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

