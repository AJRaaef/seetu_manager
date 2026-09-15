import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('⚠️ Guidance: Please fill in both email address and password fields.');
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Invalid email or password. Please check your credentials and try again.');
      setError(`⚠️ Authentication Error Guidance: ${guidance}`);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <div style={{ fontSize: '2.5rem' }}>💎</div>
              <h3 className="fw-bold mb-1">{t('app_name') || 'Seettu Manager System'}</h3>
              <p className="mb-0 text-white-50 small">Secure Financial Group & Chit-Fund Platform</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold text-dark mb-4 text-center">{t('login') || 'Sign In to Your Account'}</h4>
              
              {error && (
                <div className="alert alert-danger shadow-sm border-0 mb-4 p-3">
                  <div className="fw-bold">{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t('email') || 'Email Address'}</label>
                  <input 
                    type="email" 
                    className="form-control form-control-lg" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">{t('password') || 'Password'}</label>
                    <Link to="/forgot-password" className="small text-primary text-decoration-none">
                      {t('forgot_password') || 'Forgot Password?'}
                    </Link>
                  </div>
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                
                <button disabled={loading} type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-4 shadow-sm">
                  {loading ? 'Signing In...' : (t('login') || 'Sign In')}
                </button>

                <div className="p-3 bg-light rounded-3 mb-4 border">
                  <span className="small fw-bold text-muted d-block mb-2 text-center">⚡ Quick Demo Login Accounts:</span>
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => fillDemoCredentials('admin@seettu.com', 'admin123')}
                    >
                      👑 Admin
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => fillDemoCredentials('organizer@seettu.com', 'org123')}
                    >
                      👔 Organizer
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-success"
                      onClick={() => fillDemoCredentials('member1@seettu.com', 'user123')}
                    >
                      👤 Member
                    </button>
                  </div>
                </div>
                
                <div className="text-center text-muted small">
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-bold text-primary text-decoration-none">
                    {t('register') || 'Register Here'}
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

export default Login;
