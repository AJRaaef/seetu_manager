import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNotification } from '../hooks/useNotification';
import Icon from './Icons';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { unreadCount } = useNotification();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar-header">
      <div className="d-flex align-items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn btn-link p-0 text-dark border-0 text-decoration-none d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          title="Toggle Sidebar"
        >
          <Icon name="menu" size={24} color="#0F2F3D" />
        </button>

        <Link to="/dashboard" className="topbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <img src="/logo.png" alt="SeettuManager Logo" style={{ height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover' }} />
          <div className="d-flex flex-column text-start">
            <span className="lh-1">
              <span className="brand-seettu">Seettu</span>
              <span className="brand-manager">Manager</span>
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#0097B2', letterSpacing: '0.2px', marginTop: '2px', lineHeight: '1' }}>
              Save Together. Grow Together.
            </span>
          </div>
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Search Box */}
        <div className="topbar-search-box d-none d-md-flex">
          <Icon name="search" size={16} color="#FFFFFF" />
          <input type="text" placeholder="Search" />
        </div>

        {/* Language Dropdown */}
        <div className="position-relative">
          <button
            onClick={() => { setShowLangMenu(!showLangMenu); setShowUserMenu(false); }}
            className="btn btn-link text-decoration-none text-dark p-1 d-flex align-items-center gap-1 fw-semibold"
            style={{ fontSize: '0.9rem' }}
          >
            <span>{language.toUpperCase()}</span>
            <Icon name="chevron-down" size={13} className="text-muted" />
          </button>

          {showLangMenu && (
            <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2" style={{ zIndex: 1050, minWidth: '150px' }}>
              <button
                className={`dropdown-item py-1 px-3 rounded-2 text-start w-100 btn btn-link text-decoration-none ${language === 'en' ? 'fw-bold text-primary' : 'text-dark'}`}
                onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}
              >
                English (EN)
              </button>
              <button
                className={`dropdown-item py-1 px-3 rounded-2 text-start w-100 btn btn-link text-decoration-none ${language === 'si' ? 'fw-bold text-primary' : 'text-dark'}`}
                onClick={() => { changeLanguage('si'); setShowLangMenu(false); }}
              >
                Sinhala (SI)
              </button>
              <button
                className={`dropdown-item py-1 px-3 rounded-2 text-start w-100 btn btn-link text-decoration-none ${language === 'ta' ? 'fw-bold text-primary' : 'text-dark'}`}
                onClick={() => { changeLanguage('ta'); setShowLangMenu(false); }}
              >
                Tamil (TA)
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="btn btn-link p-0 text-decoration-none position-relative d-flex align-items-center justify-content-center"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            transition: 'background-color 0.2s ease'
          }}
          title="Notification Center"
        >
          <Icon name="bell" size={19} color="#0F2F3D" />
          {unreadCount > 0 && (
            <span
              className="position-absolute badge rounded-pill bg-danger border border-white"
              style={{
                top: '-3px',
                right: '-3px',
                fontSize: '0.65rem',
                padding: '0.22em 0.45em',
                lineHeight: '1'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar Circle */}
        <div className="position-relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); }}
            className="btn btn-link p-0 text-decoration-none rounded-circle border d-flex align-items-center justify-content-center overflow-hidden"
            style={{ width: '38px', height: '38px', backgroundColor: '#F1F5F9' }}
            title={user?.fullName || 'User Profile'}
          >
            {user?.profilePictureUrl ? (
              <img
                src={`http://localhost:8081${user.profilePictureUrl}`}
                alt={user?.fullName || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Icon name="user" size={20} color="#1A5265" />
            )}
          </button>

          {showUserMenu && (
            <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2" style={{ zIndex: 1050, minWidth: '220px' }}>
              <div className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                <div
                  className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '36px', height: '36px', backgroundColor: '#3E7B8E', color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={`http://localhost:8081${user.profilePictureUrl}`}
                      alt={user?.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-truncate" style={{ maxWidth: '145px' }}>{user?.fullName || 'User'}</div>
                  <div className="small text-muted text-truncate" style={{ maxWidth: '145px' }}>{user?.email}</div>
                  <span className="badge bg-light text-dark border mt-0.5">{user?.role || 'MEMBER'}</span>
                </div>
              </div>
              <Link
                to="/notifications"
                className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center justify-content-between text-dark text-decoration-none"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="d-flex align-items-center gap-2">
                  <Icon name="bell" size={16} color="#0097B2" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>{unreadCount}</span>
                )}
              </Link>
              <Link
                to="/profile"
                className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 text-dark text-decoration-none"
                onClick={() => setShowUserMenu(false)}
              >
                <Icon name="user" size={16} />
                <span>My Profile</span>
              </Link>
              <div className="border-top my-1"></div>
              <button
                onClick={handleLogout}
                className="dropdown-item py-2 px-3 rounded-2 d-flex align-items-center gap-2 text-danger w-100 btn btn-link text-decoration-none"
              >
                <Icon name="logout" size={16} color="#DC2626" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
