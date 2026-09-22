import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Icon from './Icons';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
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

        <Link to="/dashboard" className="topbar-brand">
          <span className="brand-seettu">Seettu</span>
          <span className="brand-manager">Manager</span>
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
                🇬🇧 English (EN)
              </button>
              <button
                className={`dropdown-item py-1 px-3 rounded-2 text-start w-100 btn btn-link text-decoration-none ${language === 'si' ? 'fw-bold text-primary' : 'text-dark'}`}
                onClick={() => { changeLanguage('si'); setShowLangMenu(false); }}
              >
                🇱🇰 Sinhala (SI)
              </button>
              <button
                className={`dropdown-item py-1 px-3 rounded-2 text-start w-100 btn btn-link text-decoration-none ${language === 'ta' ? 'fw-bold text-primary' : 'text-dark'}`}
                onClick={() => { changeLanguage('ta'); setShowLangMenu(false); }}
              >
                🇱🇰 Tamil (TA)
              </button>
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div className="position-relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); }}
            className="btn btn-link p-0 text-decoration-none rounded-circle border d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px', backgroundColor: '#F1F5F9' }}
            title={user?.fullName || 'User Profile'}
          >
            <Icon name="user" size={20} color="#1A5265" />
          </button>

          {showUserMenu && (
            <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2" style={{ zIndex: 1050, minWidth: '180px' }}>
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold text-truncate" style={{ maxWidth: '160px' }}>{user?.fullName || 'User'}</div>
                <div className="small text-muted text-truncate" style={{ maxWidth: '160px' }}>{user?.email}</div>
                <span className="badge bg-light text-dark border mt-1">{user?.role || 'MEMBER'}</span>
              </div>
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
