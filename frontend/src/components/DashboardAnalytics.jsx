import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import Icon from './Icons';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const DashboardAnalytics = ({ stats, recentPayments = [], isAdmin, isOrganizer }) => {
  // Payment status distribution from database
  const dist = stats?.paymentStatusDistribution || {};
  const paidCount = Number(dist.PAID || 0);
  const pendingCount = Number(dist.PENDING || 0);
  const lateCount = Number(dist.LATE || 0);
  const overdueCount = Number(dist.OVERDUE || 0);
  const totalCount = paidCount + pendingCount + lateCount + overdueCount;
  const displayTotal = totalCount;

  // Real Database Numbers Only - No synthetic or dummy fallbacks
  const hasData = totalCount > 0;
  const chartPaid = paidCount;
  const chartPending = pendingCount;
  const chartLate = lateCount;
  const chartOverdue = overdueCount;
  const complianceRate = totalCount > 0 ? Math.round((chartPaid / totalCount) * 100) : 100;

  // Group status distribution (For Admin)
  const groupDist = stats?.groupStatusDistribution || {};
  const activeGroupsCount = Number(groupDist.ACTIVE || stats?.activeGroups || 0);
  const completedGroupsCount = Number(groupDist.COMPLETED || 0);
  const pendingGroupsCount = Number(groupDist.PENDING || 0);
  const totalGroupsCount = Number(stats?.totalGroups || (activeGroupsCount + completedGroupsCount + pendingGroupsCount)) || 1;

  const activeGroupsPct = Math.round((activeGroupsCount / totalGroupsCount) * 100) || 0;
  const completedGroupsPct = Math.round((completedGroupsCount / totalGroupsCount) * 100) || 0;
  const pendingGroupsPct = Math.max(0, 100 - activeGroupsPct - completedGroupsPct);

  // Dispute & Legal metrics (For Admin)
  const openDisputesCount = Number(stats?.openDisputes || 0);
  const pendingEmergenciesCount = Number(stats?.pendingEmergencies || 0);
  const certificatesEarnedCount = Number(stats?.certificatesEarned || 0);
  const reportsGeneratedCount = Number(stats?.reportsGenerated || 0);

  // Doughnut Chart Data (Payment Compliance & Risk Portfolio)
  const doughnutData = {
    labels: hasData 
      ? ['Paid (On-Time)', 'Pending Verification', 'Late (Grace)', 'Overdue (At Risk)']
      : ['No Payments in Database'],
    datasets: [
      {
        data: hasData ? [chartPaid, chartPending, chartLate, chartOverdue] : [1],
        backgroundColor: hasData ? [
          '#10B981', // Emerald Green
          '#0097B2', // Project Teal
          '#F59E0B', // Amber
          '#EF4444'  // Rose Red
        ] : ['#E2E8F0'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0F2F3D',
        titleFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
        bodyFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => hasData ? ` ${ctx.label}: ${ctx.raw} payments` : ' No payment records found in database'
        }
      }
    }
  };

  // Real Database Monthly Cashflow Velocity (Inflow vs Outflow)
  const monthlyCashflow = Array.isArray(stats?.monthlyCashflow) && stats.monthlyCashflow.length > 0
    ? stats.monthlyCashflow
    : [];

  const months = monthlyCashflow.map(item => item.month);
  const inflowSeries = monthlyCashflow.map(item => Math.round(Number(item.inflow) || 0));
  const outflowSeries = monthlyCashflow.map(item => Math.round(Number(item.outflow) || 0));

  const barData = {
    labels: months.length > 0 ? months : ['No Historical Data'],
    datasets: [
      {
        label: 'Collected Funds (Inflow)',
        data: inflowSeries.length > 0 ? inflowSeries : [0],
        backgroundColor: '#0097B2',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      },
      {
        label: 'Disbursed Payouts (Outflow)',
        data: outflowSeries.length > 0 ? outflowSeries : [0],
        backgroundColor: '#0F2F3D',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
      },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: {
          color: '#64748B',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
          callback: (value) => `${(value / 1000).toFixed(0)}k`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          color: '#0F2F3D',
          font: { size: 11, weight: '600', family: "'Plus Jakarta Sans', sans-serif" },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#0F2F3D',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} LKR`
        }
      }
    }
  };

  return (
    <div className="mb-4">
      {/* Section Header for Organizers / Admins */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '28px', height: '28px', backgroundColor: '#E0F7FA' }}
          >
            <Icon name="award" size={16} color="#0097B2" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem', letterSpacing: '-0.2px' }}>
              {isAdmin ? 'System Portfolio & Cashflow Analytics' : 'Circle Portfolio & Performance'}
            </h5>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              Real-time operational financial health & payment compliance from MySQL database ledger
            </span>
          </div>
        </div>
        <span className="badge bg-light text-dark border px-3 py-1.5 rounded-pill small fw-semibold">
          {isAdmin ? 'Admin Intelligence' : 'Organizer View'}
        </span>
      </div>

      {/* Analytics Charts Grid */}
      <div className="row g-3">
        {/* Left Chart: Monthly Cashflow Velocity */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 h-100 rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.92rem' }}>
                  Cashflow Velocity (LKR)
                </h6>
                <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                  Total collected installments vs disbursed pot payouts
                </span>
              </div>

            </div>
            <div style={{ height: '230px', position: 'relative' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Right Chart: Payment Compliance & Risk Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100 rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.92rem' }}>
                  Payment Compliance Portfolio
                </h6>
                <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                  Risk tier breakdown across active circles
                </span>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded" style={{ fontSize: '0.72rem' }}>
                {complianceRate}% On-Time
              </span>
            </div>

            <div className="row align-items-center mt-1">
              <div className="col-6 position-relative d-flex justify-content-center" style={{ height: '170px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
                {/* Center Percentage Display */}
                <div
                  className="position-absolute d-flex flex-column align-items-center justify-content-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <span className="fw-bold text-dark lh-1" style={{ fontSize: '1.25rem' }}>
                    {complianceRate}%
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                    Compliance
                  </span>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="col-6">
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#10B981' }}></span>
                      Paid On-Time
                    </span>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>{chartPaid}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#0097B2' }}></span>
                      Pending Verify
                    </span>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>{chartPending}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B' }}></span>
                      Late (Grace)
                    </span>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>{chartLate}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: '#EF4444' }}></span>
                      Overdue Risk
                    </span>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>{chartOverdue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Health Summary Pill */}
            <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center" style={{ fontSize: '0.74rem' }}>
              <span className="text-muted">Total Monitored Installments</span>
              <span className="fw-semibold text-dark">{displayTotal} records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Master Intelligence Row (Exclusively for Platform Admin) */}
      {isAdmin && (
        <div className="row g-3 mt-1">
          {/* System Circle Lifecycle Health */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: '#E0F7FA' }}>
                    <Icon name="groups" size={16} color="#0097B2" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>
                      System Circle Lifecycles
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Total platform circle status across Sri Lanka
                    </span>
                  </div>
                </div>
                <span className="badge bg-light text-dark border px-2 py-1 rounded" style={{ fontSize: '0.72rem' }}>
                  {totalGroupsCount} Total Circles
                </span>
              </div>

              {/* Progress Bar Segmented */}
              <div className="progress mt-2 mb-3" style={{ height: '10px', borderRadius: '6px', backgroundColor: '#F1F5F9' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${activeGroupsPct}%`, backgroundColor: '#0097B2' }} 
                  title={`Active: ${activeGroupsCount}`}
                ></div>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${completedGroupsPct}%`, backgroundColor: '#10B981' }} 
                  title={`Completed: ${completedGroupsCount}`}
                ></div>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${pendingGroupsPct}%`, backgroundColor: '#F59E0B' }} 
                  title={`Pending: ${pendingGroupsCount}`}
                ></div>
              </div>

              {/* Lifecycle Stats Badges */}
              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="p-2 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <span className="rounded-circle d-inline-block" style={{ width: '7px', height: '7px', backgroundColor: '#0097B2' }}></span>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Active</span>
                    </div>
                    <div className="fw-bold text-dark fs-6">{activeGroupsCount}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{activeGroupsPct}%</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-2 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <span className="rounded-circle d-inline-block" style={{ width: '7px', height: '7px', backgroundColor: '#10B981' }}></span>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Completed</span>
                    </div>
                    <div className="fw-bold text-dark fs-6">{completedGroupsCount}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{completedGroupsPct}%</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-2 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <span className="rounded-circle d-inline-block" style={{ width: '7px', height: '7px', backgroundColor: '#F59E0B' }}></span>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Pending</span>
                    </div>
                    <div className="fw-bold text-dark fs-6">{pendingGroupsCount}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{pendingGroupsPct}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Dispute & Compliance Integrity Monitor */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: '#FEF3C7' }}>
                    <Icon name="scale" size={16} color="#D97706" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>
                      Legal & Dispute Integrity Monitor
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                      Arbitration & Cheetus Ordinance compliance status
                    </span>
                  </div>
                </div>
                <span className={`badge ${openDisputesCount === 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} px-2 py-1 rounded`} style={{ fontSize: '0.72rem' }}>
                  {openDisputesCount === 0 ? '100% Cleared' : `${openDisputesCount} Active Issue`}
                </span>
              </div>

              <div className="row g-2 mt-1">
                <div className="col-6">
                  <div className="p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Open Disputes</div>
                      <div className={`fw-bold fs-6 ${openDisputesCount > 0 ? 'text-danger' : 'text-dark'}`}>
                        {openDisputesCount}
                      </div>
                    </div>
                    <Icon name="alert-triangle" size={20} color={openDisputesCount > 0 ? '#EF4444' : '#94A3B8'} />
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Emergency Requests</div>
                      <div className="fw-bold fs-6 text-dark">{pendingEmergenciesCount}</div>
                    </div>
                    <Icon name="zap" size={20} color="#F59E0B" />
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Certificates Issued</div>
                      <div className="fw-bold fs-6 text-dark">{certificatesEarnedCount}</div>
                    </div>
                    <Icon name="award" size={20} color="#10B981" />
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Audit Reports</div>
                      <div className="fw-bold fs-6 text-dark">{reportsGeneratedCount}</div>
                    </div>
                    <Icon name="file-text" size={20} color="#0097B2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;
