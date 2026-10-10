import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAdminDashboard, getUserDashboard } from '../api/dashboardApi';
import { getAllPayments, getPaymentsByMember, getAdvancePayments, getAllAdvancePayments } from '../api/paymentApi';
import Icon from '../components/Icons';
import ReviewPayoutModal from '../components/ReviewPayoutModal';
import PaymentDetailsModal from '../components/PaymentDetailsModal';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [payoutApproved, setPayoutApproved] = useState(false);
  const [advanceTotal, setAdvanceTotal] = useState(0);

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

    if (isAdmin || userId) {
      fetchDashboard();
      fetchRecentPayments();
      fetchAdvance();
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

  // Upcoming payout data (shown when active groups or payments exist)
  const hasUpcomingPayout = activeGroupsCount > 0 || recentPayments.length > 0;
  const upcomingPayout = {
    cycle: 'Cycle 1 Payout',
    recipient: user?.fullName || 'Member',
    date: new Date(Date.now() + (stats?.nextPaymentDueDays || 5) * 86400000).toISOString().split('T')[0],
    daysRemaining: `${stats?.nextPaymentDueDays || 5} days remaining`,
    amount: '12,000 LKR'
  };

  const handleApprovePayout = (data) => {
    setPayoutApproved(true);
    const payoutRecord = {
      id: 'PAYOUT-' + Date.now(),
      member: `${data.recipient} (Payout Disbursed)`,
      amount: parseInt(String(data.amount).replace(/[^0-9]/g, '')) || 12000,
      status: 'PAID',
      date: new Date().toISOString().split('T')[0],
      group: data.cycle || 'Cycle 1 Payout',
      cycle: data.cycle,
      recordedBy: user?.fullName || 'Organizer',
      method: 'Bank / Cash Transfer',
      notes: 'Approved payout disbursement'
    };
    setRecentPayments((prev) => [payoutRecord, ...prev]);
    alert(`✓ Payout of ${data.amount} to ${data.recipient} approved & disbursed successfully!`);
  };

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge-paid">Paid</span>;
      case 'PENDING':
        return <span className="badge-pending">Pending</span>;
      case 'OVERDUE':
        return <span className="badge-overdue">Overdue</span>;
      default:
        return <span className="badge-paid">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container pb-4">
      {/* Welcome Heading */}
      <div className="mb-4">
        <h2 className="dashboard-title">Welcome back, {user?.fullName || 'Organizer'}</h2>
        <p className="dashboard-subtitle">
          Here is a quick look at your current Seettu groups and member contributions for this month.
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
                <div className="metric-label">Active Groups</div>
              </div>
              <div className="text-dark opacity-75">
                <Icon name="users" size={26} color="#0F2F3D" />
              </div>
            </div>
            <div className="metric-subtext">Total active Seettu groups</div>
          </div>
        </div>

        {/* Total / Group Members */}
        <div className={`col-12 col-sm-6 ${isAdmin ? 'col-xl-4' : 'col-md-4 col-xl'}`}>
          <div className="metric-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start w-100 mb-2">
              <div>
                <div className="metric-value">{totalMembersCount}</div>
                <div className="metric-label">{isAdmin ? 'Total Members' : 'Group Members'}</div>
              </div>
              <div className="text-dark opacity-75">
                <Icon name="user-check" size={26} color="#0F2F3D" />
              </div>
            </div>
            <div className="metric-subtext">{isAdmin ? 'Registered system participants' : 'Participants across your groups'}</div>
          </div>
        </div>

        {!isAdmin && (
          <div className="col-12 col-sm-6 col-md-4 col-xl">
            <div className="metric-card h-100 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start w-100 mb-2">
                <div>
                  <div className="metric-value">{completionRate}%</div>
                  <div className="metric-label">Completion Rate</div>
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
                  <div className="metric-label">Discipline Score</div>
                </div>
                <div className="text-success opacity-75">
                  <Icon name="award" size={26} color="#059669" />
                </div>
              </div>
              <div className="metric-subtext">On-time payment rating</div>
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
                <div className="metric-label">Advance Contributions</div>
              </div>
              <div className="text-teal opacity-75">
                <Icon name="advance" size={26} color="#008CA7" />
              </div>
            </div>
            <div className="metric-subtext">Pre-paid cycle balance</div>
          </div>
        </div>
      </div>

      {/* Upcoming Payout Banner Card */}
      {hasUpcomingPayout ? (
        <div className="upcoming-payout-banner mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Icon name={payoutApproved ? 'check-circle' : 'megaphone'} size={20} color={payoutApproved ? '#34D399' : '#FACC15'} />
              <span className="fw-bold fs-6" style={{ color: payoutApproved ? '#34D399' : '#FFFFFF' }}>
                {payoutApproved ? '✓ Payout Approved & Disbursed' : 'Upcoming Payout'}
              </span>
            </div>
            <div className="small text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>
              {upcomingPayout.cycle}
            </div>
            <h3 className="fw-bold mb-1 text-white">{upcomingPayout.recipient}</h3>
            <div className="small text-white-50 mb-2">
              Date : {upcomingPayout.date}
            </div>
            <div className="fw-bold small" style={{ color: payoutApproved ? '#34D399' : '#FACC15' }}>
              {payoutApproved ? '✓ Disbursed to Member' : upcomingPayout.daysRemaining}
            </div>
          </div>

          <div className="text-end">
            <div className="display-6 fw-bold text-white mb-3" style={{ letterSpacing: '0.5px' }}>
              {upcomingPayout.amount}
            </div>
            {payoutApproved ? (
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-success text-white fw-semibold small shadow-sm">
                <span>✓</span> Approved & Disbursed
              </div>
            ) : (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm border-0"
                style={{ fontSize: '0.9rem' }}
              >
                Review Payout
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
      )}

      {/* Recent Payment Table Card */}
      <div className="table-card shadow-sm">
        <div className="table-card-header d-flex justify-content-between align-items-center">
          <span>Recent Payment</span>
          <span className="badge bg-light text-dark fw-normal border">Live Database Records</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Member</th>
                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Amount</th>
                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '0.85rem' }}>Status</th>
                <th className="py-3 px-4 text-muted fw-semibold text-end" style={{ fontSize: '0.85rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingPayments ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading recent payments from database...
                  </td>
                </tr>
              ) : recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    No recent payments found in the database.
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
