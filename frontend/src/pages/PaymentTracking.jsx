import React, { useState } from 'react';
import Icon from '../components/Icons';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import EditPaymentModal from '../components/EditPaymentModal';
import DeletePaymentModal from '../components/DeletePaymentModal';
import PaymentReminderModal from '../components/PaymentReminderModal';

const PaymentTracking = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState('2026-09-15');

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

  const [payments, setPayments] = useState([
    {
      id: 101,
      date: '2026-03-15',
      group: "Village Women's",
      member: 'Kamala',
      cycle: 'Cycle 3',
      amount: 20000,
      status: 'PAID',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'No extra notes recorded for this transaction.'
    },
    {
      id: 102,
      date: '2026-03-15',
      group: "Village Women's",
      member: 'Suresh',
      cycle: 'Cycle 3',
      amount: 6000,
      status: 'PENDING',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Pending member deposit.'
    },
    {
      id: 103,
      date: '2026-03-14',
      group: 'Small Business',
      member: 'Rani',
      cycle: 'Cycle 2',
      amount: 1000,
      status: 'OVERDUE',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Contribution delayed.'
    },
    {
      id: 104,
      date: '2026-03-12',
      group: 'Community Farmers',
      member: 'Mohamed',
      cycle: 'Cycle 1',
      amount: 6000,
      status: 'PAID',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'Paid on time.'
    },
    {
      id: 105,
      date: '2026-03-15',
      group: "Village Women's",
      member: 'Priya',
      cycle: 'Cycle 3',
      amount: 10000,
      status: 'PAID',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'Paid on time.'
    },
    {
      id: 106,
      date: '2026-03-14',
      group: 'Small Business',
      member: 'Anura',
      cycle: 'Cycle 2',
      amount: 6000,
      status: 'PENDING',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Pending member deposit.'
    },
    {
      id: 107,
      date: '2026-03-13',
      group: 'Small Business',
      member: 'Farhan',
      cycle: 'Cycle 2',
      amount: 12000,
      status: 'PAID',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'Settled contribution.'
    },
    {
      id: 108,
      date: '2026-03-11',
      group: "Village Women's",
      member: 'Niluka',
      cycle: 'Cycle 3',
      amount: 1000,
      status: 'OVERDUE',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Payment reminder sent.'
    },
    {
      id: 109,
      date: '2026-03-10',
      group: 'Small Business',
      member: 'Sunil',
      cycle: 'Cycle 2',
      amount: 1000,
      status: 'OVERDUE',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Delayed payment.'
    },
    {
      id: 110,
      date: '2026-03-09',
      group: 'Community Farmers',
      member: 'Bandara',
      cycle: 'Cycle 1',
      amount: 1000,
      status: 'OVERDUE',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Overdue installment.'
    },
    {
      id: 111,
      date: '2026-03-08',
      group: 'Community Farmers',
      member: 'Silva',
      cycle: 'Cycle 1',
      amount: 1000,
      status: 'OVERDUE',
      recordedBy: '—',
      method: 'Cash (Offline)',
      notes: 'Overdue installment.'
    }
  ]);

  const handleRecordNew = (e) => {
    e.preventDefault();
    if (!selectedGroup || !selectedMember || !amountInput) {
      alert('Please fill in group, member, and amount.');
      return;
    }

    const newPayment = {
      id: Date.now(),
      date: dateInput,
      group: selectedGroup,
      member: selectedMember,
      cycle: selectedCycle || 'Cycle 1',
      amount: parseFloat(amountInput),
      status: 'PAID',
      recordedBy: 'Organizer',
      method: 'Cash (Offline)',
      notes: 'Direct entry payment'
    };

    setPayments([newPayment, ...payments]);
    setAmountInput('');
    alert('✓ Payment recorded successfully!');
  };

  const handleSaveEdit = (updated) => {
    setPayments(payments.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteRecord = (target) => {
    setPayments(payments.filter(p => p.id !== target.id));
  };

  const handleQuickRecord = (payment) => {
    setPayments(
      payments.map(p =>
        p.id === payment.id
          ? { ...p, status: 'PAID', recordedBy: 'Organizer' }
          : p
      )
    );
    alert(`✓ Payment for ${payment.member} marked as Paid!`);
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

  // Dynamic options for filter dropdowns
  const defaultGroups = ["Village Women's", "Small Business", "Community Farmers"];
  const dynamicGroups = Array.from(new Set(payments.map((p) => p.group).filter(Boolean)));
  const groupOptions = Array.from(new Set([...defaultGroups, ...dynamicGroups]));

  const defaultMembers = ['Kamala', 'Suresh', 'Rani', 'Mohamed'];
  const dynamicMembers = Array.from(
    new Set(
      payments
        .filter((p) => filterGroup === 'All' || p.group === filterGroup)
        .map((p) => p.member)
        .filter(Boolean)
    )
  );
  const memberOptions = filterGroup === 'All'
    ? Array.from(new Set([...defaultMembers, ...payments.map((p) => p.member).filter(Boolean)]))
    : dynamicMembers;

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

  // Dynamic Metric Calculations from live payments state
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
  const onTimeRate = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 100;

  return (
    <div className="payment-management-container pb-4">
      {/* Title */}
      <h2 className="fw-bold mb-4" style={{ color: '#1A3644' }}>Payment Management</h2>

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
              {isFiltered ? `${metricsSource.filter(p => p.status === 'PAID').length} Payments` : 'This Month'}
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
              {isFiltered ? `${metricsSource.filter(p => p.status === 'PENDING').length} Payments` : 'This Month'}
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

      {/* Record New Payment Form Card */}
      <div className="ui-card p-4 mb-4 shadow-sm">
        <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1rem' }}>Record New Payment</h5>
        <form onSubmit={handleRecordNew}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md">
              <select
                className="form-select bg-white"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
              >
                <option value="">Select Group</option>
                <option value="Village Women's">Village Women's</option>
                <option value="Small Business">Small Business</option>
                <option value="Community Farmers">Community Farmers</option>
              </select>
            </div>

            <div className="col-12 col-md">
              <select
                className="form-select bg-white"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                required
              >
                <option value="">Select Member</option>
                <option value="Kamala">Kamala</option>
                <option value="Suresh">Suresh</option>
                <option value="Rani">Rani</option>
                <option value="Mohamed">Mohamed</option>
              </select>
            </div>

            <div className="col-12 col-md">
              <select
                className="form-select bg-white"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
              >
                <option value="">Select Cycle</option>
                <option value="Cycle 1">Cycle 1</option>
                <option value="Cycle 2">Cycle 2</option>
                <option value="Cycle 3">Cycle 3</option>
              </select>
            </div>

            <div className="col-12 col-md">
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md">
              <input
                type="date"
                className="form-control"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-auto">
              <button type="submit" className="btn btn-teal px-4 w-100">
                Record Payment
              </button>
            </div>
          </div>
        </form>
      </div>

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
              placeholder="Search member or group..."
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

        {/* Group Filter */}
        <div className="col-6 col-lg-3 col-md-3">
          <select
            className="form-select rounded-3 border bg-white"
            value={filterGroup}
            onChange={(e) => {
              setFilterGroup(e.target.value);
              setFilterMember('All');
            }}
          >
            <option value="All">All Groups</option>
            {groupOptions.map((grp) => (
              <option key={grp} value={grp}>{grp}</option>
            ))}
          </select>
        </div>

        {/* Member Filter */}
        <div className="col-6 col-lg-3 col-md-3">
          <select
            className="form-select rounded-3 border bg-white"
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
          >
            <option value="All">All Members</option>
            {memberOptions.map((mbr) => (
              <option key={mbr} value={mbr}>{mbr}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="col-12 col-lg-2 col-md-12">
          <select
            className="form-select rounded-3 border bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicator & Reset */}
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <Icon name="search" size={32} color="#94A3B8" />
                      <h6 className="fw-bold mt-3 mb-1 text-dark">No payments found</h6>
                      <p className="text-muted small mb-3">
                        No payment records match your search or filter criteria.
                      </p>
                      <button
                        className="btn btn-outline-primary btn-sm px-3"
                        onClick={handleClearFilters}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 text-muted small">{p.date}</td>
                    <td className="py-3 px-3 text-dark small">{p.group}</td>
                    <td
                      className="py-3 px-3 fw-semibold text-dark small"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setViewPayment(p)}
                    >
                      {p.member}
                    </td>
                    <td className="py-3 px-3 text-muted small">{p.cycle}</td>
                    <td className="py-3 px-3 fw-semibold text-dark small">{p.amount.toLocaleString()} LKR</td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-3 text-muted small">{p.recordedBy}</td>
                    <td className="py-3 px-3 text-end">
                      {p.status === 'PAID' ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#188754' }}
                            title="Edit Payment"
                            onClick={() => setEditPayment(p)}
                          >
                            <Icon name="pencil" size={16} color="#188754" />
                          </button>
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title="Delete Payment"
                            onClick={() => setDeletePayment(p)}
                          >
                            <Icon name="trash" size={16} color="#DC3545" />
                          </button>
                        </div>
                      ) : p.status === 'PENDING' ? (
                        <button
                          className="btn btn-link fw-semibold p-0 text-decoration-none small"
                          style={{ color: '#188754' }}
                          onClick={() => handleQuickRecord(p)}
                        >
                          Record
                        </button>
                      ) : (
                        <button
                          className="btn btn-link fw-semibold p-0 text-decoration-none small d-inline-flex align-items-center gap-1"
                          style={{ color: '#DC3545' }}
                          onClick={() => setReminderPayment(p)}
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
