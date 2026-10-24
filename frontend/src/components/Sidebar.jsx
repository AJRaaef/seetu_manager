import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import Icon from "./Icons";

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { t } = useTranslation();
  const { user, logout, isOrganizer, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  // Clear the session and go back to the login page
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
  

  // Shared class name function for NavLink active state
  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

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
        className={`sidebar-nav ${isMobileOpen ? "d-flex position-fixed top-0 start-0 h-100 shadow-lg" : "d-none d-md-flex"}`}
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
            <div className="sidebar-portal-sub">
              {t("manage_seettu", "Manage your Seettu")}
            </div>
          </div>

          {/* Main navigation */}
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/dashboard"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="speedometer" size={18} />
                <span>{t("sidebar.dashboard", "Dashboard")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onCloseMobile}
              >
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="bell" size={18} />
                    <span>{t("sidebar.notifications", "Notifications")}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span
                      className="badge bg-danger rounded-pill px-2 py-0.5"
                      style={{ fontSize: "0.68rem" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span>{t("dashboard", "Dashboard")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/groups"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="groups" size={18} />
                <span>{t("sidebar.my_groups", "My Groups")}</span>
                <span>{t("my_groups", "My Groups")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/members"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="members" size={18} />
                <span>{t("sidebar.members", "Members")}</span>
                <span>{t("members", "Members")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/payments"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="payments" size={18} />
                <span>{t("sidebar.payments", "Payments")}</span>
                <span>{t("payments", "Payments")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/advance-payments"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="advance" size={18} />
                <span>{t("sidebar.advance", "Advance")}</span>
                <span>{t("advance", "Advance")}</span>
              </NavLink>
            </li>

            {/* Admin only */}
            {isAdmin && (
              <li>
                <NavLink
                  to="/audit-trail"
                  className={linkClass}
                  onClick={onCloseMobile}
                >
                  <Icon name="shield" size={18} />
                  <span>{t("sidebar.audit_trail", "Audit Trail")}</span>
                  <span>{t("audit_trail", "Audit Trail")}</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/emergency"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="emergency" size={18} />
                <span>{t("sidebar.emergency", "Emergency")}</span>
                <span>{t("emergency", "Emergency")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reports"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="reports" size={18} />
                <span>{t("sidebar.reports", "Reports")}</span>
                <span>{t("reports", "Reports")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/disputes"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="disputes" size={18} />
                <span>{t("sidebar.disputes", "Disputes")}</span>
                <span>{t("disputes", "Disputes")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/certificates"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="certificates" size={18} />
                <span>{t("sidebar.certificates", "Certificates")}</span>
                <span>{t("certificates", "Certificates")}</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/profile"
                className={linkClass}
                onClick={onCloseMobile}
              >
                <Icon name="settings" size={18} />
                <span>{t("sidebar.settings", "Settings")}</span>
                <span>{t("settings", "Settings")}</span>
              </NavLink>
            </li>
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
              <span>{t("help_center", "Help Center")}</span>
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
            <span>{t("logout", "Logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
