import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as notificationApi from '../api/notificationApi';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotificationsByUser(user.userId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.readStatus;
    return true;
  });

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">🔔 Notification Center</h2>
          <p className="text-muted mb-0">Stay updated on payment reminders, cycle auctions, and group notices</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={fetchNotifications}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4 bg-white p-2">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary fw-bold' : 'btn-light'}`}
            onClick={() => setFilter('ALL')}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary fw-bold' : 'btn-light'}`}
            onClick={() => setFilter('UNREAD')}
          >
            Unread Only ({notifications.filter(n => !n.readStatus).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>🔔</div>
          <h5 className="fw-bold mt-3">No Notifications Found</h5>
          <p className="text-muted">You have no pending notifications matching your filter.</p>
        </div>
      ) : (
        <div className="list-group shadow-sm border-0 rounded-4 overflow-hidden">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`list-group-item d-flex justify-content-between align-items-start p-4 ${!n.readStatus ? 'bg-primary-subtle bg-opacity-10 border-start border-primary border-4' : 'bg-white'}`}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold text-dark mb-0">{n.title || 'System Notification'}</h6>
                  {!n.readStatus && <span className="badge bg-primary">NEW</span>}
                </div>
                <p className="mb-2 text-secondary">{n.message}</p>
                <small className="text-muted">
                  🕒 {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                </small>
              </div>

              {!n.readStatus && (
                <button
                  className="btn btn-sm btn-outline-primary fw-bold ms-3"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  ✓ Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
