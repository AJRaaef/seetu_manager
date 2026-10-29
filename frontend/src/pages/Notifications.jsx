import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import * as notificationApi from '../api/notificationApi';
import { triggerPaymentReminders } from '../api/paymentApi';
import Icon from '../components/Icons';
import DisbursementVoucherModal from '../components/DisbursementVoucherModal';
import { getGroupsByUser, getAllGroups, getGroupById } from '../api/groupApi';

const Notifications = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [scope, setScope] = useState('MINE'); // 'MINE' or 'ALL_SYSTEM'
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCycle, setVoucherCycle] = useState(null);
  const [voucherGroup, setVoucherGroup] = useState(null);
  const [cachedGroups, setCachedGroups] = useState([]);

  const currentUserId = user?.userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId, scope]);


  useEffect(() => {
    if (currentUserId) {
      const loadGroups = async () => {
        try {
          const res = isAdmin ? await getAllGroups() : await getGroupsByUser(currentUserId);
          const list = res?.data || (Array.isArray(res) ? res : []);
          setCachedGroups(list);
        } catch (err) {
          console.warn('Failed to pre-cache groups for voucher links', err);
        }
      };
      loadGroups();
    }
  }, [currentUserId, isAdmin]);

  const fetchNotifications = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError('');
      let res;
      if (scope === 'ALL_SYSTEM' && (isAdmin || isOrganizer)) {
        res = await notificationApi.getAllNotifications();
      } else {
        res = await notificationApi.getNotificationsByUser(currentUserId);
      }
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenNotificationVoucher = async (n) => {
    try {
      const msg = n.message || '';
      const cycleMatch = msg.match(/Cycle\s*#?(\d+)/i);
      const cycleNum = cycleMatch ? parseInt(cycleMatch[1], 10) : 1;

      const groupMatch = msg.match(/for\s*['"]([^'"]+)['"]/i);
      const groupName = groupMatch ? groupMatch[1].trim() : '';

      let targetGroup = cachedGroups.find(
        (g) => g.name && groupName && g.name.toLowerCase() === groupName.toLowerCase()
      );

      if (!targetGroup) {
        const res = isAdmin ? await getAllGroups() : await getGroupsByUser(currentUserId);
        const list = res?.data || (Array.isArray(res) ? res : []);
        setCachedGroups(list);
        targetGroup = list.find(
          (g) => g.name && groupName && g.name.toLowerCase() === groupName.toLowerCase()
        ) || list[0];
      }

      if (targetGroup) {
        let fullGroup = targetGroup;
        if (!Array.isArray(fullGroup.cycles) || fullGroup.cycles.length === 0) {
          const detailedRes = await getGroupById(targetGroup.id);
          fullGroup = detailedRes?.data || detailedRes || targetGroup;
        }

        const cycles = fullGroup.cycles || [];
        let targetCycle = cycles.find((c) => c.cycleNumber === cycleNum);
        if (!targetCycle) {
          targetCycle = cycles.find((c) => c.status === 'COMPLETED') || cycles[0];
        }

        if (targetCycle) {
          setVoucherCycle(targetCycle);
          setVoucherGroup(fullGroup);
          setShowVoucherModal(true);
          return;
        }
      }

      window.location.href = targetGroup ? `/groups/${targetGroup.id}` : '/groups';
    } catch (err) {
      console.error('Failed to open voucher from notification', err);
      alert('Unable to load voucher. Redirecting to your groups...');
      window.location.href = '/groups';
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
    try {
      if (scope === 'ALL_SYSTEM') {
        const unreadItems = notifications.filter(isUnread);
        await Promise.all(unreadItems.map(item => notificationApi.markAsRead(item.id)));
      } else {
        if (!currentUserId) return;
        await notificationApi.markAllAsRead(currentUserId);
      }
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
    const tType = (type || '').toUpperCase();
    if (tType.includes('OVERDUE')) {
      return { label: t('notifications_page.overdue_notice', 'Overdue Notice'), badgeBg: 'bg-danger text-white', icon: 'warning', iconColor: '#DC2626', iconBg: '#FEE2E2', borderColor: '#DC2626' };
    }
    if (tType.includes('REMINDER')) {
      return { label: t('notifications_page.payment_reminder', 'Payment Reminder'), badgeBg: 'bg-warning text-dark', icon: 'payments', iconColor: '#D97706', iconBg: '#FEF3C7', borderColor: '#F59E0B' };
    }
    if (tType.includes('PAYMENT')) {
      return { label: t('notifications_page.payment_update', 'Payment Update'), badgeBg: 'bg-success text-white', icon: 'payments', iconColor: '#059669', iconBg: '#D1FAE5', borderColor: '#10B981' };
    }
    if (tType.includes('DISPUTE')) {
      return { label: t('notifications_page.dispute_alert', 'Dispute Alert'), badgeBg: 'bg-dark text-white', icon: 'disputes', iconColor: '#4F46E5', iconBg: '#EEF2FF', borderColor: '#6366F1' };
    }
    if (tType.includes('EMERGENCY')) {
      return { label: t('notifications_page.emergency_notice', 'Emergency Notice'), badgeBg: 'bg-danger text-white', icon: 'emergency', iconColor: '#DC2626', iconBg: '#FEE2E2', borderColor: '#DC2626' };
    }
    if (tType.includes('VERIF') || tType.includes('KYC') || tType.includes('ORGANIZER')) {
      const isApproved = tType.includes('APPROV') || tType.includes('VERIFIED');
      const isRejected = tType.includes('REJECT');
      if (isApproved) {
        return { label: t('notifications_page.verified', 'Verified'), badgeBg: 'bg-success text-white', icon: 'shield', iconColor: '#059669', iconBg: '#D1FAE5', borderColor: '#10B981' };
      }
      if (isRejected) {
        return { label: t('notifications_page.verification_rejected', 'Verification Rejected'), badgeBg: 'bg-danger text-white', icon: 'shield', iconColor: '#DC2626', iconBg: '#FEE2E2', borderColor: '#DC2626' };
      }
      return { label: t('notifications_page.verification_review', 'Verification Under Review'), badgeBg: 'bg-info text-dark', icon: 'shield', iconColor: '#0284C7', iconBg: '#E0F2FE', borderColor: '#0097B2' };
    }
    if (tType.includes('JOIN')) {
      return { label: t('notifications_page.join_request', 'Join Request'), badgeBg: 'bg-primary text-white', icon: 'groups', iconColor: '#0097B2', iconBg: '#E0F7FA', borderColor: '#0097B2' };
    }
    if (tType.includes('GROUP')) {
      return { label: t('notifications_page.group_notice', 'Group Notice'), badgeBg: 'bg-primary text-white', icon: 'groups', iconColor: '#0097B2', iconBg: '#E0F7FA', borderColor: '#0097B2' };
    }
    return { label: t('notifications_page.notice', 'Notice'), badgeBg: 'bg-secondary text-white', icon: 'bell', iconColor: '#64748B', iconBg: '#F1F5F9', borderColor: '#94A3B8' };
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
            <span style={{ color: '#0F2F3D' }}>{t('notifications_page.title', 'Notifications')}</span>
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-danger fs-6 align-middle ms-2">
                {t('notifications_page.unread_badge', { count: unreadCount, defaultValue: `${unreadCount} unread` })}
              </span>
            )}
          </h2>
          <p className="text-muted mb-0">
            {scope === 'ALL_SYSTEM'
              ? t('notifications_page.system_sub', 'Viewing all system-wide notification activities across all users and circles')
              : `${t('notifications_page.personal_sub', 'Personal notifications for')} ${user?.fullName || 'your account'} (${user?.email || ''})`}
          </p>
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
              <span>{isTriggering ? t('notifications_page.dispatching', 'Dispatching...') : t('notifications_page.dispatch_btn', 'Dispatch Due Reminders')}</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              className="btn btn-outline-primary btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={handleMarkAllAsRead}
            >
              <Icon name="check" size={14} />
              <span>{t('notifications_page.mark_all_read', 'Mark all as read')}</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}
      {successMsg && <div className="alert alert-success shadow-sm mb-4">{successMsg}</div>}

      {/* Scope Selector (For Admins & Organizers to view My Notifications vs All System) */}
      {(isAdmin || isOrganizer) && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="small text-muted fw-bold text-uppercase">{t('notifications_page.scope_label', 'Scope:')}</span>
          <div className="btn-group btn-group-sm shadow-sm" role="group">
            <button
              type="button"
              className={`btn d-inline-flex align-items-center gap-1.5 ${scope === 'MINE' ? 'btn-teal fw-bold text-white' : 'btn-outline-secondary'}`}
              style={scope === 'MINE' ? { backgroundColor: '#0097B2', borderColor: '#0097B2' } : {}}
              onClick={() => setScope('MINE')}
            >
              <Icon name="user" size={14} color={scope === 'MINE' ? '#FFFFFF' : 'currentColor'} />
              <span>{t('notifications_page.my_notifications', 'My Notifications')}</span>
            </button>
            <button
              type="button"
              className={`btn d-inline-flex align-items-center gap-1.5 ${scope === 'ALL_SYSTEM' ? 'btn-teal fw-bold text-white' : 'btn-outline-secondary'}`}
              style={scope === 'ALL_SYSTEM' ? { backgroundColor: '#0F2F3D', borderColor: '#0F2F3D' } : {}}
              onClick={() => setScope('ALL_SYSTEM')}
            >
              <Icon name="globe" size={14} color={scope === 'ALL_SYSTEM' ? '#FFFFFF' : 'currentColor'} />
              <span>{t('notifications_page.all_system_notifications', 'All System Notifications')} ({scope === 'ALL_SYSTEM' ? notifications.length : t('notifications_page.all_users', 'All Users')})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4 bg-white p-2 rounded-3">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary fw-bold' : 'btn-light'}`}
            style={filter === 'ALL' ? { backgroundColor: '#0097B2', borderColor: '#0097B2' } : {}}
            onClick={() => setFilter('ALL')}
          >
            {t('notifications_page.all_notifications', 'All Notifications')} ({notifications.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary fw-bold' : 'btn-light'}`}
            style={filter === 'UNREAD' ? { backgroundColor: '#0097B2', borderColor: '#0097B2' } : {}}
            onClick={() => setFilter('UNREAD')}
          >
            {t('notifications_page.unread_only', 'Unread Only')} ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">{t('notifications_page.loading', 'Loading notifications...')}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0 rounded-4">
          <div className="d-flex justify-content-center mb-2">
            <Icon name="bell" size={48} color="#94A3B8" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#0F2F3D' }}>{t('notifications_page.empty_title', 'No Notifications Found')}</h5>
          <p className="text-muted mb-0">
            {filter === 'UNREAD'
              ? t('notifications_page.empty_read_desc', 'Great news! You have read all notifications in this view.')
              : t('notifications_page.empty_match_desc', 'There are no notification records matching your selection.')}
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
                style={unread ? { borderLeftColor: meta.borderColor || '#0097B2' } : {}}
              >
                <div className="d-flex gap-3 align-items-start w-100">
                  <div
                    className="p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                    style={{
                      backgroundColor: unread ? (meta.iconBg || 'rgba(0, 151, 178, 0.12)') : '#F1F5F9',
                      width: '38px',
                      height: '38px'
                    }}
                  >
                    <Icon name={meta.icon} size={20} color={meta.iconColor} />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className={`badge rounded-pill ${meta.badgeBg} small fw-bold px-2 py-1`}>
                        {meta.label}
                      </span>
                      {unread && (
                        <span className="badge rounded-pill bg-danger small px-2 py-1">
                              {t('notifications_page.new_badge', 'NEW')}
                        </span>
                      )}
                      {scope === 'ALL_SYSTEM' && n.user && (
                        <span className="badge bg-secondary-subtle text-dark border px-2 py-0.5 small d-inline-flex align-items-center">
                          <Icon name="user" size={12} color="#475569" className="me-1" />
                          <span>{t('notifications_page.sent_to', 'Sent to:')} {n.user.fullName || n.user.email || `User #${n.user.id}`}</span>
                        </span>
                      )}
                      <small className="text-muted ms-auto d-inline-flex align-items-center">
                        <Icon name="clock" size={12} color="#94A3B8" className="me-1" />
                        <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
                      </small>
                    </div>

                    <p className="mb-0 text-dark fw-medium mt-2" style={{ lineHeight: 1.5 }}>
                      {n.message}
                    </p>

                    {(n.type === 'CYCLE_COMPLETED' || (n.message && (n.message.toLowerCase().includes('payout verification voucher') || n.message.toLowerCase().includes('disbursed to')))) && (
                      <div className="mt-2 pt-2 border-top d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-success fw-bold rounded-pill px-3 py-1 shadow-xs d-inline-flex align-items-center gap-1.5"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleOpenNotificationVoucher(n)}
                        >
                          <Icon name="award" size={14} color="#166534" />
                          <span>{t('notifications_page.view_voucher', 'View Payout Voucher (PDF)')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {unread && (
                    <button
                      className="btn btn-sm btn-outline-primary fw-bold ms-3 flex-shrink-0 d-inline-flex align-items-center gap-1"
                      style={{ color: '#0097B2', borderColor: '#0097B2' }}
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                    >
                      <Icon name="check" size={13} color="#0097B2" />
                      <span>{t('notifications_page.mark_read', 'Mark Read')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Disbursement Voucher Modal from Notification */}
      {showVoucherModal && voucherCycle && voucherGroup && (
        <DisbursementVoucherModal
          show={showVoucherModal}
          onHide={() => {
            setShowVoucherModal(false);
            setVoucherCycle(null);
            setVoucherGroup(null);
          }}
          cycle={voucherCycle}
          group={voucherGroup}
          organizerName={voucherGroup?.organizerName || voucherGroup?.createdByName || user?.fullName}
        />
      )}

    </div>
  );
};

export default Notifications;