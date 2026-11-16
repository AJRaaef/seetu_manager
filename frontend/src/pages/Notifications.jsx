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
      setError(t('notifications_page.failed_load', 'Failed to load notifications.'));
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
      alert(t('notifications_page.unable_load_voucher', 'Unable to load voucher. Redirecting to your groups...'));
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
      setSuccessMsg(t('notifications_page.all_marked_read', 'All notifications marked as read.'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError(t('notifications_page.failed_mark_all_read', 'Failed to mark all as read.'));
    }
  };

  const handleTriggerReminders = async () => {
    try {
      setIsTriggering(true);
      setError('');
      const res = await triggerPaymentReminders();
      setSuccessMsg(res.message || t('notifications_page.payment_reminders_sent', 'Payment reminders sent successfully!'));
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setError(t('notifications_page.failed_trigger_reminders', 'Failed to trigger payment reminders.'));
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

  const getNotificationMessage = (notification) => {
    const type = (notification.type || '').toUpperCase();
    const message = notification.message || '';
    let match;

    switch (type) {
      case 'PAYMENT':
        match = message.match(/^Your payment of (.+) has been recorded for cycle (\d+)$/);
        if (match) return t('notifications_page.payment_recorded', { amount: match[1], cycle: match[2] });
        break;
      case 'PAYMENT_OVERDUE':
        match = message.match(/^Your installment for '(.+)' \(Cycle #(\d+)\) is overdue\.$/);
        if (match) return t('notifications_page.payment_overdue_message', { group: match[1], cycle: match[2] });
        break;
      case 'PAYMENT_REMINDER':
        match = message.match(/^Payment Reminder: Your installment of LKR (.+) for '(.+)' \(Cycle #(\d+)\) is due on (.+)\. Please ensure your payment is settled on time\.$/);
        if (match) return t('notifications_page.payment_reminder_message', { amount: match[1], group: match[2], cycle: match[3], date: match[4] });
        break;
      case 'CYCLE_COMPLETED':
        match = message.match(/^Cycle #(\d+) for '(.+)' has officially completed! The total rotational pot of (.+) LKR has been disbursed to (.+?)\. Payout verification voucher is available for download\. (.+)$/);
        if (match) {
          const isFinal = match[5] === 'All cycles for this circle are now fully completed!';
          const nextCycleMatch = match[5].match(/^Cycle #(\d+) is now active\.$/);
          if (isFinal || nextCycleMatch) {
            return t(`notifications_page.cycle_completed_${isFinal ? 'final' : 'next'}`, {
              cycle: match[1],
              group: match[2],
              amount: match[3],
              winner: match[4],
              ...(isFinal ? {} : { nextCycle: nextCycleMatch[1] })
            });
          }
        }
        break;
      case 'UPCOMING_PAYOUT':
        match = message.match(/^Upcoming Payout Notice: Cycle #(\d+) for '(.+)' is now in progress! Scheduled rotational payout of (.+) LKR to (.+) on or before (.+)\. Track it in your dashboard\.$/);
        if (match) return t('notifications_page.upcoming_payout_message', { cycle: match[1], group: match[2], amount: match[3], recipient: match[4], date: match[5] });
        break;
      case 'PAYOUT_RECEIVED':
        match = message.match(/^Congratulations (.+)! Your rotational payout pot of (.+) LKR for Cycle #(\d+) in '(.+)' has been officially disbursed to you by your organizer\. Your official Payout Verification Voucher has been issued\.$/);
        if (match) return t('notifications_page.payout_received_message', { name: match[1], amount: match[2], cycle: match[3], group: match[4] });
        break;
      case 'PAYOUT':
        match = message.match(/^Congratulations! You have been allocated the payout for Cycle #(\d+) in group "(.+)"\.$/);
        if (match) return t('notifications_page.payout_allocated_message', { cycle: match[1], group: match[2] });
        break;
      case 'VERIFICATION_PENDING':
        match = message.match(/^Your identity verification \(NIC: (.+)\) has been submitted successfully and is currently under review by administrators\.$/);
        if (match) return t('notifications_page.verification_submitted_message', { nic: match[1] });
        match = message.match(/^New Member Verification Submitted: (.+) \(NIC: (.+)\) is awaiting approval\.$/);
        if (match) return t('notifications_page.verification_new_submission_message', { name: match[1], nic: match[2] });
        break;
      case 'VERIFICATION_APPROVED':
        match = message.match(/^(?:🎉 )?Congratulations! Your identity verification \(NIC: (.+)\) has been approved\. You are now authorized to join Seettu circles\.$/);
        if (match) return t('notifications_page.verification_approved_message', { nic: match[1] });
        break;
      case 'VERIFICATION_REJECTED':
        match = message.match(/^(?:⚠️ )?Your identity verification was rejected: (.+)\. Please re-submit clear documents\.$/);
        if (match) return t('notifications_page.verification_rejected_message', { reason: match[1] });
        break;
      case 'KYC_VERIFIED':
        if (message.endsWith('You are now an authorized Group Organizer.')) return t('notifications_page.kyc_verified_organizer');
        if (message.endsWith('You can now participate in Seettu groups.')) return t('notifications_page.kyc_verified_member');
        break;
      case 'KYC_REJECTED':
        match = message.match(/^Your identity verification was rejected: (.+)$/);
        if (match) return t('notifications_page.kyc_rejected_message', { reason: match[1] });
        break;
      case 'JOIN_REQUEST':
        match = message.match(/^New join request from (.+) for group: (.+)$/);
        if (match) return t('notifications_page.join_request_message', { name: match[1], group: match[2] });
        break;
      case 'JOIN_APPROVED':
        match = message.match(/^Your request to join group '(.+)' has been approved!$/);
        if (match) return t('notifications_page.join_approved_message', { group: match[1] });
        break;
      case 'JOIN_REJECTED':
        match = message.match(/^Your request to join group '(.+)' was rejected\.$/);
        if (match) return t('notifications_page.join_rejected_message', { group: match[1] });
        break;
      case 'GROUP':
        match = message.match(/^You have been added to group: (.+)$/);
        if (match) return t('notifications_page.group_member_added', { group: match[1] });
        match = message.match(/^You have been removed from group: (.+)$/);
        if (match) return t('notifications_page.group_member_removed', { group: match[1] });
        break;
      case 'GROUP_ACTIVATED':
        match = message.match(/^Circle Full Notice: '(.+)' has officially reached full capacity \((\d+)\/(\d+) members\)! Rotational Cycle #1 is now ACTIVE and open for contributions\.$/);
        if (match) return t('notifications_page.circle_full_message', { group: match[1], members: match[2], capacity: match[3] });
        break;
      case 'KULUKKAL_DRAW':
        match = message.match(/^Kulukkal Lot Drawing Completed for '(.+)'! Cycle #1 is allocated to the Organizer \((.+)\)\. Subsequent cycles were fairly drawn\. View the full rotation schedule in your group dashboard\.$/);
        if (match) return t('notifications_page.kulukkal_draw_completed', { group: match[1], organizer: match[2] });
        match = message.match(/^Kulukkal Winner Drawn! For Cycle #(\d+) in '(.+)', the winning lot chit was drawn for (.+)\.$/);
        if (match) return t('notifications_page.kulukkal_winner_drawn', { cycle: match[1], group: match[2], winner: match[3] });
        break;
      case 'ORGANIZER_APPLICATION_SUBMITTED':
      case 'ORGANIZER_REQUEST_SUBMITTED':
        if (message === 'Your application to become a Seettu Organizer has been submitted for Administrative review.') return t('notifications_page.organizer_application_submitted');
        if (message.startsWith('Your application to become a Seettu Organizer has been submitted.')) return t('notifications_page.organizer_request_submitted');
        break;
      case 'ORGANIZER_APPLICATION':
        match = message.match(/^New organizer application from (.+) in (.+)$/);
        if (match) return t('notifications_page.organizer_application_from', { name: match[1], district: match[2] });
        break;
      case 'ORGANIZER_APPROVED':
        if (message === 'Your application to become an organizer has been approved!') return t('notifications_page.organizer_approved_message');
        break;
      case 'ORGANIZER_REJECTED':
        match = message.match(/^Your organizer application was rejected\. Reason: (.+)$/);
        if (match) return t('notifications_page.organizer_rejected_message', { reason: match[1] });
        break;
      case 'ORGANIZER_REQUEST_DECLINED':
        match = message.match(/^Your request to upgrade to Group Organizer was declined: (.+)$/);
        if (match) return t('notifications_page.organizer_upgrade_declined', { reason: match[1] });
        break;
      case 'ROTATION_STARTED':
        match = message.match(/^The spinning wheel for (.+) \(Cycle #(\d+)\) is now OPEN! Spin now to draw your payout order\.$/);
        if (match) return t('notifications_page.rotation_started_message', { group: match[1], cycle: match[2] });
        break;
      case 'DISPUTE':
        match = message.match(/^Organizer Dispute Escalation: Organizer (.+) escalated a dispute for (.+) \((.+)\)$/);
        if (match) return t('notifications_page.dispute_escalation_message', { name: match[1], dispute: match[2], disputeType: match[3] });
        match = message.match(/^New dispute raised in group: (.+) by (.+)$/);
        if (match) return t('notifications_page.dispute_group_message', { group: match[1], name: match[2] });
        match = message.match(/^New platform grievance filed: (.+)$/);
        if (match) return t('notifications_page.dispute_platform_message', { disputeType: match[1] });
        match = message.match(/^Your dispute has been (resolved|rejected)$/);
        if (match) return t('notifications_page.dispute_status_message', { status: t(`notifications_page.status_${match[1]}`) });
        break;
      case 'EMERGENCY':
        match = message.match(/^New emergency request from (.+)$/);
        if (match) return t('notifications_page.emergency_request_message', { name: match[1] });
        match = message.match(/^Your emergency request has been (resolved|rejected|approved|pending)$/);
        if (match) return t('notifications_page.emergency_status_message', { status: t(`notifications_page.status_${match[1]}`) });
        break;
      default:
        break;
    }

    return message;
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
              : t('notifications_page.personal_sub_with_user', {
                name: user?.fullName || t('notifications_page.your_account', 'your account'),
                email: user?.email || '',
                defaultValue: 'Personal notifications for {{name}} ({{email}})'
              })}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {(isAdmin || isOrganizer) && (
            <button
              className="btn btn-outline-warning btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={handleTriggerReminders}
              disabled={isTriggering}
              title={t('notifications_page.dispatch_title', 'Dispatches due payment reminders to members with upcoming cycles')}
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
                          <span>{t('notifications_page.sent_to', 'Sent to:')} {n.user.fullName || n.user.email || t('notifications_page.user_id', { userId: n.user.id })}</span>
                        </span>
                      )}
                      <small className="text-muted ms-auto d-inline-flex align-items-center">
                        <Icon name="clock" size={12} color="#94A3B8" className="me-1" />
                      </small>
                        <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : t('notifications_page.just_now', 'Just now')}</span>
                    </div>

                    <p className="mb-0 text-dark fw-medium mt-2" style={{ lineHeight: 1.5 }}>
                      {getNotificationMessage(n)}
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
                      title={t('notifications_page.mark_read_title', 'Mark as read')}
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