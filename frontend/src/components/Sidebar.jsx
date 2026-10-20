import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Icon from './Icons';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout, isOrganizer, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHelpCenter = () => {
    if (onCloseMobile) onCloseMobile();
    window.dispatchEvent(new CustomEvent('toggle-chatbot'));
  };

  const portalLabel = isAdmin ? 'ADMIN PORTAL' : isOrganizer ? 'ORGANIZER PORTAL' : 'MEMBER PORTAL';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1030 }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`sidebar-nav ${isMobileOpen ? 'd-flex position-fixed top-0 start-0 h-100 shadow-lg' : 'd-none d-md-flex'}`}
        style={isMobileOpen ? { zIndex: 1040, top: '64px', height: 'calc(100vh - 64px)' } : {}}
      >
        <div>
          {/* Portal Title Header */}
          <div className="px-2 mb-3">
            <div className="sidebar-portal-title">{portalLabel}</div>
            <div className="sidebar-portal-sub">Manage your Seettu</div>
          </div>

          {/* Navigation Links */}
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="speedometer" size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/notifications"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="bell" size={18} />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="badge bg-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/groups"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="groups" size={18} />
                <span>My Groups</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/members"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="members" size={18} />
                <span>Members</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/payments"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="payments" size={18} />
                <span>Payments</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/advance-payments"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="advance" size={18} />
                <span>Advance</span>
              </NavLink>
            </li>

            {isAdmin && (
              <li>
                <NavLink
                  to="/audit-trail"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onCloseMobile}
                >
                  <Icon name="shield" size={18} />
                  <span>Audit Trail</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/emergency"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="emergency" size={18} />
                <span>Emergency</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="reports" size={18} />
                <span>Reports</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/disputes"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="disputes" size={18} />
                <span>Disputes</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/certificates"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="certificates" size={18} />
                <span>Certificates</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon name="settings" size={18} />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          {!isAdmin && (
            <button
              type="button"
              className="sidebar-link btn btn-link text-start w-100 border-0"
              onClick={handleHelpCenter}
            >
              <Icon name="help" size={18} />
              <span>Help Center</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              handleLogout();
            }}
            className="sidebar-link logout-link btn btn-link text-start w-100 border-0"
          >
            <Icon name="logout" size={18} color="#DC3545" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
