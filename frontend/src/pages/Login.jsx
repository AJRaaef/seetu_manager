import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import Icon from '../components/Icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Invalid email or password. Please check your credentials.');
      setError(guidance);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">
          <span className="brand-seettu">Seettu</span>
          <span className="brand-manager">Manager</span>
        </h2>
        <p className="auth-subtitle">Digital Financial Discipline for Seettu Group</p>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 border-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-semibold text-dark small mb-1">Email / Username</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Icon name="mail" size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-semibold text-dark small mb-1">Password</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Icon name="lock" size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <span
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-teal w-100 py-2 fw-semibold fs-6 mb-3"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mb-3">
            <span className="small text-muted">Don't have an account? </span>
            <Link to="/register" className="small fw-semibold text-decoration-none" style={{ color: '#1A5265' }}>
              Register New Account
            </Link>
          </div>

          {/* Quick Demo Logins Helper */}
          <div className="pt-2 border-top text-center">
            <span className="small text-muted d-block mb-2" style={{ fontSize: '0.75rem' }}>Demo Quick-Fill:</span>
            <div className="d-flex justify-content-center gap-1 flex-wrap">
              <button
                type="button"
                className="btn btn-sm btn-light border py-0 px-2 small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('admin@seetumanager.com', 'Admin@123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light border py-0 px-2 small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('org@gmail.com', 'Hello@12345')}
              >
                Organizer
              </button>
              <button
                type="button"
                className="btn btn-sm btn-light border py-0 px-2 small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillDemo('user@gmail.com', 'Hello@12345')}
              >
                Member
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
