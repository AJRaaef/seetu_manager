import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import * as authApi from '../api/authApi';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
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
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Language Switcher Pill */}
        <div className="d-flex justify-content-end mb-3">
          <div className="btn-group btn-group-sm p-0.5 rounded-pill border bg-light shadow-none">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${language === 'en' ? 'btn-primary text-white fw-bold' : 'btn-light text-secondary'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${language === 'si' ? 'btn-primary text-white fw-bold' : 'btn-light text-secondary'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => changeLanguage('si')}
            >
              සිංහල
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${language === 'ta' ? 'btn-primary text-white fw-bold' : 'btn-light text-secondary'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => changeLanguage('ta')}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Brand Header matching Login page */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="SeettuManager Logo" style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <h2 className="auth-title mt-1">
          <span className="brand-seettu">Seettu</span>
          <span className="brand-manager">Manager</span>
        </h2>
        <p className="auth-subtitle">{t('auth.login_subtitle', 'Digital Financial Discipline for Seettu Group')}</p>
        <h4 className="fw-bold text-dark mt-3 mb-2" style={{ color: '#1A3644', fontSize: '1.2rem' }}>
          {t('auth.forgot_title', 'Reset Your Password')}
        </h4>

        {message && <div className="alert alert-success border-0 small rounded-3 p-3 mb-3">{message}</div>}
        {error && <div className="alert alert-danger border-0 small rounded-3 p-3 mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-start">
            <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>
              {t('auth.email_label', 'Email Address')}
            </label>
            <input
              type="email"
              className="form-control"
              placeholder={t('auth.email_placeholder', 'Enter your registered email')}
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
            {loading ? t('auth.sending', 'Sending...') : t('auth.reset_btn', 'Send Reset Link')}
          </button>

          <div className="text-center small">
            <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#235665' }}>
              ← {t('auth.back_to_login', 'Back to Login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
