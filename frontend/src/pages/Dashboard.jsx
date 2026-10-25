import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getAdminDashboard, getUserDashboard } from '../api/dashboardApi';
import { getAllPayments, getPaymentsByMember, getAdvancePayments, getAllAdvancePayments } from '../api/paymentApi';
import { getGroupsByUser } from '../api/groupApi';
import Icon from '../components/Icons';
import ReviewPayoutModal from '../components/ReviewPayoutModal';
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
        return;
      }
      try {
        const res = await getGroupsByUser(userId);
        const groupList = res?.data || res || [];
        if (Array.isArray(groupList)) {
          for (const g of groupList) {
            if (Array.isArray(g.cycles)) {
              const matchedCycle = g.cycles.find(
                (c) => (String(c.payoutMemberId) === String(userId) || String(c.payoutMember?.id) === String(userId)) && c.status !== 'COMPLETED'
              );
              if (matchedCycle) {
                const totalPot = Number(g.contributionAmount || 0) * (g.memberCount || 1);
                const daysRemaining = matchedCycle.endDate
                  ? Math.max(0, Math.ceil((new Date(matchedCycle.endDate) - new Date()) / 86400000))
                  : (stats?.nextPaymentDueDays || 0);
                setRealUpcomingPayout({
                  cycle: `${g.name} • Cycle #${matchedCycle.cycleNumber}`,
                  recipient: matchedCycle.payoutMemberName || user?.fullName || 'Member',
                  date: matchedCycle.endDate || matchedCycle.startDate || '-',
                  daysRemaining: `${daysRemaining} days remaining`,
                  amount: `${totalPot.toLocaleString()} LKR`,
                  cycleId: matchedCycle.id
                });
                return;
              }
            }
          }
        }
        setRealUpcomingPayout(null);
      } catch (err) {
        console.error('Failed to load real upcoming payout from database', err);
        setRealUpcomingPayout(null);
      }
    };

    if (isAdmin || userId) {
      fetchDashboard();
      fetchRecentPayments();
      fetchAdvance();
      fetchUpcomingPayout();
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

  const handleApprovePayout = (data) => {
    setPayoutApproved(true);
    alert(`Payout of ${data.amount} to ${data.recipient} approved successfully!`);
    fetchRecentPayments();
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

      {/* Upcoming Payout Banner Card (For Members & Organizers participating in Seettu) */}
      {!isAdmin && (
        hasUpcomingPayout ? (
          <div className="upcoming-payout-banner mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Icon name={payoutApproved ? 'check-circle' : 'megaphone'} size={20} color={payoutApproved ? '#34D399' : '#FACC15'} />
                <span className="fw-bold fs-6" style={{ color: payoutApproved ? '#34D399' : '#FFFFFF' }}>
                  {payoutApproved 
                    ? t('dashboard_page.payout_card.approved_btn', 'Payout Approved & Disbursed') 
                    : t('dashboard_page.payout_card.title', 'Upcoming Rotational Payout')}
                </span>
              </div>
              <div className="small text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>
                {upcomingPayout.cycle}
              </div>
              <h3 className="fw-bold mb-1 text-white">{upcomingPayout.recipient}</h3>
              <div className="small text-white-50 mb-2">
                {t('common.date', 'Date')} : {upcomingPayout.date}
              </div>
              <div className="fw-bold small" style={{ color: payoutApproved ? '#34D399' : '#FACC15' }}>
                {payoutApproved ? t('dashboard_page.payout_card.approved_btn', 'Disbursed to Member') : upcomingPayout.daysRemaining}
              </div>
            </div>

            <div className="text-end">
              <div className="display-6 fw-bold text-white mb-3" style={{ letterSpacing: '0.5px' }}>
                {upcomingPayout.amount}
              </div>
              {payoutApproved ? (
                <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-success text-white fw-semibold small shadow-sm">
                  <span>✓</span> {t('dashboard_page.payout_card.approved_btn', 'Approved & Disbursed')}
                </div>
              ) : (
                <button
                  onClick={() => setShowPayoutModal(true)}
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
          recipient: upcomingPayout.recipient,
          cycle: upcomingPayout.cycle,
          scheduledDate: upcomingPayout.date,
          amount: upcomingPayout.amount
        }}
        onApprove={handleApprovePayout}
        canManage={canManagePayout}
      />

      <PaymentDetailsModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default Dashboard;
