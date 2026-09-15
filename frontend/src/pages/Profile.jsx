import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/authApi';

const Profile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(user.userId, currentPassword, newPassword);
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">👤 User Account & Profile</h2>
        <p className="text-muted mb-0">Manage your profile information, role security, and password</p>
      </div>

      <div className="row g-4">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
              📌 Account Overview
            </div>
            <div className="card-body p-4 text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <h4 className="fw-bold text-dark mb-1">{user?.fullName || 'User'}</h4>
              <p className="text-muted small mb-3">{user?.email || 'N/A'}</p>

              <hr />

              <div className="text-start">
                <div className="mb-3">
                  <label className="text-muted d-block small">Account Role</label>
                  <span className="badge bg-primary fs-6">{user?.role || 'MEMBER'}</span>
                </div>

                <div className="mb-3">
                  <label className="text-muted d-block small">Preferred Language</label>
                  <span className="badge bg-secondary fs-6">{user?.preferredLanguage || 'EN'}</span>
                </div>

                <div className="mb-3">
                  <label className="text-muted d-block small">User ID</label>
                  <strong className="text-dark">#{user?.userId || 'N/A'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
              🔒 Security & Password Update
            </div>
            <div className="card-body p-4">
              {message && <div className="alert alert-success shadow-sm">{message}</div>}
              {error && <div className="alert alert-danger shadow-sm">{error}</div>}

              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary fw-bold px-4">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
