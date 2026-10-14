import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGroupById, addMember, deleteGroup, removeMember } from '../api/groupApi';
import { getAllMembersWithKyc } from '../api/userApi';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

const GroupDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignPayoutModal, setShowAssignPayoutModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedPayoutMemberId, setSelectedPayoutMemberId] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [verifiedMembers, setVerifiedMembers] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete the group "${group?.name}"? All associated cycle and membership records will be deleted.`)) {
      return;
    }
    try {
      await deleteGroup(id);
      alert(`Group "${group?.name}" deleted successfully.`);
      navigate('/groups');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to delete group from database.'));
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from this group?`)) {
      return;
    }
    try {
      await removeMember(id, userId);
      setActionMsg(`Member ${memberName} removed successfully.`);
      await fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to remove member.'));
    }
  };

  const fetchGroup = async () => {
    try {
      const res = await getGroupById(id);
      setGroup(res.data);
    } catch (error) {
      console.error('Failed to fetch group details', error);
      setErrorMsg(getErrorMessage(error, 'Failed to fetch group details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    if (isOrganizer || isAdmin) {
      getAllMembersWithKyc()
        .then(res => setVerifiedMembers(Array.isArray(res) ? res : (res?.data || [])))
        .catch(err => console.error('Failed to load verified members', err));
    }
  }, [id, isOrganizer, isAdmin]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionMsg('');
    setErrorMsg('');
    try {
      await addMember(id, memberUserId);
      setActionMsg('✓ Member added successfully to group!');
      setShowAddMemberModal(false);
      setMemberUserId('');
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to add member to group.'));
    }
  };

  const handleAssignPayout = async (e) => {
    e.preventDefault();
    if (!selectedCycle || !selectedPayoutMemberId) return;
    setActionMsg('');
    setErrorMsg('');
    try {
      await api.put(`/payment-cycles/${selectedCycle.id}/payout-member?memberId=${selectedPayoutMemberId}`);
      setActionMsg(`✓ Payout for Cycle #${selectedCycle.cycleNumber} assigned successfully!`);
      setShowAssignPayoutModal(false);
      setSelectedCycle(null);
      setSelectedPayoutMemberId('');
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to assign payout member.'));
    }
  };

  const handleCycleStatusChange = async (cycleId, status) => {
    setActionMsg('');
    setErrorMsg('');
    try {
      await api.put(`/payment-cycles/${cycleId}/status?status=${status}`);
      setActionMsg(`✓ Cycle status updated to ${status}!`);
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to update cycle status.'));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading group details & rotation schedule...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="alert alert-danger shadow-sm my-4">
        Group details not found. <Link to="/groups">Back to Groups</Link>
      </div>
    );
  }

  const totalPool = (group.contributionAmount || 0) * (group.memberCount || 1);
  const activeCycle = group.cycles?.find(c => c.status === 'ACTIVE') || group.cycles?.[0];

  return (
    <div className="py-2">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h2 className="fw-bold text-dark mb-0">{group.name}</h2>
            <span className="badge bg-primary fs-6">{group.status || 'ACTIVE'}</span>
            <span className="badge bg-secondary-subtle text-dark border">{group.category}</span>
            <span className="badge bg-info-subtle text-info border">Cycle Frequency: {group.cycleFrequency}</span>
          </div>
          <p className="text-muted mb-0">{group.description || 'Seettu group management space'}</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/groups" className="btn btn-outline-secondary">
            ← Back to Groups
          </Link>
          {(isOrganizer || isAdmin) && (
            <>
              <button className="btn btn-teal fw-semibold d-flex align-items-center gap-1" onClick={() => setShowAddMemberModal(true)}>
                <span>+</span> Add Member
              </button>
              <button className="btn btn-outline-danger fw-semibold d-flex align-items-center gap-1" onClick={handleDeleteGroup}>
                Delete Group
              </button>
            </>
          )}
        </div>
      </div>

      {actionMsg && <div className="alert alert-success shadow-sm mb-4 fw-bold">{actionMsg}</div>}
      {errorMsg && <div className="alert alert-danger shadow-sm mb-4 fw-bold">{errorMsg}</div>}

      <div className="row g-4 mb-4">
        {/* Summary Side Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100 overflow-hidden" style={{ borderRadius: '12px' }}>
            <div className="card-header text-white fw-bold d-flex justify-content-between align-items-center py-3 px-4" style={{ backgroundColor: '#134A5A' }}>
              <span>Group & Pool Summary</span>
              {activeCycle && <span className="badge rounded-pill bg-light text-dark">Active Cycle #{activeCycle.cycleNumber}</span>}
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Contribution / Member</span>
                  <strong className="text-primary fs-6">LKR {(group.contributionAmount || 0).toLocaleString()}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Cycle Frequency</span>
                  <strong className="text-dark">{group.cycleFrequency || 'MONTHLY'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Total Pool Amount</span>
                  <strong className="text-success fw-bold fs-6">LKR {totalPool.toLocaleString()}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Enrolled Members</span>
                  <strong className="text-dark">{group.members?.length || 0} / {group.memberCount || 0} Members</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Created By</span>
                  <strong className="text-dark">{group.createdByName || 'Organizer'}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom p-0">
              <ul className="nav nav-tabs card-header-tabs m-0 border-0">
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'members' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('members')}
                  >
                    Enrolled Members ({group.members?.length || 0})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'cycles' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('cycles')}
                  >
                    Seettu Rotation Cycles ({group.cycles?.length || 0})
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-0">
              {activeTab === 'members' && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Member ID</th>
                        <th>Member Name</th>
                        <th>Email</th>
                        <th>NIC Number</th>
                        <th>Status</th>
                        <th>Role</th>
                        {(isOrganizer || isAdmin) && <th className="text-end">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {group.members?.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                              #{m.userId || m.id}
                            </span>
                          </td>
                          <td className="fw-bold text-dark">{m.fullName}</td>
                          <td className="text-muted">{m.email}</td>
                          <td>
                            <span className="font-monospace text-muted small">{m.nicNumber || '-'}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border">
                              {m.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-secondary-subtle text-dark">
                              {m.role || 'MEMBER'}
                            </span>
                          </td>
                          {(isOrganizer || isAdmin) && (
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-2 small fw-semibold"
                                onClick={() => handleRemoveMember(m.userId || m.id, m.fullName)}
                                title="Remove member from group"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {(!group.members || group.members.length === 0) && (
                        <tr>
                          <td colSpan={(isOrganizer || isAdmin) ? 7 : 6} className="text-center py-4 text-muted">No members enrolled yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'cycles' && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Cycle #</th>
                        <th>Period</th>
                        <th>Payout Recipient</th>
                        <th>Status</th>
                        <th>Rotation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.cycles?.map((c) => (
                        <tr key={c.id}>
                          <td className="fw-bold">Cycle #{c.cycleNumber}</td>
                          <td className="small text-muted">
                            {c.startDate || '-'} to {c.endDate || '-'}
                          </td>
                          <td className="fw-semibold text-primary">
                            {c.payoutMemberName || c.payoutMember?.fullName || 'Pending Rotation Selection'}
                          </td>
                          <td>
                            <span className={`badge ${c.status === 'ACTIVE' ? 'bg-primary' : c.status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            {(isOrganizer || isAdmin) && (
                              <div className="d-flex gap-1 flex-wrap">
                                <button
                                  className="btn btn-sm btn-outline-primary fw-bold"
                                  onClick={() => {
                                    setSelectedCycle(c);
                                    setShowAssignPayoutModal(true);
                                  }}
                                >
                                   Select Payout
                                </button>
                                {c.status === 'ACTIVE' && (
                                  <button
                                    className="btn btn-sm btn-success fw-bold"
                                    onClick={() => handleCycleStatusChange(c.id, 'COMPLETED')}
                                  >
                                    ✓ Complete Cycle
                                  </button>
                                )}
                                {c.status === 'PENDING' && (
                                  <button
                                    className="btn btn-sm btn-warning text-dark fw-bold"
                                    onClick={() => handleCycleStatusChange(c.id, 'ACTIVE')}
                                  >
                                     Start Cycle
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!group.cycles || group.cycles.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">No payment cycles generated yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (() => {
        const matchedMember = verifiedMembers.find((vm) => String(vm.id) === String(memberUserId).trim());
        const alreadyEnrolled = group.members?.some((m) => String(m.userId || m.id) === String(memberUserId).trim());

        return (
          <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-dark">Add Member to {group.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddMemberModal(false)}></button>
                </div>
                <form onSubmit={handleAddMember}>
                  <div className="modal-body py-3">
                    <p className="small text-muted mb-3">
                      Only the <strong>Member ID</strong> is required to add a member to this Seettu group.
                    </p>

                    {verifiedMembers && verifiedMembers.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">
                          Quick Select from Verified Members (Optional)
                        </label>
                        <select
                          className="form-select"
                          value={memberUserId}
                          onChange={(e) => setMemberUserId(e.target.value)}
                        >
                          <option value="">-- Or choose from verified directory --</option>
                          {verifiedMembers
                            .filter((vm) => vm.role !== 'ADMIN')
                            .map((vm) => {
                              const enrolled = group.members?.some((m) => String(m.userId || m.id) === String(vm.id));
                              return (
                                <option key={vm.id} value={vm.id}>
                                  Member #{vm.id} — {vm.fullName} {vm.nicNumber ? `(${vm.nicNumber})` : ''} {enrolled ? '• Already Enrolled' : ''}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Member ID <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light font-monospace fw-bold text-muted">#</span>
                        <input
                          type="number"
                          className="form-control font-monospace"
                          placeholder="e.g. 3"
                          value={memberUserId}
                          onChange={(e) => setMemberUserId(e.target.value)}
                          required
                          min="1"
                          autoFocus
                        />
                      </div>
                      <small className="text-muted">Enter the unique registered Member ID.</small>
                    </div>

                    {memberUserId && matchedMember && (
                      <div className={`alert ${alreadyEnrolled ? 'alert-warning border-warning' : 'alert-success border-success'} py-2 px-3 mt-2 rounded-2 mb-0 small`}>
                        <div className="fw-bold text-dark">{matchedMember.fullName}</div>
                        <div className="text-muted">{matchedMember.email} • NIC: {matchedMember.nicNumber || 'N/A'}</div>
                        {alreadyEnrolled ? (
                          <div className="text-danger fw-bold mt-1">⚠️ This member is already enrolled in this group.</div>
                        ) : (
                          <div className="text-success fw-bold mt-1">✓ Identity Verified ({matchedMember.kycStatus})</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm px-3 fw-bold"
                      disabled={alreadyEnrolled || !memberUserId}
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign Payout Member Modal */}
      {showAssignPayoutModal && selectedCycle && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Select Payout Recipient for Cycle #{selectedCycle.cycleNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignPayoutModal(false)}></button>
              </div>
              <form onSubmit={handleAssignPayout}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Group Member to Receive Payout (LKR {totalPool.toLocaleString()})</label>
                    <select
                      className="form-select"
                      value={selectedPayoutMemberId}
                      onChange={(e) => setSelectedPayoutMemberId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {group.members?.map((m) => (
                        <option key={m.id || m.userId} value={m.userId || m.id}>
                          {m.fullName} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignPayoutModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-bold">Confirm Payout Assignment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
