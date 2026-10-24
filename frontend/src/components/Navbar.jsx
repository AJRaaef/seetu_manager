import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icons';

const Navbar = () => {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { unreadCount } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand me-4" to="/">
          <span className="fw-bold"><span style={{ color: '#FFFFFF' }}>Seettu</span><span style={{ color: '#008CA7' }}>Manager</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                <Icon name="dashboard" size={16} className="me-1" /> {t('dashboard') || 'Dashboard'}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/groups')}`} to="/groups">
                <Icon name="groups" size={16} className="me-1" /> {t('my_groups') || 'My Groups'}
              </Link>
            </li>
            {(isAdmin || isOrganizer) && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/payments')}`} to="/payments">
                  <Icon name="payments" size={16} className="me-1" /> {t('payments') || 'Payments'}
                </Link>
              </li>
            )}
            {(isAdmin || isOrganizer) && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/advance-payments')}`} to="/advance-payments">
                  <Icon name="advance" size={16} className="me-1" /> {t('sidebar.advance', 'Advance')}
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/emergency')}`} to="/emergency">
                <Icon name="emergency" size={16} className="me-1" /> {t('emergency', 'Emergency')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/disputes')}`} to="/disputes">
                <Icon name="disputes" size={16} className="me-1" /> {t('disputes', 'Disputes')}
              </Link>
            </li>
            {(isAdmin || isOrganizer) && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/reports')}`} to="/reports">
                  <Icon name="reports" size={16} className="me-1" /> {t('reports', 'Reports')}
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/certificates')}`} to="/certificates">
                <Icon name="certificates" size={16} className="me-1" /> {t('certificates', 'Certificates')}
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-lg-center">
            {/* Day / Night Mode Toggle */}
            <li className="nav-item me-2">
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                onClick={toggleTheme}
                title="Toggle Day/Night Mode"
              >
                {theme === 'dark' ? 'Day' : 'Night'}
              </button>
            </li>

            {/* Language Switcher */}
            <li className="nav-item dropdown me-2">
              <a
                className="nav-link dropdown-toggle bg-dark-subtle px-3 rounded-pill text-white"
                href="#"
                id="langDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {language.toUpperCase()}
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li><button className="dropdown-item" onClick={() => changeLanguage('en')}>English (EN)</button></li>
                <li><button className="dropdown-item" onClick={() => changeLanguage('si')}>සිංහල (SI)</button></li>
                <li><button className="dropdown-item" onClick={() => changeLanguage('ta')}>தமிழ் (TA)</button></li>
              </ul>
            </li>

            {/* Notifications Bell */}
            <li className="nav-item me-2">
              <Link className={`nav-link position-relative d-flex align-items-center ${isActive('/notifications')}`} to="/notifications">
                <Icon name="bell" size={20} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>

            {/* User Dropdown */}
            <li className="nav-item dropdown ms-lg-2 me-2">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div
                  className="rounded-circle overflow-hidden bg-primary d-flex align-items-center justify-content-center text-white font-weight-bold"
                  style={{ width: '32px', height: '32px', fontSize: '14px' }}
                >
                  {user?.profilePictureUrl ? (
                    <img
                      src={`http://localhost:8081${user.profilePictureUrl}`}
                      alt={user?.fullName || 'User'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    user?.fullName?.charAt(0) || 'U'
                  )}
                </div>
                <span>{user?.fullName || 'User'}</span>
                <span className="badge bg-primary-subtle text-primary border ms-1">{user?.role || 'MEMBER'}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li className="dropdown-header">Logged in as {user?.email}</li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/profile"><Icon name="user" size={14} className="me-2" />{t('profile') || 'My Profile'}</Link></li>
                <li><Link className="dropdown-item" to="/certificates"><Icon name="certificates" size={14} className="me-2" />{t('certificates', 'Certificates')}</Link></li>
                {user?.role === 'MEMBER' && (
                  <li>
                    <Link className="dropdown-item fw-semibold text-primary" to="/groups">
                      <Icon name="award" size={14} className="me-2 text-primary" />
                      {user?.requestedRole === 'ORGANIZER' ? 'Organizer Status Pending' : 'Become an Organizer'}
                    </Link>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger fw-bold" onClick={handleLogout}><Icon name="logout" size={14} className="me-2 text-danger" />{t('logout', 'Logout')}</button></li>
              </ul>
            </li>

            {/* Prominent Direct Logout Button for Logged In Users */}
            <li className="nav-item ms-1">
              <button
                className="btn btn-sm btn-danger fw-bold shadow-sm d-flex align-items-center gap-1"
                onClick={handleLogout}
                title="Logout from system"
              >
                <Icon name="logout" size={14} /> {t('logout', 'Logout')}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
