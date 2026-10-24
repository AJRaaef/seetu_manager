import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import Icon from "./Icons";

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { t } = useTranslation();
  const { logout, isOrganizer, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  // Clear the session and go back to the landing page
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Open the chatbot widget through a global event
  const handleHelpCenter = () => {
    if (onCloseMobile) onCloseMobile();
    window.dispatchEvent(new CustomEvent("toggle-chatbot"));
  };

  const portalLabel = isAdmin
    ? t("sidebar.admin_portal", "ADMIN PORTAL")
    : isOrganizer
      ? t("sidebar.organizer_portal", "ORGANIZER PORTAL")
      : t("sidebar.member_portal", "MEMBER PORTAL");

  // Adds the "active" class to the current NavLink
  const linkClass = ({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`;

  // One menu item: icon + translated label. Keeps the markup identical for every link.
  const MenuLink = ({ to, icon, labelKey, labelDefault }) => (
    <li>
      <NavLink to={to} className={linkClass} onClick={onCloseMobile}>
        <Icon name={icon} size={18} />
        <span>{t(labelKey, labelDefault)}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Dark backdrop behind the sidebar on small screens */}
      {isMobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1030 }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`sidebar-nav ${
          isMobileOpen
            ? "d-flex position-fixed top-0 start-0 h-100 shadow-lg"
            : "d-none d-md-flex"
        }`}
        style={
          isMobileOpen
            ? { zIndex: 1040, top: "64px", height: "calc(100vh - 64px)" }
            : {}
        }
      >
        <div>
          {/* Portal title */}
          <div className="px-2 mb-3">
            <div className="sidebar-portal-title">{portalLabel}</div>
            <div className="sidebar-portal-sub">
              {t("sidebar.manage_seettu", "Manage your Seettu")}
            </div>
          </div>

          {/* Main navigation */}
          <ul className="sidebar-menu">
            <MenuLink to="/dashboard" icon="speedometer" labelKey="sidebar.dashboard" labelDefault="Dashboard" />

            <li>
              <NavLink to="/notifications" className={linkClass} onClick={onCloseMobile}>
                <Icon name="bell" size={18} />
                <span>{t("sidebar.notifications", "Notifications")}</span>
                {unreadCount > 0 && (
                  <span
                    className="badge bg-danger rounded-pill px-2 py-0.5 ms-auto"
                    style={{ fontSize: "0.68rem" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>

            <MenuLink to="/groups" icon="groups" labelKey="sidebar.my_groups" labelDefault="My Groups" />
            <MenuLink to="/members" icon="members" labelKey="sidebar.members" labelDefault="Members" />
            <MenuLink to="/payments" icon="payments" labelKey="sidebar.payments" labelDefault="Payments" />
            <MenuLink to="/advance-payments" icon="advance" labelKey="sidebar.advance" labelDefault="Advance" />

            {/* Admin only */}
            {isAdmin && (
              <MenuLink to="/audit-trail" icon="shield" labelKey="sidebar.audit_trail" labelDefault="Audit Trail" />
            )}

            <MenuLink to="/emergency" icon="emergency" labelKey="sidebar.emergency" labelDefault="Emergency" />
            <MenuLink to="/reports" icon="reports" labelKey="sidebar.reports" labelDefault="Reports" />
            <MenuLink to="/disputes" icon="disputes" labelKey="sidebar.disputes" labelDefault="Disputes" />
            <MenuLink to="/certificates" icon="certificates" labelKey="sidebar.certificates" labelDefault="Certificates" />
            <MenuLink to="/profile" icon="settings" labelKey="sidebar.settings" labelDefault="Settings" />
          </ul>
        </div>

        {/* Bottom section: help and logout */}
        <div className="sidebar-footer">
          {/* Help Center is hidden for admins */}
          {!isAdmin && (
            <button
              type="button"
              className="sidebar-link btn btn-link text-start w-100 border-0"
              onClick={handleHelpCenter}
            >
              <Icon name="help" size={18} />
              <span>{t("sidebar.help_center", "Help Center")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              handleLogout();
            }}
            className="sidebar-link logout-link btn btn-link text-start w-100 border-0"
          >
            <Icon name="logout" size={18} color="#DC3545" />
            <span>{t("sidebar.logout", "Logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;