import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import LegalPoliciesModal from '../components/LegalPoliciesModal';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER',
    preferredLanguage: 'EN',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('rules');

  const openLegal = (tab = 'rules') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Agreement Required: Please review and accept the Member Enrollment Agreement, Seettu Rules, and Privacy Policy before creating your account.');
      return;
    }

    if (formData.fullName.trim().length < 3) {
      setError(' Full Name Guidance: Please enter your complete name (at least 3 characters).');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError(' Email Guidance: Please provide a valid email address (e.g. user@example.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password Guidance: Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(' Password Mismatch: The Password and Confirm Password fields do not match. Please verify both inputs.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Registration failed. The email address or phone number may already be registered.');
      setError(`Registration Error Guidance: ${guidance}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-body p-4 p-md-5">
              {/* Brand Header matching exact logo colors */}
              <div className="text-center mb-4">
                <div className="mb-2">
                  <img src="/logo.png" alt="SeettuManager Logo" style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.85rem', letterSpacing: '-0.4px' }}>
                  <span className="brand-seettu">Seettu</span>
                  <span className="brand-manager">Manager</span>
                </h2>
                <p className="text-muted small mb-1" style={{ fontSize: '0.875rem' }}>
                  Digital Financial Discipline for Seettu Group
                </p>
                <p className="text-muted small mb-4" style={{ fontSize: '0.8rem' }}>
                  Create your account to start managing or joining Seettu groups
                </p>
                <h3 className="fw-bold text-center" style={{ color: '#1A3644', fontSize: '1.35rem' }}>Register</h3>
              </div>

              {error && (
                <div className="alert alert-danger border-0 shadow-sm p-3 mb-4 rounded-3">
                  <div className="fw-bold">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g.  077 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Account Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="MEMBER">Member (Participate & Join Groups)</option>
                    </select>
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.74rem' }}>
                      * To create & organize Seettu groups, members submit their NIC and Grama Niladhari certificate for Admin verification.
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>preferred_language</label>
                    <select
                      className="form-select"
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="EN">English</option>
                      <option value="SI">Sinhala</option>
                      <option value="TA">Tamil</option>
                    </select>
                  </div>
                </div>

                {/* Member Enrollment Rules & Privacy Agreement Notice */}
                <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#F8FAFC' }}>
                  <div className="form-check d-flex align-items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreeTermsCheck"
                      className="form-check-input mt-1"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#0097B2' }}
                    />
                    <label htmlFor="agreeTermsCheck" className="form-check-label small text-secondary" style={{ cursor: 'pointer', lineHeight: '1.5', fontSize: '0.82rem' }}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => openLegal('rules')}
                        className="btn btn-link p-0 text-decoration-underline fw-bold small align-baseline"
                        style={{ color: '#0097B2', fontSize: '0.82rem' }}
                      >
                        Member Enrollment Agreement
                      </button>
                      {', '}
                      <button
                        type="button"
                        onClick={() => openLegal('chit-law')}
                        className="btn btn-link p-0 text-decoration-underline fw-bold small align-baseline"
                        style={{ color: '#0097B2', fontSize: '0.82rem' }}
                      >
                        Seettu Law & Governance
                      </button>
                      {', and '}
                      <button
                        type="button"
                        onClick={() => openLegal('privacy')}
                        className="btn btn-link p-0 text-decoration-underline fw-bold small align-baseline"
                        style={{ color: '#0097B2', fontSize: '0.82rem' }}
                      >
                        Privacy Policy
                      </button>
                      . I understand my mutual obligation to maintain punctual contributions throughout all rotation cycles.
                    </label>
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  type="submit" 
                  className="btn btn-teal w-100 fw-bold py-2 mb-4 shadow-sm"
                  style={{ backgroundColor: '#235665', borderRadius: '8px', fontSize: '1rem', color: '#FFFFFF' }}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>

                <div className="text-center text-muted small">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#235665' }}>
                    Sign In Here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Compliance Policies Modal */}
      <LegalPoliciesModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        onAccept={() => setAgreedToRules(true)}
        initialTab={legalModalTab} 
      />
    </div>
  );
};

export default Register;
