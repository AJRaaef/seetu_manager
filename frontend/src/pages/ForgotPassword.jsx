import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '../api/authApi';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setMessage('Password reset instructions have been logged/sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <div className="row justify-content-center align-items-center">
        <div className="col-12 col-md-6 col-lg-5 col-xl-4">
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-body p-4 p-md-5">
              {/* Brand Header matching exact logo colors */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.4px' }}>
                  <span className="brand-seettu">Seettu</span>
                  <span className="brand-manager">Manager</span>
                </h2>
                <p className="text-muted small mb-2" style={{ fontSize: '0.85rem' }}>
                  Digital Financial Discipline for Seettu Group
                </p>
                <h4 className="fw-bold text-dark mt-3 mb-0" style={{ color: '#1A3644' }}>Forgot Password</h4>
              </div>

              {message && <div className="alert alert-success border-0 small rounded-3 p-3 mb-3">{message}</div>}
              {error && <div className="alert alert-danger border-0 small rounded-3 p-3 mb-3">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required
                  />
                </div>

                <button 
                  disabled={loading} 
                  type="submit" 
                  className="btn btn-teal w-100 fw-bold py-2 mb-3 shadow-sm"
                  style={{ backgroundColor: '#235665', borderRadius: '8px', color: '#FFFFFF' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="text-center small">
                  <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#235665' }}>
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
