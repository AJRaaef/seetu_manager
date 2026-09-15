import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getAdminDashboard, getUserDashboard } from '../api/dashboardApi';
import StatsCard from '../components/StatsCard';
import PaymentChart from '../components/PaymentChart';
import ScoreCard from '../components/ScoreCard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userId = user?.userId || user?.id;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = isAdmin 
          ? await getAdminDashboard() 
          : await getUserDashboard(userId);
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load database stats', error);
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin || userId) {
      fetchDashboard();
    }
  }, [isAdmin, userId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted fw-bold">Loading live database dashboard metrics...</p>
      </div>
    );
  }

  const liveStats = stats || {
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    totalPayments: 0,
    openDisputes: 0,
    reportsGenerated: 0,
    certificatesEarned: 0,
    disciplineScore: 95,
    nextPaymentDueDays: 5,
    overallCompletionRate: 100.0,
    paymentStatusDistribution: { PAID: 0, PENDING: 0 }
  };

  const scoreCategory = liveStats.disciplineScore >= 90 ? 'EXCELLENT' : liveStats.disciplineScore >= 75 ? 'GOOD' : liveStats.disciplineScore >= 60 ? 'FAIR' : 'POOR';

  return (
    <div className="pb-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold text-dark mb-1">
              Welcome back, {user?.fullName || 'User'}! 👋
            </h2>
            <span className="badge bg-primary fs-7">{user?.role || 'MEMBER'}</span>
          </div>
          <p className="text-muted mb-0">
            {isAdmin ? 'System Administrative Overview & Live Analytics' : isOrganizer ? 'Organizer Operations & Live Group Summary' : 'Member Contribution Portal & Live Score History'}
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
          {(isAdmin || isOrganizer) && (
            <Link to="/groups/create" className="btn btn-primary shadow-sm fw-bold">
              ➕ Create Group
            </Link>
          )}
          <Link to="/emergency" className="btn btn-outline-warning shadow-sm fw-bold text-dark">
            🚨 Emergency Request
          </Link>
          <button onClick={handleLogout} className="btn btn-danger shadow-sm fw-bold d-flex align-items-center gap-1">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Role-Based Dynamic Summary Cards (Fetched directly from DB) */}
      {isOrganizer ? (
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Total Groups" value={liveStats.totalGroups} icon="fa-users" colorClass="primary" subtitle="Active Membership" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Payments Recorded" value={liveStats.totalPayments} icon="fa-money-bill" colorClass="success" subtitle="Recorded Cycles" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Open Disputes" value={liveStats.openDisputes} icon="fa-check-circle" colorClass="warning" subtitle="Requires Action" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Reports Generated" value={liveStats.reportsGenerated} icon="fa-chart-line" colorClass="info" subtitle="Audit Summaries" />
          </div>
        </div>
      ) : isAdmin ? (
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Total Members" value={liveStats.totalMembers} icon="fa-users" colorClass="primary" subtitle="Registered Accounts" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Total Groups" value={liveStats.totalGroups} icon="fa-check-circle" colorClass="success" subtitle="System Seettu Groups" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Total Payments" value={liveStats.totalPayments} icon="fa-money-bill" colorClass="info" subtitle="Recorded Transactions" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Completion Rate" value={`${(liveStats.overallCompletionRate || 100).toFixed(1)}%`} icon="fa-chart-line" colorClass="warning" subtitle="Overall Reliability" />
          </div>
        </div>
      ) : (
        /* Member Summary Cards (Dynamic DB values) */
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Groups Joined" value={liveStats.totalGroups} icon="fa-users" colorClass="primary" subtitle="Active Membership" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="My Discipline Score" value={liveStats.disciplineScore} icon="fa-check-circle" colorClass="success" subtitle={`${scoreCategory} Rating`} />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Next Payment Due" value={`${liveStats.nextPaymentDueDays} Days`} icon="fa-money-bill" colorClass="warning" subtitle="Cycle Deadline" />
          </div>
          <div className="col-xl-3 col-md-6">
            <StatsCard title="Certificates Earned" value={liveStats.certificatesEarned} icon="fa-chart-line" colorClass="info" subtitle="Digital Awards" />
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span className="fw-bold text-secondary">⚡ Quick Navigation:</span>
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/groups" className="btn btn-sm btn-white border shadow-sm fw-bold">
                👥 My Groups
              </Link>
              {(isAdmin || isOrganizer) && (
                <Link to="/payments" className="btn btn-sm btn-white border shadow-sm fw-bold">
                  💳 Payment Tracking
                </Link>
              )}
              <Link to="/advance-payments" className="btn btn-sm btn-white border shadow-sm fw-bold">
                ⚡ Advance Payments
              </Link>
              <Link to="/disputes" className="btn btn-sm btn-white border shadow-sm fw-bold">
                ⚖️ Disputes Center
              </Link>
              <Link to="/reports" className="btn btn-sm btn-white border shadow-sm fw-bold">
                📈 Reports & Audit
              </Link>
              <Link to="/certificates" className="btn btn-sm btn-white border shadow-sm fw-bold">
                🎓 Certificates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Score Row */}
      <div className="row g-4">
        <div className="col-lg-7">
          <PaymentChart data={liveStats.paymentStatusDistribution} title={isOrganizer ? "Group Payment Completion Distribution" : "Personal Contribution Status Distribution"} />
        </div>
        <div className="col-lg-5">
          <ScoreCard score={liveStats.disciplineScore} category={scoreCategory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
