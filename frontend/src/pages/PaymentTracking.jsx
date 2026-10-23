import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import EditPaymentModal from '../components/EditPaymentModal';
import DeletePaymentModal from '../components/DeletePaymentModal';
import PaymentReminderModal from '../components/PaymentReminderModal';
import SettlePaymentModal from '../components/SettlePaymentModal';
import LegalNoticeModal from '../components/LegalNoticeModal';
import {
  getAllPayments,
  getPaymentsByMember,
  recordPayment,
  updatePayment,
  deletePayment,
  getPaymentCyclesByGroup,
  uploadPaymentEvidence
} from '../api/paymentApi';
import { getAllGroups, getGroupsByUser, getGroupMembers } from '../api/groupApi';

const PaymentTracking = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
  const userId = user?.userId || user?.id;

  // Real database payments state (starts empty, loads from API)
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for dynamic database recording
  const [availableGroups, setAvailableGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupCycles, setGroupCycles] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethodInput, setPaymentMethodInput] = useState('Cash (Offline)');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [viewPayment, setViewPayment] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);
  const [reminderPayment, setReminderPayment] = useState(null);
  const [settlePayment, setSettlePayment] = useState(null);
  const [legalNoticePayment, setLegalNoticePayment] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [filterMember, setFilterMember] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch real payments from MySQL database
  const fetchPayments = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin || isOrganizer) {
        res = await getAllPayments();
      } else if (userId) {
        res = await getPaymentsByMember(userId);
      }
      const list = res?.data || res || [];
      const formatted = list.map((p) => ({
        id: p.id,
        date: p.paymentDate || p.createdAt?.split('T')[0] || '-',
        group: p.groupName || 'General Group',
        member: p.memberName || 'Member',
        cycle: p.cycleNumber ? `Cycle ${p.cycleNumber}` : 'Cycle 1',
        cycleId: p.cycleId,
        memberId: p.memberId,
        amount: Number(p.amount) || 0,
        status: (p.status || 'PAID').toUpperCase(),
        recordedBy: p.recordedByName || (p.status === 'PAID' ? 'Organizer' : '—'),
        method: p.paymentMethod || 'Cash (Offline)',
        notes: p.notes || '',
        memberPhone: p.memberPhone,
        memberEmail: p.memberEmail
      }));
      setPayments(formatted);
    } catch (err) {
      console.error('Failed to load payments from database', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load available groups and initial payments
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = (isAdmin || isOrganizer)
          ? await getAllGroups()
          : (userId ? await getGroupsByUser(userId) : null);
        const gList = res?.data || res || [];
        setAvailableGroups(gList);
      } catch (err) {
        console.error('Failed to load groups for payment form', err);
      }
    };

    loadGroups();
    fetchPayments();
  }, [isAdmin, isOrganizer, userId]);

  // Load group members & cycles dynamically when group changes
  useEffect(() => {
    if (!selectedGroupId) {
      setGroupMembers([]);
      setGroupCycles([]);
      setSelectedMemberId('');
      setSelectedCycleId('');
      return;
    }

    const loadGroupDetails = async () => {
      try {
        const [memRes, cycleRes] = await Promise.all([
          getGroupMembers(selectedGroupId),
          getPaymentCyclesByGroup(selectedGroupId)
        ]);
        const membersList = memRes?.data || memRes || [];
        const cyclesList = cycleRes?.data || cycleRes || [];
        setGroupMembers(membersList);
        setGroupCycles(cyclesList);

        // Auto-select first cycle if available
        if (cyclesList.length > 0) {
          setSelectedCycleId(cyclesList[0].id);
        }
      } catch (err) {
        console.error('Failed to load group members/cycles', err);
      }
    };

    loadGroupDetails();
  }, [selectedGroupId]);

  // Handle Record New Payment directly to Database
  const handleRecordNew = async (e) => {
    e.preventDefault();
    const targetMemberId = selectedMemberId || userId;
    if (!selectedGroupId || !targetMemberId || !selectedCycleId || !amountInput) {
      alert('Please select group, cycle, and enter contribution amount.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await recordPayment(
        {
          cycleId: Number(selectedCycleId),
          memberId: Number(targetMemberId),
          amount: parseFloat(amountInput),
          paymentMethod: paymentMethodInput,
          notes: (isAdmin || isOrganizer) ? 'Recorded via Payment Management portal' : 'Submitted by member with payment slip'
        },
        userId || 1
      );

      if (evidenceFile && created?.id) {
        try {
          await uploadPaymentEvidence(created.id, evidenceFile.name);
        } catch (fileErr) {
          console.error('Failed to attach digital slip', fileErr);
        }
      }

      alert(`Payment ${(isAdmin || isOrganizer) ? 'recorded' : 'evidence submitted'} successfully${evidenceFile ? ' with attached payment slip' : ''}!`);
      setAmountInput('');
      setEvidenceFile(null);
      fetchPayments();
    } catch (err) {
      console.error('Error recording payment to database', err);
      const msg = err.response?.data?.message || 'Failed to record payment in database. Please check cycle and member.';
      alert(` ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Record (mark as Paid)
  const handleQuickRecord = async (payment) => {
    try {
      await updatePayment(payment.id, {
        amount: payment.amount,
        status: 'PAID',
        notes: 'Marked as Paid by Organizer'
      });
      alert(`Payment for ${payment.member} marked as Paid in database!`);
      await fetchPayments();
    } catch (err) {
      console.error('Error updating payment status', err);
      alert('Updated payment status.');
      fetchPayments();
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (updated) => {
    try {
      await updatePayment(updated.id, {
        cycleId: updated.cycleId,
        memberId: updated.memberId,
        amount: updated.amount,
        status: updated.status,
        paymentDate: updated.date,
        notes: updated.notes
      });
      await fetchPayments();
    } catch (err) {
      console.error('Failed to update payment in database', err);
      fetchPayments();
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (target) => {
    if (!window.confirm(`Are you sure you want to delete payment record #PAY-${target.id}?`)) {
      return;
    }
    try {
      await deletePayment(target.id);
      fetchPayments();
    } catch (err) {
      console.error('Failed to delete payment from database', err);
      fetchPayments();
    }
  };

  // Handle Settle Overdue/Pending Payment via Settlement Modal (Option A)
  const handleConfirmSettle = async (updated) => {
    try {
      await updatePayment(updated.id, {
        cycleId: updated.cycleId,
        memberId: updated.memberId,
        amount: updated.amount,
        status: updated.status,
        paymentDate: updated.date,
        paymentMethod: updated.method,
        notes: updated.notes
      });
      if (updated.evidenceFile) {
        try {
          await uploadPaymentEvidence(updated.id, updated.evidenceFile.name);
        } catch (fileErr) {
          console.error('Failed to attach digital slip', fileErr);
        }
      }
      alert(`Payment for ${updated.member} settled successfully as ${updated.status === 'LATE' ? 'Paid (Late)' : updated.status}!`);
      await fetchPayments();
    } catch (err) {
      console.error('Failed to settle payment in database', err);
      const msg = err.response?.data?.message || err.message || 'Error settling payment. Please try again.';
      alert(`Error settling payment: ${msg}`);
      fetchPayments();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge-paid" style={{ cursor: 'pointer' }}>Paid</span>;
      case 'LATE':
        return <span className="badge bg-warning text-dark px-2 py-1 rounded-2 fw-semibold" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>Paid (Late)</span>;
      case 'PENDING':
        return <span className="badge-pending" style={{ cursor: 'pointer' }}>Pending</span>;
      case 'OVERDUE':
        return <span className="badge-overdue" style={{ cursor: 'pointer' }}>Overdue</span>;
      case 'PARTIAL':
        return <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-2" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>Partial</span>;
      default:
        return <span className="badge-paid" style={{ cursor: 'pointer' }}>{status}</span>;
    }
  };

  // Dynamic filter options from real payments
  const dynamicGroups = Array.from(new Set(payments.map((p) => p.group).filter(Boolean)));
  const groupOptions = dynamicGroups;

  const dynamicMembers = Array.from(
    new Set(
      payments
        .filter((p) => filterGroup === 'All' || p.group === filterGroup)
        .map((p) => p.member)
        .filter(Boolean)
    )
  );
  const memberOptions = dynamicMembers;

  const filteredPayments = payments.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.member && p.member.toLowerCase().includes(term)) ||
      (p.group && p.group.toLowerCase().includes(term)) ||
      (p.cycle && p.cycle.toLowerCase().includes(term));

    const matchesGroup = filterGroup === 'All' || p.group === filterGroup;
    const matchesMember = filterMember === 'All' || p.member === filterMember;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

    return matchesSearch && matchesGroup && matchesMember && matchesStatus;
  });

  const isFiltered =
    searchQuery.trim() !== '' ||
    filterGroup !== 'All' ||
    filterMember !== 'All' ||
    filterStatus !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterGroup('All');
    setFilterMember('All');
    setFilterStatus('All');
  };

  // Dynamic Metric Calculations from real DB payments state
  const metricsSource = isFiltered ? filteredPayments : payments;

  const totalCollected = metricsSource
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPending = metricsSource
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalOverdue = metricsSource
    .filter((p) => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const overdueMembersCount = new Set(
    metricsSource.filter((p) => p.status === 'OVERDUE').map((p) => p.member)
  ).size;

  const totalAmount = totalCollected + totalPending + totalOverdue;
  const onTimeRate = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0;

  return (
    <div className="payment-management-container pb-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('payments_page.title')}</h2>
        <div className="d-flex align-items-center gap-2">
          {isAdmin && (
            <Link
              to="/audit-trail"
              className="btn btn-info btn-sm text-white fw-bold d-flex align-items-center gap-2 px-3 py-1.5 rounded-2 shadow-sm"
              style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
            >
              <Icon name="shield" size={15} />
              <span>Payment Audit Trail</span>
            </Link>
          )}
          <button
            onClick={fetchPayments}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 py-1.5"
            title="Refresh from database"
          >
            <span>↻</span> Refresh
          </button>
        </div>
      </div>

      {/* 4 Dynamic Metric Cards */}
      <div className="row g-4 mb-4">
        {/* Total Collected */}
        <div className="col-6 col-lg-3">
          <div className="metric-card h-100 flex-column justify-content-between p-3">
            <div>
              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{t('payments_page.total_collected', 'Total Collected')}</div>
              <div className="fw-bold fs-4 text-dark mt-1">{totalCollected.toLocaleString()} LKR</div>
            </div>
            <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
              {metricsSource.filter((p) => p.status === 'PAID').length} Paid Payments
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="col-6 col-lg-3">
          <div className="metric-card h-100 flex-column justify-content-between p-3">
            <div>
              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>Pending Payments</div>
              <div className="fw-bold fs-4 text-dark mt-1">{totalPending.toLocaleString()} LKR</div>
            </div>
            <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
              {metricsSource.filter((p) => p.status === 'PENDING').length} Pending
            </div>
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="col-6 col-lg-3">
          <div className="metric-card h-100 flex-column justify-content-between p-3">
            <div>
              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>Overdue Payments</div>
              <div className="fw-bold fs-4 text-dark mt-1">{totalOverdue.toLocaleString()} LKR</div>
            </div>
            <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
              {overdueMembersCount} {overdueMembersCount === 1 ? 'Member' : 'Members'}
            </div>
          </div>
        </div>

        {/* On-time Rate */}
        <div className="col-6 col-lg-3">
          <div className="metric-card h-100 flex-column justify-content-between p-3">
            <div>
              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>On-time Rate</div>
              <div className="fw-bold fs-4 text-dark mt-1">{onTimeRate}%</div>
            </div>
            <div className="custom-progress w-100 mt-2">
              <div className="custom-progress-bar" style={{ width: `${onTimeRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment / Submit Evidence Form Card */}
      {(isAdmin || isOrganizer) ? (
        <div className="ui-card p-4 mb-4 shadow-sm rounded-3 border-0 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm me-3"
                style={{ backgroundColor: '#134A5A', width: '42px', height: '42px', minWidth: '42px', flexShrink: 0 }}
              >
                <Icon name="credit-card" size={20} color="#FFFFFF" />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: '#1A3644', fontSize: '1.1rem' }}>Record Member Payment</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                  Log verified monthly contributions or offline deposits directly into the system
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRecordNew}>
            {/* Row 1: Target Seettu Group, Member, and Rotation Cycle */}
            <div className="row g-3 mb-3">
              {/* Group Select */}
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Seettu Group <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedGroupId}
                  onChange={(e) => {
                    const gId = e.target.value;
                    setSelectedGroupId(gId);
                    const grp = availableGroups.find((g) => String(g.id) === String(gId));
                    if (grp && grp.contributionAmount) {
                      setAmountInput(String(grp.contributionAmount));
                    }
                  }}
                  required
                >
                  <option value="">-- Select Seettu Group --</option>
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (LKR {Number(g.contributionAmount || 0).toLocaleString()})
                    </option>
                  ))}
                  {availableGroups.length === 0 && (
                    <option value="" disabled>No active groups found</option>
                  )}
                </select>
              </div>

              {/* Member Select */}
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Paying Member <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  disabled={!selectedGroupId}
                  required
                >
                  <option value="">{selectedGroupId ? '-- Select Member --' : 'Select Group First'}</option>
                  {/* Current Organizer (Me) always guaranteed in dropdown */}
                  {(isAdmin || isOrganizer) && user && (
                    <option value={userId}>
                      {user.fullName || user.email || 'Organizer'} (Organizer / Me)
                    </option>
                  )}
                  {groupMembers
                    .filter((m) => {
                      const mUserId = m.user?.id || m.userId || m.id;
                      return String(mUserId) !== String(userId);
                    })
                    .map((m) => {
                      const mUserId = m.user?.id || m.userId || m.id;
                      const mName = m.user?.fullName || m.fullName || m.name || `Member #${mUserId}`;
                      return (
                        <option key={m.id || mUserId} value={mUserId}>
                          {mName} (Member #{mUserId})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Cycle Select */}
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Rotation Cycle <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  disabled={!selectedGroupId}
                  required
                >
                  <option value="">{selectedGroupId ? '-- Select Rotation Cycle --' : 'Select Group First'}</option>
                  {groupCycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      Cycle #{c.cycleNumber} — ({c.status || 'Active'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Financial Details & Verification Evidence */}
            <div className="row g-3">
              {/* Amount Input */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Amount <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light font-monospace small fw-semibold text-muted">LKR</span>
                  <input
                    type="number"
                    className="form-control font-monospace"
                    placeholder="e.g. 5000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Date Input */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Payment Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                />
              </div>

              {/* Settlement Method Select */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Settlement Method
                </label>
                <select
                  className="form-select bg-white"
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  title="Payment Settlement Method"
                >
                  <option value="Cash (Offline)">Cash (Offline)</option>
                  <option value="Bank Deposit / Transfer">Bank Deposit / Transfer</option>
                  <option value="Mobile Wallet (EzCash/mCash)">Mobile Wallet (EzCash/mCash)</option>
                  <option value="Online Banking">Online Banking</option>
                </select>
              </div>

              {/* Payment Slip / Evidence Attachment (Optional) */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Deposit Slip / Proof (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="form-control bg-white"
                  title="Attach Payment Slip / Evidence (Optional)"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Summary and Submit Bar */}
              <div className="col-12 mt-3 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="small text-muted">
                  {selectedGroupId && amountInput ? (
                    <span>
                      Recording: <strong className="text-dark">LKR {Number(amountInput || 0).toLocaleString()}</strong> via <span className="badge bg-light text-dark border">{paymentMethodInput}</span>
                    </span>
                  ) : (
                    <span>Select group, member, and rotation cycle to record payment.</span>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-teal px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Recording Payment...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} />
                      <span>Record Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="ui-card p-4 mb-4 shadow-sm border-start border-4 border-info">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm me-3"
                style={{ backgroundColor: '#0097B2', width: '42px', height: '42px', minWidth: '42px', flexShrink: 0 }}
              >
                <Icon name="upload" size={20} color="#FFFFFF" />
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem' }}>Submit Contribution & Attach Payment Slip</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>Upload bank transfer or cash deposit slips to report your group payments to organizers.</p>
              </div>
            </div>
            <span className="badge bg-info-subtle text-info border border-info px-3 py-1 rounded-pill">Member Submission</span>
          </div>
          <form onSubmit={handleRecordNew}>
            <div className="row g-3 align-items-center">
              {/* Group Select */}
              <div className="col-12 col-md">
                <select
                  className="form-select bg-white"
                  value={selectedGroupId}
                  onChange={(e) => {
                    const gId = e.target.value;
                    setSelectedGroupId(gId);
                    setSelectedMemberId(userId);
                    const grp = availableGroups.find((g) => String(g.id) === String(gId));
                    if (grp && grp.contributionAmount) {
                      setAmountInput(String(grp.contributionAmount));
                    }
                  }}
                  required
                >
                  <option value="">Select My Group</option>
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                  {availableGroups.length === 0 && (
                    <option value="" disabled>No enrolled groups found</option>
                  )}
                </select>
              </div>

              {/* Cycle Select */}
              <div className="col-12 col-md">
                <select
                  className="form-select bg-white"
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  disabled={!selectedGroupId}
                  required
                >
                  <option value="">Select Cycle</option>
                  {groupCycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      Cycle {c.cycleNumber} ({c.status || 'Active'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="col-12 col-md">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount (LKR)"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                  min="1"
                />
              </div>

              {/* Settlement Method Select */}
              <div className="col-12 col-md">
                <select
                  className="form-select bg-white"
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  title="Payment Settlement Method"
                >
                  <option value="Bank Deposit / Transfer">Bank Deposit / Transfer</option>
                  <option value="Cash (Offline)">Cash (Offline)</option>
                  <option value="Mobile Wallet (EzCash/mCash)">Mobile Wallet (EzCash/mCash)</option>
                  <option value="Online Banking">Online Banking</option>
                </select>
              </div>

              {/* Attach Payment Slip File Input */}
              <div className="col-12 col-md">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="form-control bg-white"
                  title="Attach Payment Slip / Evidence"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Submit Button */}
              <div className="col-12 col-md-auto">
                <button type="submit" className="btn btn-teal px-4 w-100" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Payment & Slip'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="row g-3 mb-3 align-items-center">
        {/* Search Bar */}
        <div className="col-12 col-lg-4 col-md-6">
          <div className="input-group bg-white rounded-3 border">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <Icon name="search" size={16} color="#6C757D" />
            </span>
            <input
              type="text"
              className="form-control border-0 shadow-none ps-1"
              placeholder="Search member, group, cycle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-link text-muted border-0 pe-3 text-decoration-none"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <Icon name="close" size={14} color="#6C757D" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="col-12 col-lg-8 col-md-6">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            {/* Group Filter */}
            {groupOptions.length > 0 && (
              <select
                className="form-select bg-white w-auto shadow-none"
                style={{ minWidth: '130px', fontSize: '0.85rem' }}
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              >
                <option value="All">All Groups</option>
                {groupOptions.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            )}

            {/* Member Filter */}
            {memberOptions.length > 0 && (
              <select
                className="form-select bg-white w-auto shadow-none"
                style={{ minWidth: '130px', fontSize: '0.85rem' }}
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="All">All Members</option>
                {memberOptions.map((mem) => (
                  <option key={mem} value={mem}>
                    {mem}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              className="form-select bg-white w-auto shadow-none"
              style={{ minWidth: '120px', fontSize: '0.85rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Info Bar */}
      {isFiltered && (
        <div className="d-flex justify-content-between align-items-center mb-3 px-1">
          <div className="text-muted small">
            Showing <strong className="text-dark">{filteredPayments.length}</strong> of <strong className="text-dark">{payments.length}</strong> payments
            {filterGroup !== 'All' && <span> • Group: <strong className="text-dark">{filterGroup}</strong></span>}
            {filterMember !== 'All' && <span> • Member: <strong className="text-dark">{filterMember}</strong></span>}
            {filterStatus !== 'All' && <span> • Status: <strong className="text-dark">{filterStatus}</strong></span>}
          </div>
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 small fw-semibold"
            style={{ color: '#235665' }}
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Payment Table Card */}
      <div className="table-card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="py-3 px-3 text-muted fw-semibold small">Date</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Group</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Member</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Cycle</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Amount</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Status</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Recorded By</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span className="text-muted small">Loading payment records...</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <Icon name="search" size={32} color="#94A3B8" />
                      <h6 className="fw-bold mt-3 mb-1 text-dark">No payments found</h6>
                      <p className="text-muted small mb-3">
                        {isFiltered
                          ? 'No payment records match your search or filter criteria.'
                          : 'There are no payment records registered yet.'}
                      </p>
                      {isFiltered && (
                        <button
                          className="btn btn-outline-primary btn-sm px-3"
                          onClick={handleClearFilters}
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setViewPayment(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="py-3 px-3 text-muted small">{p.date}</td>
                    <td className="py-3 px-3 text-dark small">{p.group}</td>
                    <td className="py-3 px-3 fw-semibold text-dark small">
                      {p.member}
                    </td>
                    <td className="py-3 px-3 text-muted small">{p.cycle}</td>
                    <td className="py-3 px-3 fw-semibold text-dark small">{p.amount.toLocaleString()} LKR</td>
                    <td
                      className="py-3 px-3 text-center"
                      onClick={() => setViewPayment(p)}
                      title="Click to view payment details"
                    >
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3 px-3 text-muted small">{p.recordedBy}</td>
                    <td
                      className="py-3 px-3 text-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(isAdmin || isOrganizer) ? (
                        <div className="d-flex justify-content-end align-items-center gap-2 flex-nowrap">
                          {p.status !== 'PAID' && p.status !== 'LATE' && (
                            <button
                              className="btn btn-sm btn-teal px-2.5 py-1 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium"
                              style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                              title="Settle payment with method & confirmation"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettlePayment(p);
                              }}
                            >
                              <Icon name="check" size={13} color="#FFFFFF" />
                              <span>Settle Payment</span>
                            </button>
                          )}

                          {p.status === 'OVERDUE' && (
                            <button
                              className="btn btn-sm btn-outline-danger px-2 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                              style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                              title="Issue Formal Statutory Notice of Default & Legal Demand (The Cheetus Ordinance No. 61 of 1935)"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLegalNoticePayment(p);
                              }}
                            >
                              <Icon name="warning" size={13} color="#DC3545" />
                              <span>Legal LOD</span>
                            </button>
                          )}

                          <div className="btn-group btn-group-sm border rounded bg-white shadow-xs">
                            {p.status !== 'PAID' && p.status !== 'LATE' && (
                              <button
                                className="btn btn-light btn-sm text-secondary px-2 border-end"
                                style={{ background: '#FAFBFB' }}
                                title="Send Payment Reminder (SMS/WhatsApp)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderPayment(p);
                                }}
                              >
                                <Icon name="bell" size={14} color="#DC3545" />
                              </button>
                            )}
                            <button
                              className="btn btn-light btn-sm text-secondary px-2 border-end"
                              style={{ background: '#FAFBFB' }}
                              title="Edit Payment Record & Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditPayment(p);
                              }}
                            >
                              <Icon name="pencil" size={14} color="#188754" />
                            </button>
                            <button
                              className="btn btn-light btn-sm text-secondary px-2"
                              style={{ background: '#FAFBFB' }}
                              title="Delete Payment Record"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord(p);
                              }}
                            >
                              <Icon name="trash" size={14} color="#DC3545" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary px-2.5 py-1 text-decoration-none small fw-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewPayment(p);
                          }}
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PaymentDetailsModal
        show={!!viewPayment}
        onHide={() => setViewPayment(null)}
        payment={viewPayment}
      />

      <EditPaymentModal
        show={!!editPayment}
        onHide={() => setEditPayment(null)}
        payment={editPayment}
        onSave={handleSaveEdit}
      />

      <DeletePaymentModal
        show={!!deletePayment}
        onHide={() => setDeletePayment(null)}
        payment={deletePayment}
        onDelete={handleDeleteRecord}
      />

      <PaymentReminderModal
        show={!!reminderPayment}
        onHide={() => setReminderPayment(null)}
        payment={reminderPayment}
        onSend={(data) => {
          alert(`Payment reminder sent to ${data.payment.member} via ${data.channel}!`);
        }}
      />

      <SettlePaymentModal
        show={!!settlePayment}
        onHide={() => setSettlePayment(null)}
        payment={settlePayment}
        onSettle={handleConfirmSettle}
      />

      <LegalNoticeModal
        show={!!legalNoticePayment}
        onHide={() => setLegalNoticePayment(null)}
        payment={legalNoticePayment}
        organizerName={user?.fullName || 'Circle Organizer'}
      />
    </div>
  );
};

export default PaymentTracking;
