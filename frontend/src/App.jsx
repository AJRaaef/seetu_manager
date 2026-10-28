import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import MyGroups from './pages/MyGroups';
import Members from './pages/Members';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import PaymentTracking from './pages/PaymentTracking';
import AdvancePayments from './pages/AdvancePayments';
import Profile from './pages/Profile';
import Disputes from './pages/Disputes';
import EmergencyRequests from './pages/EmergencyRequests';
import PaymentAuditTrail from './pages/PaymentAuditTrail';
import Reports from './pages/Reports';
import Certificates from './pages/Certificates';
import Notifications from './pages/Notifications';
import MemberVerification from './pages/MemberVerification';
import VerificationManagement from './pages/VerificationManagement';
import ChitLaw from './pages/ChitLaw';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LegalPage from './pages/LegalPage';
import ContactPage from './pages/ContactPage';
import AdminOrganizerRequests from './pages/AdminOrganizerRequests';
import MonthlyRotationPage from './pages/MonthlyRotationPage';

// Components
import AppLayout from './components/AppLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted">Authenticating JWT session...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem', color: '#0097B2' }}>
          <span className="visually-hidden">Loading SeettuManager...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/law" element={<ChitLaw />} />
      <Route path="/seettu-law" element={<ChitLaw />} />
      <Route path="/chit-law" element={<ChitLaw />} />
      <Route path="/rules" element={<LegalPage defaultTab="rules" />} />
      <Route path="/member-enrollment-rules" element={<LegalPage defaultTab="rules" />} />
      <Route path="/complaints" element={<LegalPage defaultTab="complaints" />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<LegalPage defaultTab="terms" />} />
      <Route path="/terms-and-conditions" element={<LegalPage defaultTab="terms" />} />
      <Route path="/cancellation" element={<LegalPage defaultTab="cancellation" />} />
      <Route path="/cancellation-policy" element={<LegalPage defaultTab="cancellation" />} />
      <Route path="/refund" element={<LegalPage defaultTab="refund" />} />
      <Route path="/refund-policy" element={<LegalPage defaultTab="refund" />} />
      <Route path="/disclaimer" element={<LegalPage defaultTab="disclaimer" />} />
      <Route path="/policies/:policyKey" element={<LegalPage />} />

      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
      />

      {/* Protected Dashboard & App Routes */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><AppLayout><MyGroups /></AppLayout></ProtectedRoute>} />
      <Route path="/groups/create" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><AppLayout><CreateGroup /></AppLayout></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><AppLayout><GroupDetail /></AppLayout></ProtectedRoute>} />
      
      <Route path="/members" element={<ProtectedRoute><AppLayout><Members /></AppLayout></ProtectedRoute>} />
      
      <Route path="/payments" element={<ProtectedRoute><AppLayout><PaymentTracking /></AppLayout></ProtectedRoute>} />
      <Route path="/advance-payments" element={<ProtectedRoute><AppLayout><AdvancePayments /></AppLayout></ProtectedRoute>} />
      <Route path="/audit-trail" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><PaymentAuditTrail /></AppLayout></ProtectedRoute>} />
      
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/disputes" element={<ProtectedRoute><AppLayout><Disputes /></AppLayout></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><AppLayout><EmergencyRequests /></AppLayout></ProtectedRoute>} />
      
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><AppLayout><Certificates /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><AppLayout><MemberVerification /></AppLayout></ProtectedRoute>} />
      <Route path="/verifications/manage" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><AppLayout><VerificationManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizer-requests" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminOrganizerRequests /></AppLayout></ProtectedRoute>} />
      <Route path="/rotation/:cycleId" element={<ProtectedRoute><AppLayout><MonthlyRotationPage /></AppLayout></ProtectedRoute>} />

      {/* Default Catch-all redirects to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <MainLayout />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
