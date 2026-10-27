import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { useAuth } from '../hooks/useAuth';

import Icon from '../components/Icons';

import PaymentDetailsModal from '../components/PaymentDetailsModal';

import EditPaymentModal from '../components/EditPaymentModal';

import DeletePaymentModal from '../components/DeletePaymentModal';
import ApprovePaymentModal from '../components/ApprovePaymentModal';

import {

getAllPayments,

getPaymentsByMember,

recordPayment,

updatePayment,

deletePayment as apiDeletePayment,

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

const [statusInput, setStatusInput] = useState('PAID');

const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

const [paymentMethodInput, setPaymentMethodInput] = useState('Cash (Offline)');

const [evidenceFile, setEvidenceFile] = useState(null);

const [submitting, setSubmitting] = useState(false);

// Modal states

const [viewPayment, setViewPayment] = useState(null);

const [editPayment, setEditPayment] = useState(null);

const [deleteTargetPayment, setDeleteTargetPayment] = useState(null);
  const [approveTargetPayment, setApproveTargetPayment] = useState(null);

// Section Tab state ('recorded' | 'overdue' | 'all')

const [ledgerTab, setLedgerTab] = useState('recorded');

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

memberEmail: p.memberEmail,

evidenceUrls: p.evidenceUrls || []

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

if (gList.length > 0) {

const first = gList[0];

setSelectedGroupId(String(first.id));

if (first.contributionAmount) {

setAmountInput(String(first.contributionAmount));

}

}

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

// Auto-select active or first cycle

if (cyclesList.length > 0) {

const activeCycle = cyclesList.find(c => c.status === 'ACTIVE') || cyclesList[0];

setSelectedCycleId(String(activeCycle.id));

}

if (!isAdmin && !isOrganizer && userId) {

setSelectedMemberId(String(userId));

} else if (membersList.length > 0) {

const firstMemId = membersList[0].user?.id || membersList[0].userId || membersList[0].id || userId;

setSelectedMemberId(String(firstMemId));

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

if (paymentMethodInput !== 'Cash (Offline)' && !evidenceFile) {

alert('Bank deposit slip / payment proof is mandatory for Bank Deposit / Transfer. Please upload the deposit slip.');

return;

}

setSubmitting(true);

try {

const isMemberUser = !isAdmin && !isOrganizer;

const targetStatus = isMemberUser ? 'PENDING' : statusInput;

const createdRes = await recordPayment(

{

cycleId: Number(selectedCycleId),

memberId: Number(targetMemberId),

amount: parseFloat(amountInput),

status: targetStatus,

paymentDate: dateInput,

paymentMethod: paymentMethodInput,

notes: (isAdmin || isOrganizer) ? 'Recorded via Payment Management portal' : 'Submitted by member with payment slip (Awaiting Approval)'

},

userId || 1

);

const created = createdRes?.data || createdRes;

const paymentId = created?.id;

if (evidenceFile && paymentId) {

try {

await uploadPaymentEvidence(paymentId, evidenceFile);

} catch (fileErr) {

console.error('Failed to attach digital slip', fileErr);

}

}

if (isMemberUser) {

alert('Contribution slip submitted successfully! Your payment is now PENDING organizer verification and approval.');

setLedgerTab('pending');

} else {

alert(paymentMethodInput === 'Cash (Offline)' ? 'Offline cash payment recorded successfully! Official electronic receipt is generated and available in payment details.' : `Bank payment recorded successfully with attached deposit slip!`);

if (statusInput === 'OVERDUE' || statusInput === 'PARTIAL') {

setLedgerTab('overdue');

} else {

setLedgerTab('recorded');

}

}

setAmountInput('');

setStatusInput('PAID');

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

// Handle Delete Record (Admin Only)

const handleDeleteRecord = async (target) => {

if (!isAdmin) {

alert('Security Protection: Only system administrators are authorized to permanently delete payment records.');

return;

}

try {

await apiDeletePayment(target.id);

setDeleteTargetPayment(null);

fetchPayments();

} catch (err) {

console.error('Failed to delete payment from database', err);

alert('Failed to delete payment: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));

fetchPayments();

}

};

// Handle One-Click Approval for Pending Member Submission (Read-Only Verification)

const handleApprovePayment = async (payment, approvalNotes) => {

try {

const finalNotes = approvalNotes

? `${payment.notes ? payment.notes + ' | ' : ''}Verified & Approved by Organizer: ${approvalNotes}`

: (payment.notes || 'Verified and approved by Organizer');

await updatePayment(payment.id, {

status: 'PAID',

notes: finalNotes

}, userId);

alert(`Payment of ${Number(payment.amount).toLocaleString()} LKR for ${payment.member} approved successfully! The record is now marked as PAID and moved to the Recorded Payments Ledger.`);

setLedgerTab('recorded');

await fetchPayments();

} catch (err) {

console.error('Failed to approve payment', err);

const msg = err.response?.data?.message || err.message || 'Error approving payment.';

alert(`Error approving payment: ${msg}`);

fetchPayments();

}

};

// Handle Rejection for Invalid/Unverified Pending Submission

const handleRejectPayment = async (payment, rejectionReason) => {

try {

await updatePayment(payment.id, {

status: 'MISSED',

notes: `Rejected by Organizer on ${new Date().toLocaleDateString()}: ${rejectionReason || 'Deposit slip unverified'}`

}, userId);

alert(`Payment submission for ${payment.member} has been rejected.`);

await fetchPayments();

} catch (err) {

console.error('Failed to reject payment', err);

const msg = err.response?.data?.message || err.message || 'Error rejecting payment.';

alert(`Error rejecting payment: ${msg}`);

fetchPayments();

}

};

// Handle Settle Overdue Payment via Settlement Modal

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

}, userId);

if (updated.evidenceFile) {

try {

await uploadPaymentEvidence(updated.id, updated.evidenceFile);

} catch (fileErr) {

console.error('Failed to attach digital slip', fileErr);

}

}

alert(`Payment for ${updated.member} settled successfully as ${updated.status === 'LATE' ? 'Paid (Late)' : updated.status} and moved to Recorded Payments Ledger!`);

if (updated.status === 'PAID' || updated.status === 'LATE') {

setLedgerTab('recorded');

}

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

return <span className="badge-paid text-nowrap" style={{ cursor: 'pointer' }}>Paid</span>;

case 'LATE':

return <span className="badge bg-warning text-dark px-2 py-1 rounded-2 fw-semibold text-nowrap" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>Paid (Late)</span>;

case 'PENDING':

return <span className="badge-pending text-nowrap" style={{ cursor: 'pointer' }}>Pending</span>;

case 'OVERDUE':

case 'MISSED':

return <span className="badge-overdue text-nowrap" style={{ cursor: 'pointer' }}>Overdue</span>;

case 'PARTIAL':

return <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-2 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>Partial</span>;

default:

return <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 rounded-2 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.75rem' }}>{status}</span>;

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

// Separate counts for Recorded vs Overdue

const recordedCount = payments.filter((p) => p.status === 'PAID' || p.status === 'LATE').length;

const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

const overdueCount = payments.filter((p) => p.status === 'OVERDUE' || p.status === 'MISSED' || p.status === 'PARTIAL').length;

const filteredPayments = payments.filter((p) => {

// Tab filtering:

if (ledgerTab === 'recorded') {

if (p.status !== 'PAID' && p.status !== 'LATE') return false;

} else if (ledgerTab === 'pending') {

if (p.status !== 'PENDING') return false;

} else if (ledgerTab === 'overdue') {

if (p.status !== 'OVERDUE' && p.status !== 'MISSED' && p.status !== 'PARTIAL') return false;

}

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

.filter((p) => p.status === 'PAID' || p.status === 'LATE')

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

<h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('payments_page.title', 'Payment Tracking')}</h2>

<div className="d-flex align-items-center gap-2">

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

{metricsSource.filter((p) => p.status === 'PAID' || p.status === 'LATE').length} Paid Payments

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

{isAdmin ? (

<div className="alert alert-light border shadow-xs d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 rounded-3" style={{ background: '#F8FAFC' }}>

<div className="d-flex align-items-center gap-2">

<span className="badge bg-dark text-white px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>

<Icon name="shield" size={13} color="#FFFFFF" />

<span>Platform Oversight Mode</span>

</span>

<span className="text-muted small">

You are reviewing verified transactions, receipts, and automated delinquency recovery desks across all circles.

</span>

</div>

<span className="badge bg-light text-secondary border small">

Financial Audit • Emergency Override Enabled

</span>

</div>

) : isOrganizer ? (

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

{!isAdmin && !isOrganizer ? (

<div className="form-control bg-light text-dark fw-semibold d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>

<span>{user?.fullName || user?.email || 'Me'}</span>

<span className="badge bg-primary-subtle text-primary border border-primary-subtle small">Member (You)</span>

</div>

) : (

<select

className="form-select bg-white"

value={selectedMemberId}

onChange={(e) => setSelectedMemberId(e.target.value)}

required

>

<option value="">{selectedGroupId ? '-- Select Member --' : '-- Select Group First --'}</option>

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

)}

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

required

>

<option value="">{selectedGroupId ? (groupCycles.length > 0 ? '-- Select Rotation Cycle --' : 'No cycles available') : '-- Select Group First --'}</option>

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

<div className="col-12 col-sm-6 col-md-2">

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

{/* Payment Status Dropdown */}

<div className="col-12 col-sm-6 col-md-2">

<label className="form-label small fw-semibold text-dark mb-1">

Status <span className="text-danger">*</span>

</label>

<select

className="form-select bg-white fw-semibold"

value={statusInput}

onChange={(e) => setStatusInput(e.target.value)}

title="Payment Status"

>

<option value="PAID">Paid (Full)</option>

<option value="LATE">Paid (Late)</option>

<option value="PARTIAL">Partial Payment</option>

</select>

</div>

{/* Date Input */}

<div className="col-12 col-sm-6 col-md-2">

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

Payment Method <span className="text-danger">*</span>

</label>

<select

className="form-select bg-white fw-semibold"

value={paymentMethodInput}

onChange={(e) => setPaymentMethodInput(e.target.value)}

title="Payment Settlement Method"

>

<option value="Cash (Offline)">Cash (Offline)</option>

<option value="Bank Deposit / Transfer">Bank Deposit / Transfer</option>

</select>

</div>

{/* Payment Slip / Evidence Attachment */}

<div className="col-12 col-sm-6 col-md-3">

<label className="form-label small fw-semibold text-dark mb-1">

{paymentMethodInput === 'Cash (Offline)' ? (

<span>System Receipt (Offline Cash)</span>

) : (

<span>

Deposit Slip / Proof <span className="text-danger">*</span>

</span>

)}

</label>

{paymentMethodInput === 'Cash (Offline)' ? (

<div className="text-muted small py-1.5 px-2 bg-light rounded border text-truncate" style={{ fontSize: '0.78rem' }}>

Official electronic receipt generated by system

</div>

) : (

<input

type="file"

accept="image/*,.pdf"

className="form-control bg-white"

title="Attach Bank Deposit Slip / Transfer Evidence (Mandatory)"

required

onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}

/>

)}

</div>

{/* Summary and Submit Bar */}

<div className="col-12 mt-3 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">

<div className="small text-muted">

{selectedGroupId && amountInput ? (

<span>

Recording: <strong className="text-dark">LKR {Number(amountInput || 0).toLocaleString()}</strong> as <span className="badge bg-success-subtle text-success border">{statusInput}</span> via <span className="badge bg-light text-dark border">{paymentMethodInput}</span>

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
        /* Member Bank Slip Submission Card */
        <div className="ui-card p-4 mb-4 shadow-sm rounded-3 border-0 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm me-3"
                style={{ backgroundColor: '#0097B2', width: '42px', height: '42px', minWidth: '42px', flexShrink: 0 }}
              >
                <Icon name="upload" size={20} color="#FFFFFF" />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: '#1A3644', fontSize: '1.1rem' }}>Submit Bank Transfer Slip</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                  Paid via online bank transfer or CDM deposit? Submit your receipt or transaction screenshot for organizer verification.
                </p>
              </div>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle small px-3 py-1.5">
              Verification Flow: PENDING Approval
            </span>
          </div>

          <div className="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3 border-0 bg-info-subtle text-info-emphasis">
            <Icon name="info" size={16} />
            <span>
              <strong>Notice:</strong> Offline cash contributions must be paid directly to your Seettu Organizer to receive an instant physical receipt. Use this portal exclusively to submit <strong>Bank Transfer / CDM Deposit Slips</strong>.
            </span>
          </div>

          <form onSubmit={handleRecordNew}>
            {/* Row 1: Seettu Group, Paying Member, Rotation Cycle */}
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
                    <option value="" disabled>No joined groups found</option>
                  )}
                </select>
              </div>

              {/* Member Display (Read-Only) */}
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Paying Member
                </label>
                <div className="form-control bg-light text-dark fw-semibold d-flex align-items-center justify-content-between" style={{ minHeight: '38px' }}>
                  <span>{user?.fullName || user?.email || 'Me'}</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">Member (You)</span>
                </div>
              </div>

              {/* Rotation Cycle Select */}
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Rotation Cycle <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  required
                >
                  <option value="">{selectedGroupId ? '-- Select Cycle --' : '-- Select Group First --'}</option>
                  {groupCycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      Cycle #{c.cycleNumber} ({c.dueDate || c.startDate || 'Current'}) - {c.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Contribution Amount, Payment Date, Payment Method (Fixed), Upload Bank Slip */}
            <div className="row g-3 mb-3">
              {/* Amount Input */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Transfer Amount (LKR) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-control fw-semibold"
                  placeholder="e.g. 5000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>

              {/* Payment Date */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Transfer Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  required
                />
              </div>

              {/* Payment Method (Locked) */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  className="form-control bg-light text-muted fw-semibold"
                  value="Bank Deposit / Transfer"
                  readOnly
                />
              </div>

              {/* Upload Deposit Slip / Evidence (Mandatory) */}
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Deposit Slip / Receipt Screenshot <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="form-control bg-white"
                  required
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Row 3: Notes / Reference */}
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Bank Reference / Transaction ID / Notes (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Commercial Bank Ref #TXN98124 or CDM Colombo 03"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="small text-muted">
                {selectedGroupId && amountInput ? (
                  <span>
                    Submitting: <strong className="text-dark">LKR {Number(amountInput || 0).toLocaleString()}</strong> with bank receipt for organizer verification.
                  </span>
                ) : (
                  <span>Select group, cycle, and upload bank transfer slip to submit for approval.</span>
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
                    <span>Submitting Slip...</span>
                  </>
                ) : (
                  <>
                    <Icon name="upload" size={16} />
                    <span>Submit Bank Slip for Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Official Payment Ledger Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 p-3 bg-white rounded-3 border shadow-xs">
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-teal-subtle text-teal" style={{ width: '38px', height: '38px' }}>
            <Icon name="check-circle" size={18} color="#0097B2" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>Official Payment Ledger</h5>
            <small className="text-muted">Verified member contributions and timestamped receipts recorded directly by circle organizers</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill bg-light text-dark border px-3 py-1.5 fw-semibold">
            {filteredPayments.length} {filteredPayments.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>
      </div>

      {/* Ledger Navigation Tabs */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill d-inline-flex align-items-center gap-2 ${
            ledgerTab === 'recorded' ? 'btn-teal text-white shadow-sm' : 'btn-light border text-secondary'
          }`}
          onClick={() => setLedgerTab('recorded')}
        >
          <Icon name="check-circle" size={15} color={ledgerTab === 'recorded' ? '#FFFFFF' : '#188754'} />
          <span>Confirmed Ledger</span>
          <span className={`badge rounded-pill ${ledgerTab === 'recorded' ? 'bg-white text-teal' : 'bg-secondary-subtle text-secondary'}`}>
            {recordedCount}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill d-inline-flex align-items-center gap-2 ${
            ledgerTab === 'pending' ? 'btn-warning text-dark shadow-sm' : 'btn-light border text-secondary'
          }`}
          onClick={() => setLedgerTab('pending')}
        >
          <Icon name="clock" size={15} color={ledgerTab === 'pending' ? '#212529' : '#E67E22'} />
          <span>Pending Bank Slips</span>
          <span className={`badge rounded-pill ${ledgerTab === 'pending' ? 'bg-dark text-white' : pendingCount > 0 ? 'bg-warning text-dark' : 'bg-secondary-subtle text-secondary'}`}>
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill d-inline-flex align-items-center gap-2 ${
            ledgerTab === 'overdue' ? 'btn-danger text-white shadow-sm' : 'btn-light border text-secondary'
          }`}
          onClick={() => setLedgerTab('overdue')}
        >
          <Icon name="warning" size={15} color={ledgerTab === 'overdue' ? '#FFFFFF' : '#DC3545'} />
          <span>Overdue Action Desk</span>
          <span className={`badge rounded-pill ${ledgerTab === 'overdue' ? 'bg-white text-danger' : overdueCount > 0 ? 'bg-danger text-white' : 'bg-secondary-subtle text-secondary'}`}>
            {overdueCount}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill d-inline-flex align-items-center gap-2 ${
            ledgerTab === 'all' ? 'btn-dark text-white shadow-sm' : 'btn-light border text-secondary'
          }`}
          onClick={() => setLedgerTab('all')}
        >
          <Icon name="list" size={15} color={ledgerTab === 'all' ? '#FFFFFF' : '#6C757D'} />
          <span>All Records</span>
          <span className={`badge rounded-pill ${ledgerTab === 'all' ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`}>
            {allCount}
          </span>
        </button>
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

{ledgerTab !== 'overdue' && <option value="PAID">Paid</option>}

{ledgerTab !== 'overdue' && <option value="LATE">Paid (Late)</option>}

{ledgerTab !== 'recorded' && <option value="OVERDUE">Overdue</option>}

{ledgerTab !== 'recorded' && <option value="PARTIAL">Partial</option>}

{ledgerTab !== 'recorded' && <option value="PENDING">Pending</option>}

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

<div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">

<div className="d-flex align-items-center gap-2">

<Icon

name={ledgerTab === 'overdue' ? 'warning' : 'credit-card'}

size={18}

color={ledgerTab === 'overdue' ? '#DC3545' : '#188754'}

/>

<h6 className="fw-bold mb-0 text-dark">

{ledgerTab === 'recorded' && 'Recorded Payments History'}

{ledgerTab === 'pending' && 'Pending Member Submissions & Verification Queue'}

{ledgerTab === 'overdue' && 'Overdue Contributions & Default Action Desk'}

{ledgerTab === 'all' && 'All Payment Records'}

</h6>

</div>

<span className="badge bg-light text-muted border small">

{filteredPayments.length} {filteredPayments.length === 1 ? 'record' : 'records'}

</span>

</div>

<div className="table-responsive">

<table className="table table-hover align-middle mb-0">

<thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>

<tr>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">{ledgerTab === 'overdue' ? 'Due Date' : 'Date'}</th>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">Group</th>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">{ledgerTab === 'overdue' ? 'Delinquent Member' : 'Member'}</th>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">Cycle</th>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">{ledgerTab === 'overdue' ? 'Due Amount' : 'Amount'}</th>

<th className="py-3 px-3 text-muted fw-semibold small text-center text-nowrap">Status</th>

<th className="py-3 px-3 text-muted fw-semibold small text-nowrap">{ledgerTab === 'pending' ? 'Verification' : ledgerTab === 'overdue' ? 'Detected By' : 'Recorded By'}</th>

<th className="py-3 px-3 text-muted fw-semibold small text-end text-nowrap" style={{ minWidth: '240px' }}>{ledgerTab === 'overdue' ? 'Recovery Actions' : 'Actions'}</th>

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

<h6 className="fw-bold mt-3 mb-1 text-dark">

{ledgerTab === 'overdue' ? 'No overdue payments or default notices' : 'No payments found'}

</h6>

<p className="text-muted small mb-3">

{ledgerTab === 'overdue'

? 'All group contributions are up to date! There are no delinquent payments or pending notices.'

: isFiltered

? 'No payment records match your search or filter criteria.'

: 'There are no recorded payments registered yet.'}

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

<td className="py-3 px-3 text-muted small text-nowrap">{p.date}</td>

<td className="py-3 px-3 text-dark small text-nowrap">{p.group}</td>

<td className="py-3 px-3 fw-semibold text-dark small text-nowrap">

{p.member}

</td>

<td className="py-3 px-3 text-muted small text-nowrap">{p.cycle}</td>

<td className="py-3 px-3 fw-semibold text-dark small text-nowrap">{Number(p.amount || 0).toLocaleString()} LKR</td>

<td

className="py-3 px-3 text-center text-nowrap"

onClick={() => setViewPayment(p)}

title="Click to view payment details"

>

{getStatusBadge(p.status)}

</td>

<td className="py-3 px-3 text-muted small text-nowrap">

{p.status === 'PENDING' ? (

<div className="d-flex flex-column align-items-start gap-1">

<span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 text-nowrap">

Awaiting Organizer Approval

</span>

{p.evidenceUrls && p.evidenceUrls.length > 0 ? (

<span

className="badge bg-info-subtle text-info-emphasis border border-info-subtle d-inline-flex align-items-center gap-1"

style={{ fontSize: '0.72rem', cursor: 'pointer' }}

onClick={(e) => {

e.stopPropagation();

setViewPayment(p);

}}

title="Click to view bank deposit slip"

>

<Icon name="paperclip" size={11} /> {p.evidenceUrls.length} Slip Attached

</span>

) : (

<span className="text-muted" style={{ fontSize: '0.72rem' }}>

{p.method}

</span>

)}

</div>

) : (p.status === 'OVERDUE' || p.status === 'MISSED') ? (

<span className="badge bg-light text-secondary border px-2 py-1 text-nowrap">

{p.recordedBy && p.recordedBy !== '—' && p.recordedBy !== 'Organizer' ? p.recordedBy : 'System Auto-Detected'}

</span>

) : (

<div className="d-flex flex-column align-items-start">

<span className="badge bg-light text-secondary border px-2 py-1 text-nowrap">{p.recordedBy || '—'}</span>

{p.evidenceUrls && p.evidenceUrls.length > 0 && (

<span

className="badge bg-light text-muted border d-inline-flex align-items-center gap-1 mt-0.5 text-nowrap"

style={{ fontSize: '0.7rem' }}

>

<Icon name="paperclip" size={10} /> Slip on file

</span>

)}

</div>

)}

</td>

<td

className="py-3 px-3 text-end text-nowrap"

onClick={(e) => e.stopPropagation()}

>

<div className="d-flex justify-content-end align-items-center gap-2">

{p.status === 'PENDING' && (isAdmin || isOrganizer) && (
                        <button
                          className="btn btn-sm btn-success px-3 py-1 small fw-semibold text-nowrap d-inline-flex align-items-center gap-1 shadow-xs"
                          title="Verify Deposit Slip & Approve Payment"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApproveTargetPayment(p);
                          }}
                        >
                          <Icon name="check" size={13} color="#FFFFFF" />
                          <span>Verify & Approve</span>
                        </button>
                      )}
                      <button

className="btn btn-sm btn-outline-secondary px-3 py-1 small fw-semibold text-nowrap"

onClick={(e) => {

e.stopPropagation();

setViewPayment(p);

}}

>

View Receipt

</button>

{(isAdmin || isOrganizer) && (

<button

className="btn btn-light btn-sm text-secondary border px-2 py-1 shadow-xs"

title="Edit Payment Record"

onClick={(e) => {

e.stopPropagation();

setEditPayment(p);

}}

>

<Icon name="pencil" size={13} color="#188754" />

</button>

)}

{isAdmin && (

<button

className="btn btn-light btn-sm text-danger border px-2 py-1 shadow-xs"

title="Delete Payment (Admin Only)"

onClick={(e) => {

e.stopPropagation();

setDeleteTargetPayment(p);

}}

>

<Icon name="trash" size={13} color="#DC3545" />

</button>

)}

</div>

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

show={!!deleteTargetPayment}

onHide={() => setDeleteTargetPayment(null)}

payment={deleteTargetPayment}

onDelete={handleDeleteRecord}

/>

      <ApprovePaymentModal
        show={!!approveTargetPayment}
        onHide={() => setApproveTargetPayment(null)}
        payment={approveTargetPayment}
        onApprove={async (payment, notes) => {
          await handleApprovePayment(payment, notes);
          setApproveTargetPayment(null);
        }}
        onReject={async (payment, reason) => {
          await handleRejectPayment(payment, reason);
          setApproveTargetPayment(null);
        }}
      />

</div>

);

};

export default PaymentTracking;

