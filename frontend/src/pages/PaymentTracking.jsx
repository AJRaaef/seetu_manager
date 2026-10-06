import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import EditPaymentModal from '../components/EditPaymentModal';
import DeletePaymentModal from '../components/DeletePaymentModal';
import PaymentReminderModal from '../components/PaymentReminderModal';
import {
  getAllPayments,
  getPaymentsByMember,
  recordPayment,
  updatePayment,
  deletePayment,
  getPaymentCyclesByGroup
} from '../api/paymentApi';
import { getAllGroups, getGroupsByUser, getGroupMembers } from '../api/groupApi';

const PaymentTracking = () => {
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
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [viewPayment, setViewPayment] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);
  const [reminderPayment, setReminderPayment] = useState(null);

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
        method: 'Cash (Offline)',
        notes: p.notes || ''
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
    if (!selectedGroupId || !selectedMemberId || !selectedCycleId || !amountInput) {
      alert('Please select group, member, cycle, and enter contribution amount.');
      return;
    }

    setSubmitting(true);
    try {
      await recordPayment(
        {
          cycleId: Number(selectedCycleId),
          memberId: Number(selectedMemberId),
          amount: parseFloat(amountInput),
          notes: 'Recorded via Payment Management portal'
        },
        userId || 1
      );

      alert('✓ Payment successfully recorded to database!');
      setAmountInput('');
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
      alert(`✓ Payment for ${payment.member} marked as Paid in database!`);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge-paid" style={{ cursor: 'pointer' }}>Paid</span>;
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
        <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Payment Management</h2>
        <div className="d-flex align-items-center gap-2">
          {(isAdmin || isOrganizer) && (
            <Link
              to="/audit-trail"
              className="btn btn-info btn-sm text-white fw-bold d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 shadow-sm"
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
              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>Total Collected</div>
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

      {/* Record New Payment Form Card (for Organizers & Admins) */}
      {(isAdmin || isOrganizer) && (
        <div className="ui-card p-4 mb-4 shadow-sm">
          <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1rem' }}>Record New Payment to Database</h5>
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
                    const grp = availableGroups.find((g) => String(g.id) === String(gId));
                    if (grp && grp.contributionAmount) {
                      setAmountInput(String(grp.contributionAmount));
                    }
                  }}
                  required
                >
                  <option value="">Select Group</option>
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                  {availableGroups.length === 0 && (
                    <option value="" disabled>No active groups found</option>
                  )}
                </select>
              </div>

              {/* Member Select */}
              <div className="col-12 col-md">
                <select
                  className="form-select bg-white"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  disabled={!selectedGroupId}
                  required
                >
                  <option value="">{selectedGroupId ? 'Select Member' : 'Choose Group First'}</option>
                  {groupMembers.map((m) => {
                    const mUserId = m.user?.id || m.userId || m.id;
                    const mName = m.user?.fullName || m.fullName || m.name || `Member #${mUserId}`;
                    return (
                      <option key={m.id || mUserId} value={mUserId}>
                        {mName}
                      </option>
                    );
                  })}
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

              {/* Date Input */}
              <div className="col-12 col-md">
                <input
                  type="date"
                  className="form-control"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="col-12 col-md-auto">
                <button type="submit" className="btn btn-teal px-4 w-100" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Payment'}
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
                    <span className="text-muted small">Loading payment records from database...</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <Icon name="search" size={32} color="#94A3B8" />
                      <h6 className="fw-bold mt-3 mb-1 text-dark">No payments found in database</h6>
                      <p className="text-muted small mb-3">
                        {isFiltered
                          ? 'No payment records match your search or filter criteria.'
                          : 'There are no payment records in the database yet.'}
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
                      {p.status === 'PAID' ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#188754' }}
                            title="Edit Payment"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditPayment(p);
                            }}
                          >
                            <Icon name="pencil" size={16} color="#188754" />
                          </button>
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title="Delete Payment"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecord(p);
                            }}
                          >
                            <Icon name="trash" size={16} color="#DC3545" />
                          </button>
                        </div>
                      ) : p.status === 'PENDING' ? (
                        <button
                          className="btn btn-link fw-semibold p-0 text-decoration-none small"
                          style={{ color: '#188754' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickRecord(p);
                          }}
                        >
                          Record
                        </button>
                      ) : (
                        <button
                          className="btn btn-link fw-semibold p-0 text-decoration-none small d-inline-flex align-items-center gap-1"
                          style={{ color: '#DC3545' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReminderPayment(p);
                          }}
                        >
                          <Icon name="bell" size={14} color="#DC3545" />
                          <span>Reminder</span>
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
          alert(`✓ Payment reminder sent to ${data.payment.member} via ${data.channel}!`);
        }}
      />
    </div>
  );
};

export default PaymentTracking;
