import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.fullName.trim().length < 3) {
      setError('⚠️ Full Name Guidance: Please enter your complete name (at least 3 characters).');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('⚠️ Email Guidance: Please provide a valid email address (e.g. user@example.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('⚠️ Password Guidance: Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('⚠️ Password Mismatch: The Password and Confirm Password fields do not match. Please verify both inputs.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Registration failed. The email address or phone number may already be registered.');
      setError(`⚠️ Registration Error Guidance: ${guidance}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <h3 className="fw-bold mb-1">{t('app_name') || 'Seettu Manager System'}</h3>
              <p className="mb-0 text-white-50 small">Create your account to start managing or joining Seettu groups</p>
            </div>

            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold text-dark mb-4 text-center">{t('register') || 'Create New Account'}</h4>

              {error && (
                <div className="alert alert-danger border-0 shadow-sm p-3 mb-4">
                  <div className="fw-bold">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t('full_name') || 'Full Name'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('email') || 'Email Address'}</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('phone') || 'Phone Number'}</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +94 77 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('password') || 'Password (Min 6 chars)'}</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('confirm_password') || 'Confirm Password'}</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label">{t('role') || 'Role'}</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="MEMBER">Member (Join Groups)</option>
                      <option value="ORGANIZER">Organizer (Manage Groups)</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-4">
                    <label className="form-label">{t('preferred_language') || 'Preferred Language'}</label>
                    <select
                      className="form-select"
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    >
                      <option value="EN">English</option>
                      <option value="SI">Sinhala (සිංහල)</option>
                      <option value="TA">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-4 shadow-sm">
                  {loading ? 'Creating Account...' : (t('register') || 'Complete Registration')}
                </button>

                <div className="text-center text-muted small">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-bold text-primary text-decoration-none">
                    {t('login') || 'Sign In Here'}
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

export default Register;
