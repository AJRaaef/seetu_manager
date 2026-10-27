import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getAdminDashboard, getUserDashboard } from '../api/dashboardApi';
import {
  getAllPayments,
  getPaymentsByMember,
  getAdvancePayments,
  getAllAdvancePayments,
  getMyPendingDues,
  recordPayment,
  updatePayment,
  uploadPaymentEvidence
} from '../api/paymentApi';
import { getGroupsByUser, getGroupById } from '../api/groupApi';
import api from '../api/axios';
import Icon from '../components/Icons';
import ReviewPayoutModal from '../components/ReviewPayoutModal';
import DisbursementVoucherModal from '../components/DisbursementVoucherModal';
import PaymentReminderModal from '../components/PaymentReminderModal';
import LegalNoticeModal from '../components/LegalNoticeModal';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import DashboardAnalytics from '../components/DashboardAnalytics';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
  const canManagePayout = isAdmin || isOrganizer;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [payoutApproved, setPayoutApproved] = useState(false);
  const [advanceTotal, setAdvanceTotal] = useState(0);
  const [realUpcomingPayout, setRealUpcomingPayout] = useState(null);
  const [upcomingPayouts, setUpcomingPayouts] = useState([]);
  const [selectedUpcomingPayout, setSelectedUpcomingPayout] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCycle, setVoucherCycle] = useState(null);
  const [voucherGroup, setVoucherGroup] = useState(null);
  const [pendingDues, setPendingDues] = useState([]);
  const [loadingDues, setLoadingDues] = useState(true);
  const [overdueMembersList, setOverdueMembersList] = useState([]);
  const [reminderTargetPayment, setReminderTargetPayment] = useState(null);
  const [legalNoticeTargetPayment, setLegalNoticeTargetPayment] = useState(null);

  const userId = user?.userId || user?.id;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = isAdmin ? await getAdminDashboard() : await getUserDashboard(userId);
        setStats(res?.data || res);
      } catch (error) {
        console.error('Failed to load dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdvance = async () => {
      try {
        const res = isAdmin ? await getAllAdvancePayments() : (userId ? await getAdvancePayments(userId) : null);
        const list = res?.data?.data || res?.data || res || [];
        if (Array.isArray(list)) {
          const sum = list.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
          setAdvanceTotal(sum);
        }
      } catch (err) {
        console.error('Failed to fetch advance payments for dashboard', err);
      }
    };

    const fetchRecentPayments = async () => {
      setLoadingPayments(true);
      try {
        let payRes;
        if (isAdmin) {
          payRes = await getAllPayments();
        } else if (userId) {
          payRes = await getPaymentsByMember(userId);
        }
        const list = payRes?.data || payRes || [];
        const formatted = list
          .filter((p) => {
            const memberRole = (p.memberRole || p.userRole || p.role || '').toString().toUpperCase();
            const memberName = (p.memberName || p.user?.fullName || '').toString();
            return memberRole !== 'ADMIN' && !memberName.toLowerCase().includes('system admin');
          })
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            member: p.memberName || 'Member',
            amount: Number(p.amount) || 0,
            status: (p.status || 'PAID').toUpperCase(),
            date: p.paymentDate || p.createdAt?.split('T')[0] || '-',
            group: p.groupName || 'General Group',
            cycle: p.cycleNumber ? `Cycle ${p.cycleNumber}` : 'Cycle 1',
            recordedBy: p.recordedByName || (p.status === 'PAID' ? 'Organizer' : '—'),
            method: 'Cash (Offline)',
            notes: p.notes || ''
          }));
        setRecentPayments(formatted);
      } catch (err) {
        console.error('Failed to load recent payments from database', err);
        setRecentPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    const fetchUpcomingPayout = async () => {
      if (isAdmin || !userId) {
        setRealUpcomingPayout(null);
        setUpcomingPayouts([]);
        return;
      }
      try {
        const res = await getGroupsByUser(userId);
        const groupList = res?.data || res || [];
        if (Array.isArray(groupList) && groupList.length > 0) {
          const upcomingList = [];
          for (const g of groupList) {
            const totalCycles = (Array.isArray(g.cycles) && g.cycles.length > 0) ? g.cycles.length : (g.memberCount || 1);
            const totalPot = Number(g.contributionAmount || 0) * (g.memberCount || (g.members?.length) || 1);
            const isGroupCompleted = g.status === 'COMPLETED' || (Array.isArray(g.cycles) && g.cycles.length > 0 && g.cycles.every(c => c.status === 'COMPLETED' || c.isFullyPaid));

            if (isGroupCompleted) {
              upcomingList.push({
                groupId: g.id,
                groupName: g.name,
                cycle: `${g.name} • All ${totalCycles} Cycles Completed`,
                recipient: 'All Circle Members Received Rotational Payouts',
                isUserRecipient: false,
                date: 'All Cycles Complete',
                daysRemaining: '100% Fully Settled & Disbursed',
                amount: `${totalPot.toLocaleString()} LKR`,
                isCompleted: true,
                cycleId: null
              });
              continue;
            }

            if (Array.isArray(g.cycles) && g.cycles.length > 0) {
              const targetCycle = g.cycles.find(c => c.status === 'ACTIVE' && !c.isFullyPaid)
                || g.cycles.find(c => c.status !== 'COMPLETED' && !c.isFullyPaid)
                || g.cycles[0];

              if (targetCycle) {
                let recipient = targetCycle.payoutMemberName;
                if (!recipient || recipient === 'Unassigned' || recipient === 'Pending Rotation Selection') {
                  if (targetCycle.cycleNumber === 1) {
                    recipient = g.createdByName || (Array.isArray(g.members) ? g.members[0]?.fullName : 'Organizer');
                  } else if (Array.isArray(g.members) && g.members.length > 0) {
                    const organizerId = g.createdById;
                    const otherMembers = g.members.filter(m => !organizerId || String(m.userId || m.id) !== String(organizerId));
                    if (otherMembers.length > 0) {
                      const idx = (targetCycle.cycleNumber - 2) % otherMembers.length;
                      recipient = otherMembers[idx]?.fullName;
                    } else {
                      const idx = (targetCycle.cycleNumber - 1) % g.members.length;
                      recipient = g.members[idx]?.fullName;
                    }
                  }
                }
                const isUser = (String(targetCycle.payoutMemberId) === String(userId) || (recipient && recipient === user?.fullName));
                const daysRemaining = targetCycle.endDate
                  ? Math.max(0, Math.ceil((new Date(targetCycle.endDate) - new Date()) / 86400000))
                  : (stats?.nextPaymentDueDays || 0);

                upcomingList.push({
                  groupId: g.id,
                  groupName: g.name,
                  cycle: `${g.name} • Cycle #${targetCycle.cycleNumber} of ${totalCycles}`,
                  recipient: isUser ? `${recipient || 'You'} (Your Payout Turn)` : (recipient || 'Rotation Selection'),
                  isUserRecipient: isUser,
                  date: targetCycle.endDate || targetCycle.startDate || '-',
                  daysRemaining: `${daysRemaining} days remaining`,
                  amount: `${totalPot.toLocaleString()} LKR`,
                  isCompleted: false,
                  cycleId: targetCycle.id
                });
              }
            }
          }
          setUpcomingPayouts(upcomingList);
          setRealUpcomingPayout(upcomingList[0] || null);
        } else {
          setUpcomingPayouts([]);
          setRealUpcomingPayout(null);
        }
      } catch (err) {
        console.error('Failed to load real upcoming payout from database', err);
        setUpcomingPayouts([]);
        setRealUpcomingPayout(null);
      }
    };



    const fetchOverdueMembers = async () => {
      if (!isAdmin && !isOrganizer) {
        setOverdueMembersList([]);
        return;
      }
      try {
        const payRes = await getAllPayments();
        const list = payRes?.data || payRes || [];
        const today = new Date();
        const overdue = list
          .filter((p) => {
            const status = (p.status || '').toUpperCase();
            const isPast = p.paymentDate ? new Date(p.paymentDate) < today : false;
            return status === 'OVERDUE' || (status !== 'PAID' && status !== 'LATE' && isPast);
          })
          .map((p) => {
            const dueDate = p.paymentDate || p.createdAt?.split('T')[0] || '-';
            const daysOverdue = p.paymentDate
              ? Math.max(1, Math.ceil((today - new Date(p.paymentDate)) / 86400000))
              : 1;
            return {
              id: p.id,
              member: p.memberName || 'Member',
              memberId: p.memberId,
              memberPhone: p.memberPhone || '',
              memberEmail: p.memberEmail || '',
              amount: Number(p.amount) || 0,
              status: (p.status || 'OVERDUE').toUpperCase(),
              date: dueDate,
              group: p.groupName || 'General Group',
              groupName: p.groupName || 'General Group',
              cycle: p.cycleNumber ? `Cycle #${p.cycleNumber}` : 'Cycle 1',
              daysOverdue: daysOverdue,
              isCritical: daysOverdue >= 7
            };
          });
        setOverdueMembersList(overdue);
      } catch (err) {
        console.error('Failed to load overdue members for organizer desk', err);
        setOverdueMembersList([]);
      }
    };

    const fetchPendingDues = async () => {
      if (isAdmin || !userId) {
        setPendingDues([]);
        setLoadingDues(false);
        return;
      }
      setLoadingDues(true);
      try {
        const res = await getMyPendingDues();
        const list = res?.data || (Array.isArray(res) ? res : []);
        setPendingDues(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load pending dues from database', err);
        setPendingDues([]);
      } finally {
        setLoadingDues(false);
      }
    };

    if (isAdmin || userId) {
      fetchDashboard();
      fetchRecentPayments();
      fetchAdvance();
      fetchUpcomingPayout();
      fetchPendingDues();
      fetchOverdueMembers();
    } else {
      setLoading(false);
      setLoadingPayments(false);
    }
  }, [isAdmin, userId]);

  // Dynamic values calculated directly from database stats
  const activeGroupsCount = stats?.activeGroups ?? 0;
  const totalMembersCount = stats?.totalMembers ?? 0;
  const disciplineScore = stats?.disciplineScore ?? 100;
  const completionRate = stats?.overallCompletionRate != null
    ? Math.round(stats.overallCompletionRate)
    : 100;

  // Real Upcoming Payout strictly from MySQL database
  const hasUpcomingPayout = !isAdmin && !!realUpcomingPayout;
  const upcomingPayout = realUpcomingPayout || {};

  const handleApprovePayout = async (data) => {
    try {
      if (data?.cycleId) {
        await api.put(`/payment-cycles/${data.cycleId}/status?status=COMPLETED`);
      }
      setPayoutApproved(true);
      alert(`Payout of ${data.amount} to ${data.recipient} approved successfully! All circle members have been notified.`);
      fetchUpcomingPayout();
      fetchRecentPayments();
    } catch (err) {
      console.error('Failed to approve payout', err);
      alert(err.response?.data?.message || 'Failed to approve payout in database.');
    }
  };



  const handleOpenCompletedVoucher = async (item) => {
    try {
      const res = await getGroupById(item.groupId);
      const groupData = res?.data || res;
      if (groupData) {
        const cycles = groupData.cycles || [];
        const completedCycle = cycles.find((c) => c.status === 'COMPLETED') || cycles[0];
        setVoucherCycle(completedCycle);
        setVoucherGroup(groupData);
        setShowVoucherModal(true);
      }
    } catch (err) {
      console.error('Failed to load completed voucher', err);
      window.location.href = `/groups/${item.groupId}`;
    }
  };

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const getDisciplineBadge = (score) => {
    if (score >= 90) return { label: t('dashboard_page.badges.excellent', 'Excellent'), bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' };
    if (score >= 75) return { label: t('dashboard_page.badges.good', 'Good'), bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' };
    if (score >= 60) return { label: t('dashboard_page.badges.fair', 'Fair'), bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    if (score >= 40) return { label: t('dashboard_page.badges.poor', 'Poor'), bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' };
    return { label: t('dashboard_page.badges.high_risk', 'High Risk'), bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge-paid">{t('status.PAID', 'Paid')}</span>;
      case 'PENDING':
        return <span className="badge-pending">{t('status.PENDING', 'Pending')}</span>;
      case 'OVERDUE':
        return <span className="badge-overdue">{t('status.OVERDUE', 'Overdue')}</span>;
      default:
        return <span className="badge-paid">{t(`status.${status}`, status)}</span>;
    }
  };

  const currentRoleName = isAdmin 
    ? t('dashboard_page.roles.admin', 'Admin') 
    : isOrganizer 
    ? t('dashboard_page.roles.organizer', 'Organizer') 
    : t('dashboard_page.roles.member', 'Member');

  return (
    <div className="dashboard-container pb-4">
      {/* Welcome Heading */}
      <div className="mb-4">
        <h2 className="dashboard-title">
          {t('dashboard_page.welcome', 'Welcome back')}, {user?.fullName || currentRoleName}
        </h2>
        <p className="dashboard-subtitle">
          {isAdmin 
            ? t('dashboard_page.subtitles.admin', 'Executive overview of all Seettu circles, cash movements, and compliance metrics across Sri Lanka.')
            : isOrganizer
            ? t('dashboard_page.subtitles.organizer', 'Manage your active circles, track monthly collections, and oversee scheduled payouts.')
            : t('dashboard_page.subtitles.member', 'Here is a quick look at your current Seettu circles, savings progress, and upcoming payouts.')}
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        {/* Active Groups */}
        <div className={`col-12 col-sm-6 ${isAdmin ? 'col-xl-4' : 'col-md-4 col-xl'}`}>
          <div className="metric-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start w-100 mb-2">
              <div>
                <div className="metric-value">{activeGroupsCount}</div>
                <div className="metric-label">{t('dashboard_page.metrics.active_groups', 'Active Groups')}</div>
              </div>
              <div className="text-dark opacity-75">
                <Icon name="users" size={26} color="#0F2F3D" />
              </div>
            </div>
            <div className="metric-subtext">{t('dashboard_page.metrics.active_groups_sub', 'Total active Seettu groups')}</div>
          </div>
        </div>

        {/* Total / Group Members */}
        <div className={`col-12 col-sm-6 ${isAdmin ? 'col-xl-4' : 'col-md-4 col-xl'}`}>
          <div className="metric-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start w-100 mb-2">
              <div>
                <div className="metric-value">{totalMembersCount}</div>
                <div className="metric-label">
                  {isAdmin 
                    ? t('dashboard_page.metrics.total_members', 'Total Members') 
                    : t('dashboard_page.metrics.group_members', 'Group Members')}
                </div>
              </div>
              <div className="text-dark opacity-75">
                <Icon name="user-check" size={26} color="#0F2F3D" />
              </div>
            </div>
            <div className="metric-subtext">{t('dashboard_page.metrics.members_sub', 'Enrolled participants')}</div>
          </div>
        </div>

        {!isAdmin && (
          <div className="col-12 col-sm-6 col-md-4 col-xl">
            <div className="metric-card h-100 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start w-100 mb-2">
                <div>
                  <div className="metric-value">{completionRate}%</div>
                  <div className="metric-label">{t('dashboard_page.metrics.completion_rate', 'Completion Rate')}</div>
                </div>
                <div className="text-dark opacity-75">
                  <Icon name="check-square" size={26} color="#0F2F3D" />
                </div>
              </div>
              <div className="custom-progress w-100">
                <div className="custom-progress-bar" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="col-12 col-sm-6 col-md-4 col-xl">
            <div className="metric-card h-100 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start w-100 mb-2">
                <div>
                  <div className="metric-value" style={{ fontSize: '1.4rem', color: disciplineScore >= 90 ? '#059669' : disciplineScore >= 75 ? '#D97706' : '#DC2626' }}>
                    {disciplineScore}<span style={{ fontSize: '0.85rem', color: '#64748B' }}> / 100</span>
                  </div>
                  <div className="metric-label">{t('dashboard_page.metrics.discipline_score', 'Discipline Score')}</div>
                </div>
                <div className="text-success opacity-75">
                  <Icon name="award" size={26} color="#059669" />
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top">
                <div className="metric-subtext mb-0">{t('dashboard_page.metrics.discipline_sub', 'Reputation & trust index')}</div>
                {(() => {
                  const badge = getDisciplineBadge(disciplineScore);
                  return (
                    <span
                      className="badge rounded-pill fw-semibold px-2 py-0.5"
                      style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontSize: '0.72rem' }}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Advance Contributions Card */}
        <div className={`col-12 col-sm-6 ${isAdmin ? 'col-xl-4' : 'col-md-4 col-xl'}`}>
          <div className="metric-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start w-100 mb-2">
              <div>
                <div className="metric-value" style={{ fontSize: '1.4rem' }}>
                  {advanceTotal.toLocaleString()} LKR
                </div>
                <div className="metric-label">{t('dashboard_page.metrics.advance_disbursed', 'Advance Contributions')}</div>
              </div>
              <div className="text-teal opacity-75">
                <Icon name="advance" size={26} color="#008CA7" />
              </div>
            </div>
            <div className="metric-subtext">{t('dashboard_page.metrics.advance_sub', 'Pre-paid cycle balance')}</div>
          </div>
        </div>
      </div>

      {/* Executive Analytical Graphs (Unique for Organizer & Admin Only) */}
      {(isAdmin || isOrganizer) && (
        <DashboardAnalytics
          stats={stats}
          recentPayments={recentPayments}
          isAdmin={isAdmin}
          isOrganizer={isOrganizer}
        />
      )}



      {/* Overdue Member Collections & Legal Demand Desk (Organizer / Admin Oversight) */}
      {(isOrganizer || isAdmin) && overdueMembersList.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom border-danger-subtle">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-danger text-white" style={{ width: '38px', height: '38px' }}>
                <Icon name="alert-triangle" size={18} color="#FFFFFF" />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-danger" style={{ fontSize: '1.1rem' }}>
                  Overdue Member Collections & Notice Desk
                </h5>
                <p className="text-muted small mb-0">
                  {overdueMembersList.length} member installment(s) currently past due across your circles. Follow up via WhatsApp, SMS, or issue formal statutory legal demand notices.
                </p>
              </div>
            </div>
            <span className="badge rounded-pill bg-danger px-3 py-1.5 fw-bold fs-6">
              {overdueMembersList.length} Overdue
            </span>
          </div>

          <div className="table-responsive bg-white rounded-3 border overflow-hidden">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-2.5 px-3 small fw-semibold text-muted">Member / Contact</th>
                  <th className="py-2.5 px-3 small fw-semibold text-muted">Circle & Cycle</th>
                  <th className="py-2.5 px-3 small fw-semibold text-muted">Overdue Amount</th>
                  <th className="py-2.5 px-3 small fw-semibold text-muted">Delay Duration</th>
                  <th className="py-2.5 px-3 small fw-semibold text-muted text-end">Action & Recovery Channels</th>
                </tr>
              </thead>
              <tbody>
                {overdueMembersList.map((item, idx) => {
                  const isCritical = item.daysOverdue >= 7;
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark">{item.member}</div>
                        <div className="small text-muted d-flex align-items-center gap-2 mt-0.5">
                          {item.memberPhone && (
                            <span className="d-inline-flex align-items-center gap-1">
                              <Icon name="phone" size={12} color="#64748B" />
                              <span>{item.memberPhone}</span>
                            </span>
                          )}
                          {item.memberEmail && (
                            <span className="d-inline-flex align-items-center gap-1">
                              <Icon name="mail" size={12} color="#64748B" />
                              <span>{item.memberEmail}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="fw-semibold text-dark">{item.group}</div>
                        <div className="small text-muted">{item.cycle}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="fw-bold text-danger fs-6">{Number(item.amount).toLocaleString()} LKR</div>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Due: {item.date}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge rounded-pill fw-semibold px-2.5 py-1 ${isCritical ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>
                          {isCritical ? `${item.daysOverdue} Days Late (Critical)` : `${item.daysOverdue} Days Late`}
                        </span>
                        {isCritical && (
                          <div className="text-danger small fw-semibold mt-1" style={{ fontSize: '0.72rem' }}>
                            -10 pts Score Penalty Applied
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          {/* Multi-Channel Reminder Button (WhatsApp / SMS / Email) */}
                          <button
                            type="button"
                            onClick={() => setReminderTargetPayment(item)}
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-xs"
                            title="Send payment reminder via WhatsApp, SMS, or Email"
                          >
                            <Icon name="message-square" size={14} />
                            <span>Remind (WhatsApp/SMS)</span>
                          </button>

                          {/* Formal Legal Notice Demand */}
                          <button
                            type="button"
                            onClick={() => setLegalNoticeTargetPayment(item)}
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-xs ${
                              isCritical ? 'btn-danger text-white' : 'btn-outline-danger'
                            }`}
                            title="Issue formal statutory demand notice under The Cheetus Ordinance"
                          >
                            <Icon name="shield" size={14} />
                            <span>{isCritical ? 'Issue Legal Notice' : 'Legal Notice'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Installments & Payment Reminders (Action Required for Unsettled Members) */}
      {!isAdmin && pendingDues.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <Icon name="alert-circle" size={20} color="#D97706" />
              <span>Pending Installments & Payment Reminders</span>
            </h5>
            <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 small">
              {pendingDues.length} {pendingDues.length === 1 ? 'Action Required' : 'Actions Required'}
            </span>
          </div>

          <div className="d-flex flex-column gap-3">
            {pendingDues.map((due, idx) => {
              const isOverdue = due.status === 'OVERDUE' || due.isOverdue;
              const isDueToday = due.status === 'DUE_TODAY';
              const isAwaiting = due.status === 'AWAITING_APPROVAL' || due.hasSlipUploaded;
              const isDueSoon = due.status === 'DUE_SOON';

              const theme = isOverdue
                ? {
                    bg: '#FEF2F2',
                    border: '#F87171',
                    badgeBg: '#DC2626',
                    badgeText: '#FFFFFF',
                    accentColor: '#991B1B',
                    icon: 'alert-triangle',
                    iconColor: '#DC2626',
                    btnClass: 'btn-danger'
                  }
                : isDueToday
                ? {
                    bg: '#FFFBEB',
                    border: '#FBBF24',
                    badgeBg: '#D97706',
                    badgeText: '#FFFFFF',
                    accentColor: '#92400E',
                    icon: 'clock',
                    iconColor: '#D97706',
                    btnClass: 'btn-warning text-dark'
                  }
                : isAwaiting
                ? {
                    bg: '#F0FDF4',
                    border: '#86EFAC',
                    badgeBg: '#16A34A',
                    badgeText: '#FFFFFF',
                    accentColor: '#166534',
                    icon: 'check-circle',
                    iconColor: '#16A34A',
                    btnClass: 'btn-outline-success'
                  }
                : {
                    bg: '#F8FAFC',
                    border: '#CBD5E1',
                    badgeBg: '#0284C7',
                    badgeText: '#FFFFFF',
                    accentColor: '#0F172A',
                    icon: 'bell',
                    iconColor: '#0284C7',
                    btnClass: 'btn-primary'
                  };

              return (
                <div
                  key={due.cycleId || idx}
                  className="card border shadow-sm rounded-4 p-3 p-md-4"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    borderWidth: '1.5px'
                  }}
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle p-2.5 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: `1px solid ${theme.border}` }}
                      >
                        <Icon name={theme.icon} size={24} color={theme.iconColor} />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span
                            className="badge rounded-pill fw-semibold px-2.5 py-1"
                            style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, fontSize: '0.75rem' }}
                          >
                            {isOverdue
                              ? `Overdue (${due.daysOverdue} days late)`
                              : isDueToday
                              ? 'Due Today'
                              : isAwaiting
                              ? 'Verification Pending'
                              : `Due in ${due.daysRemaining} days`}
                          </span>
                          <span className="small text-muted fw-semibold">
                            {due.groupName} • Cycle #{due.cycleNumber} of {due.totalCycles}
                          </span>
                        </div>

                        <h5 className="fw-bold mb-1" style={{ color: theme.accentColor }}>
                          {isOverdue
                            ? (due.daysOverdue >= 7
                              ? `Critical Overdue: Installment ${due.daysOverdue} Days Late!`
                              : `Payment Overdue: Installment ${due.daysOverdue} Days Late`)
                            : isDueToday
                            ? 'Installment Payment Due Today'
                            : isAwaiting
                            ? 'Deposit Slip Under Review by Organizer'
                            : 'Upcoming Installment Reminder'}
                        </h5>

                        <p className="small text-secondary mb-0" style={{ maxWidth: '650px' }}>
                          {isOverdue
                            ? (due.daysOverdue >= 7
                              ? `This installment was due on ${due.dueDate}. A 7-day overdue status applies a penalty on your Discipline Score (-10 pts). Please settle immediately with organizer ${due.organizerName}.`
                              : `This installment was due on ${due.dueDate} (${due.daysOverdue} days ago). Please settle to maintain your 100% on-time reputation rating.`)
                            : isDueToday
                            ? `Your installment of ${Number(due.amount).toLocaleString()} LKR is due today (${due.dueDate}). Settle today to prevent delay penalties.`
                            : isAwaiting
                            ? `You uploaded your payment slip. Organizer ${due.organizerName} is reviewing and confirming your payment.`
                            : `Cycle #${due.cycleNumber} collection is active. Due date is ${due.dueDate} (${due.daysRemaining} days remaining).`}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex flex-row flex-md-column align-items-center align-items-md-end justify-content-between w-100 w-md-auto pt-2 pt-md-0 border-top border-md-top-0 gap-2">
                      <div className="text-start text-md-end">
                        <div className="small text-muted" style={{ fontSize: '0.78rem' }}>Amount Due</div>
                        <div className="fs-4 fw-bold" style={{ color: theme.accentColor, letterSpacing: '-0.5px' }}>
                          {Number(due.amount).toLocaleString()} LKR
                        </div>
                      </div>

                      <Link
                        to={`/groups/${due.groupId}`}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                      >
                        <span>View Circle</span>
                        <Icon name="arrow-right" size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Payout Banner Card (For Members & Organizers participating in Seettu) */}
      {!isAdmin && (
        upcomingPayouts.length > 0 ? (
          <div className="d-flex flex-column gap-3 mb-4">
            {upcomingPayouts.map((item, idx) => (
              <div
                key={item.groupId || idx}
                className="upcoming-payout-banner"
                style={item.isCompleted ? {
                  background: 'linear-gradient(135deg, #0F5132 0%, #198754 100%)',
                  boxShadow: '0 8px 24px rgba(25, 135, 84, 0.2)'
                } : undefined}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon
                      name={item.isCompleted ? 'check-circle' : item.isUserRecipient ? 'user-check' : 'bell'}
                      size={20}
                      color={item.isCompleted ? '#34D399' : item.isUserRecipient ? '#FACC15' : '#FFFFFF'}
                    />
                    <span className="fw-bold fs-6" style={{ color: item.isCompleted ? '#34D399' : item.isUserRecipient ? '#FACC15' : '#FFFFFF' }}>
                      {item.isCompleted
                        ? 'All Rotation Cycles Completed & Disbursed'
                        : item.isUserRecipient
                          ? 'Your Scheduled Payout Turn'
                          : t('dashboard_page.payout_card.title', 'Upcoming Rotational Payout')}
                    </span>
                  </div>
                  <div className="small text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>
                    {item.cycle}
                  </div>
                  <h3 className="fw-bold mb-1 text-white">{item.recipient}</h3>
                  <div className="small text-white-50 mb-2">
                    {t('common.date', 'Date')} : {item.date}
                  </div>
                  <div className="fw-bold small" style={{ color: item.isCompleted ? '#34D399' : '#FACC15' }}>
                    {item.daysRemaining}
                  </div>
                </div>

                <div className="text-end">
                  <div className="display-6 fw-bold text-white mb-3" style={{ letterSpacing: '0.5px' }}>
                    {item.amount}
                  </div>
                  {item.isCompleted ? (
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                      <button
                        onClick={() => handleOpenCompletedVoucher(item)}
                        className="btn btn-light rounded-pill px-3.5 py-2 fw-semibold text-success shadow-sm border-0 d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: '0.88rem' }}
                      >
                        <Icon name="award" size={16} color="#198754" />
                        <span>Payout Voucher</span>
                      </button>
                      <Link
                        to={`/groups/${item.groupId}`}
                        className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.88rem' }}
                      >
                        <span>View Ledger</span>
                        <Icon name="arrow-right" size={14} />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUpcomingPayout(item);
                        setShowPayoutModal(true);
                      }}
                      className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm border-0"
                      style={{ fontSize: '0.9rem' }}
                    >
                      {canManagePayout
                        ? t('dashboard_page.payout_card.review_btn', 'Review Payout')
                        : t('common.view', 'View Payout Details')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card shadow-sm border-0 mb-4 p-4 text-center rounded-4" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="d-flex flex-column align-items-center justify-content-center py-2">
              <Icon name="calendar" size={28} color="#94A3B8" />
              <div className="fw-bold text-dark mt-2 mb-1">No Upcoming Payouts Scheduled</div>
              <div className="text-muted small">Join or create a Seettu group to begin contribution cycles and scheduled payouts.</div>
            </div>
          </div>
        )
      )}

      {/* Recent Payment Table Card */}
      <div className="table-card shadow-sm">
        <div className="table-card-header d-flex justify-content-between align-items-center">
          <span>{t('dashboard_page.recent_payments.title', 'Recent Payments')}</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                  {t('dashboard_page.recent_payments.col_member', 'Member')}
                </th>
                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                  {t('dashboard_page.recent_payments.col_amount', 'Amount')}
                </th>
                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '0.85rem' }}>
                  {t('dashboard_page.recent_payments.col_status', 'Status')}
                </th>
                <th className="py-3 px-4 text-muted fw-semibold text-end" style={{ fontSize: '0.85rem' }}>
                  {t('dashboard_page.recent_payments.col_date', 'Date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingPayments ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    {t('common.loading', 'Loading recent payments...')}
                  </td>
                </tr>
              ) : recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    {t('dashboard_page.recent_payments.no_payments', 'No recent payments found.')}
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => handleRowClick(payment)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="py-3 px-4 fw-semibold text-dark">{payment.member}</td>
                    <td className="py-3 px-4 text-muted">{payment.amount.toLocaleString()} LKR</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(payment.status)}</td>
                    <td className="py-3 px-4 text-end text-muted">{payment.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ReviewPayoutModal
        show={showPayoutModal}
        onHide={() => setShowPayoutModal(false)}
        payoutData={{
          recipient: selectedUpcomingPayout?.recipient || upcomingPayout.recipient,
          cycle: selectedUpcomingPayout?.cycle || upcomingPayout.cycle,
          scheduledDate: selectedUpcomingPayout?.date || upcomingPayout.date,
          amount: selectedUpcomingPayout?.amount || upcomingPayout.amount,
          cycleId: selectedUpcomingPayout?.cycleId || upcomingPayout.cycleId
        }}
        onApprove={handleApprovePayout}
        canManage={canManagePayout}
      />

      <PaymentDetailsModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        payment={selectedPayment}
      />




      
      {/* Multi-Channel Payment Reminder Modal (WhatsApp / SMS / Email / In-App) */}
      {reminderTargetPayment && (
        <PaymentReminderModal
          show={!!reminderTargetPayment}
          onHide={() => setReminderTargetPayment(null)}
          payment={reminderTargetPayment}
        />
      )}

      {/* Formal Statutory Legal Demand Notice Modal (The Cheetus Ordinance No. 61 of 1935) */}
      {legalNoticeTargetPayment && (
        <LegalNoticeModal
          show={!!legalNoticeTargetPayment}
          onHide={() => setLegalNoticeTargetPayment(null)}
          payment={legalNoticeTargetPayment}
          organizerName={user?.fullName || 'Circle Organizer'}
        />
      )}

      {/* Official Rotational Payout Disbursement Voucher Modal */}
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

export default Dashboard;
