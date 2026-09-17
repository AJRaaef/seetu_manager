import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAdminDashboard, getUserDashboard } from '../api/dashboardApi';
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

  const userId = user?.userId || user?.id;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = isAdmin ? await getAdminDashboard() : await getUserDashboard(userId);
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin || userId) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [isAdmin, userId]);

  // Default values matching screenshots
  const activeGroupsCount = stats?.activeGroups || 3;
  const totalMembersCount = stats?.totalMembers || 24;
  const completionRate = stats?.overallCompletionRate ? Math.round(stats.overallCompletionRate) : 92;

  // Upcoming payout data from screenshot
  const upcomingPayout = {
    cycle: 'Cycle 3 Payout',
    recipient: 'Kamala Perera',
    date: '2026-03-20',
    daysRemaining: '5 days remaining',
    amount: '24,000 LKR'
  };

  // Recent payments matching screenshot
  const recentPayments = [
    {
      id: 101,
      member: 'Kamala Perera',
      amount: 1000,
      status: 'PAID',
      date: '2026/03/15',
      group: "Village Women's",
      cycle: 'Cycle 3',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'No extra notes recorded for this transaction.'
    },
    {
      id: 102,
      member: 'Suresh Kumar',
      amount: 1000,
      status: 'PENDING',
      date: '2026/03/15',
      group: "Village Women's",
      cycle: 'Cycle 3',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Pending confirmation from member.'
    },
    {
      id: 103,
      member: 'Rani Ammal',
      amount: 1000,
      status: 'OVERDUE',
      date: '2026/03/10',
      group: 'Small Business',
      cycle: 'Cycle 2',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Overdue notice issued to member.'
    }
  ];

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
        <h2 className="fw-bold mb-1" style={{ color: '#0F2F3D' }}>
          Welcome back, {user?.fullName || '[Organizer Name]'}
        </h2>
        <p className="text-muted mb-0 small" style={{ fontSize: '0.925rem' }}>
          Here is a quick look at your current Seettu groups and member contributions for this month.
        </p>
      </div>

      {/* Top 3 Metric Cards Grid */}
      <div className="row g-4 mb-4">
        {/* Card 1: Active Groups */}
        <div className="col-12 col-md-4">
          <div className="metric-card h-100">
            <div>
              <div className="metric-value">{activeGroupsCount}</div>
              <div className="metric-label">Active Groups</div>
            </div>
            <div className="text-dark opacity-75">
              <Icon name="toggle" size={28} color="#0F2F3D" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Member */}
        <div className="col-12 col-md-4">
          <div className="metric-card h-100">
            <div>
              <div className="metric-value">{totalMembersCount}</div>
              <div className="metric-label">Total Member</div>
            </div>
            <div className="text-dark opacity-75">
              <Icon name="groups" size={26} color="#0F2F3D" />
            </div>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="col-12 col-md-4">
          <div className="metric-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start w-100 mb-3">
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
      </div>

      {/* Upcoming Payout Banner Card */}
      <div className="upcoming-payout-banner mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Icon name="megaphone" size={20} color="#FACC15" />
            <span className="fw-bold fs-6">Upcoming Payout</span>
          </div>
          <div className="small text-white-50 mb-1" style={{ fontSize: '0.8rem' }}>
            {upcomingPayout.cycle}
          </div>
          <h3 className="fw-bold mb-1 text-white">{upcomingPayout.recipient}</h3>
          <div className="small text-white-50 mb-2">
            Date : {upcomingPayout.date}
          </div>
          <div className="fw-bold small" style={{ color: '#FACC15' }}>
            {upcomingPayout.daysRemaining}
          </div>
        </div>

        <div className="text-end">
          <div className="display-6 fw-bold text-white mb-3" style={{ letterSpacing: '0.5px' }}>
            {upcomingPayout.amount}
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm border-0"
            style={{ fontSize: '0.9rem' }}
          >
            Review Payout
          </button>
        </div>
      </div>

      {/* Recent Payment Table Card */}
      <div className="table-card">
        <div className="table-card-header">
          Recent Payment
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
              {recentPayments.map((payment) => (
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
              ))}
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
        onApprove={(data) => {
          alert(`✓ Payout of ${data.amount} to ${data.recipient} approved successfully!`);
        }}
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
