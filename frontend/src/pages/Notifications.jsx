import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as notificationApi from '../api/notificationApi';
import { triggerPaymentReminders } from '../api/paymentApi';
import Icon from '../components/Icons';

const Notifications = () => {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);

  const currentUserId = user?.userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId]);

  const fetchNotifications = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError('');
      const res = await notificationApi.getNotificationsByUser(currentUserId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const isUnread = (n) => {
    if (typeof n.isRead === 'boolean') return !n.isRead;
    if (typeof n.readStatus === 'boolean') return !n.readStatus;
    return false;
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;
    try {
      await notificationApi.markAllAsRead(currentUserId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readStatus: true })));
      setSuccessMsg('All notifications marked as read.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to mark all as read.');
    }
  };

  const handleTriggerReminders = async () => {
    try {
      setIsTriggering(true);
      setError('');
      const res = await triggerPaymentReminders();
      setSuccessMsg(res.message || 'Payment reminders sent successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setError('Failed to trigger payment reminders.');
    } finally {
      setIsTriggering(false);
    }
  };

  const getTypeMeta = (type) => {
    const t = (type || '').toUpperCase();
    if (t.includes('OVERDUE')) {
      return { label: 'Overdue Notice', badgeBg: 'bg-danger text-white', icon: 'warning', iconColor: '#EF4444' };
    }
    if (t.includes('REMINDER')) {
      return { label: 'Payment Reminder', badgeBg: 'bg-warning text-dark', icon: 'payments', iconColor: '#F59E0B' };
    }
    if (t.includes('PAYMENT')) {
      return { label: 'Payment Update', badgeBg: 'bg-success text-white', icon: 'payments', iconColor: '#10B981' };
    }
    if (t.includes('DISPUTE')) {
      return { label: 'Dispute Alert', badgeBg: 'bg-dark text-white', icon: 'disputes', iconColor: '#6366F1' };
    }
    if (t.includes('EMERGENCY')) {
      return { label: 'Emergency Notice', badgeBg: 'bg-danger text-white', icon: 'emergency', iconColor: '#DC2626' };
    }
    if (t.includes('KYC') || t.includes('ORGANIZER')) {
      return { label: 'Verification', badgeBg: 'bg-info text-dark', icon: 'shield', iconColor: '#0097B2' };
    }
    if (t.includes('GROUP')) {
      return { label: 'Group Notice', badgeBg: 'bg-primary text-white', icon: 'groups', iconColor: '#0097B2' };
    }
    return { label: 'Notice', badgeBg: 'bg-secondary text-white', icon: 'bell', iconColor: '#64748B' };
  };

  const unreadCount = notifications.filter(isUnread).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return isUnread(n);
    return true;
  });

  return (
    <div className="py-2">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Icon name="bell" size={26} color="#0097B2" />
            <span style={{ color: '#0F2F3D' }}>Notification Center</span>
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-danger fs-6 align-middle ms-2">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-muted mb-0">Stay informed about payment dues, automated reminders, cycle auctions, and group notices</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {(isAdmin || isOrganizer) && (
            <button
              className="btn btn-outline-warning btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={handleTriggerReminders}
              disabled={isTriggering}
              title="Dispatches due payment reminders to members with upcoming cycles"
            >
              <Icon name="payments" size={15} />
              <span>{isTriggering ? 'Dispatching...' : 'Dispatch Due Reminders'}</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              className="btn btn-outline-primary btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={handleMarkAllAsRead}
            >
              <span>✓ Mark All Read</span>
            </button>
          )}

          <button
            className="btn btn-outline-secondary btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
            onClick={fetchNotifications}
          >
            <Icon name="refresh" size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}
      {successMsg && <div className="alert alert-success shadow-sm mb-4">{successMsg}</div>}

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4 bg-white p-2 rounded-3">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary fw-bold' : 'btn-light'}`}
            style={filter === 'ALL' ? { backgroundColor: '#0097B2', borderColor: '#0097B2' } : {}}
            onClick={() => setFilter('ALL')}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary fw-bold' : 'btn-light'}`}
            style={filter === 'UNREAD' ? { backgroundColor: '#0097B2', borderColor: '#0097B2' } : {}}
            onClick={() => setFilter('UNREAD')}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0 rounded-4">
          <div className="d-flex justify-content-center mb-2">
            <Icon name="bell" size={48} color="#94A3B8" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#0F2F3D' }}>No Notifications Found</h5>
          <p className="text-muted mb-0">
            {filter === 'UNREAD'
              ? 'Great news! You have read all your notifications.'
              : 'You do not have any notification records yet.'}
          </p>
        </div>
      ) : (
        <div className="list-group shadow-sm border-0 rounded-4 overflow-hidden">
          {filteredNotifications.map((n) => {
            const unread = isUnread(n);
            const meta = getTypeMeta(n.type);

            return (
              <div
                key={n.id}
                className={`list-group-item d-flex justify-content-between align-items-start p-3 p-md-4 transition-all ${
                  unread
                    ? 'bg-light border-start border-4'
                    : 'bg-white'
                }`}
                style={unread ? { borderLeftColor: '#0097B2' } : {}}
              >
                <div className="d-flex gap-3 align-items-start">
                  <div
                    className="p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: unread ? 'rgba(0, 151, 178, 0.12)' : '#F1F5F9' }}
                  >
                    <Icon name={meta.icon} size={20} color={meta.iconColor} />
                  </div>

                  <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className={`badge rounded-pill ${meta.badgeBg} small fw-bold px-2 py-1`}>
                        {meta.label}
                      </span>
                      {unread && (
                        <span className="badge rounded-pill bg-danger small px-2 py-1">
                          NEW
                        </span>
                      )}
                      <small className="text-muted ms-auto">
                        🕒 {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                      </small>
                    </div>

                    <p className="mb-0 text-dark fw-medium mt-2" style={{ lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                  </div>
                </div>

                {unread && (
                  <button
                    className="btn btn-sm btn-outline-primary fw-bold ms-3 flex-shrink-0"
                    style={{ color: '#0097B2', borderColor: '#0097B2' }}
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                  >
                    ✓ Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
