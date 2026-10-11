import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import InviteMemberModal from '../components/InviteMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { getAllMembers, getAllGroups, removeMember, inviteMember } from '../api/groupApi';
import { getErrorMessage } from '../utils/errorHandler';
import { getPendingKycUsers, verifyMemberKyc } from '../api/userApi';

import { useAuth } from '../hooks/useAuth';

const getScoreMeta = (scoreNum) => {
  const num = Number(scoreNum);
  if (num >= 90) return { label: 'Excellent', color: '#188754' };
  if (num >= 75) return { label: 'Good', color: '#0D6EFD' };
  if (num >= 60) return { label: 'Fair', color: '#FFB020' };
  return { label: 'Poor', color: '#DC3545' };
};

const calculateScore = (member) => {
  if (member.score !== undefined) return member.score;
  const base = 85 + ((Number(member.id || 1) * 7) % 15);
  return Math.min(100, Math.max(50, base));
};

import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from '../api/joinRequestApi';

const Members = () => {
  const { isOrganizer, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [rawMembers, setRawMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingKycList, setPendingKycList] = useState([]);
  const [showRejectKycModal, setShowRejectKycModal] = useState(false);
  const [rejectKycTarget, setRejectKycTarget] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [membersRes, groupsRes, pendingRes, pendingKycRes] = await Promise.all([
        getAllMembers().catch(() => ({ data: [] })),
        getAllGroups().catch(() => ({ data: [] })),
        (isOrganizer || isAdmin) ? getPendingJoinRequests().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        (isOrganizer || isAdmin) ? getPendingKycUsers().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      const mList = membersRes?.data || membersRes || [];
      const gList = groupsRes?.data || groupsRes || [];
      const pList = pendingRes?.data || pendingRes || [];
      const kycList = pendingKycRes?.data || pendingKycRes || [];

      setRawMembers(Array.isArray(mList) ? mList : []);
      setGroups(Array.isArray(gList) ? gList : []);
      setPendingKycList(Array.isArray(kycList) ? kycList : []);

      if (Array.isArray(pList) && pList.length > 0) {
        const formattedPending = pList.map(r => ({
          id: r.id,
          memberName: r.user?.fullName || r.userName || 'Member',
          email: r.user?.email || 'N/A',
          groupName: r.group?.name || 'Seettu Group',
          date: r.requestedAt ? r.requestedAt.split('T')[0] : 'Today',
          status: r.status || 'PENDING'
        }));
        setPendingRequests(formattedPending);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Failed to load members or groups:', err);
      setErrorMsg(getErrorMessage(err, 'Failed to fetch members from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOrganizer, isAdmin]);

  const handleApproveRequest = async (reqId, memberName, groupName) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await approveJoinRequest(reqId);
      setActionMsg(`Member ${memberName} approved and successfully added to group "${groupName}" in MySQL database!`);
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to approve join request in database.'));
    }
  };

  const handleRejectRequest = async (reqId, memberName) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await rejectJoinRequest(reqId);
      setActionMsg(`Join request for ${memberName} was rejected.`);
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to reject join request in database.'));
    }
  };

  const handleApproveKyc = async (userId, memberName, role = null) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await verifyMemberKyc(userId, 'VERIFIED', '', role);
      const roleText = role === 'ORGANIZER' ? ' and promoted to Group Organizer' : '';
      setActionMsg(`✓ Member ${memberName} identity & Grama Niladhari Certificate successfully verified${roleText} in database!`);
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to verify member identity in database.'));
    }
  };

  const handleRejectKyc = async (userId, memberName, reason) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await verifyMemberKyc(userId, 'REJECTED', reason);
      setActionMsg(`Member ${memberName} verification was rejected with reason: "${reason}".`);
      setShowRejectKycModal(false);
      setRejectKycTarget(null);
      setRejectReasonInput('');
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to reject member verification.'));
    }
  };

  const handleAddMember = async ({ groupId, fullName, email, phone }) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await inviteMember(groupId, { fullName, email, phone });
      setActionMsg(`✓ Member ${fullName} added successfully to group!`);
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to add member to database.'));
      throw err;
    }
  };

  const handleDeleteMember = async (member) => {
    const name = member.name || member.user?.fullName || 'this member';
    const groupId = member.groupId || member.group?.id;
    const userId = member.userId || member.user?.id;

    if (!groupId || !userId) {
      alert('Cannot delete: Missing group or user ID.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove member ${name} from ${member.groupName || member.group?.name}?`)) {
      try {
        setActionMsg('');
        setErrorMsg('');
        await removeMember(groupId, userId);
        setActionMsg(` Member ${name} removed successfully.`);
        await fetchData();
      } catch (err) {
        setErrorMsg(getErrorMessage(err, 'Failed to remove member.'));
      }
    }
  };

  const handleSaveMember = (updated) => {
    // Update local display for edited score / fields
    setRawMembers(prev => prev.map(m => {
      const uId = m.user?.id || m.id;
      if (uId === updated.userId || m.id === updated.id) {
        return {
          ...m,
          score: updated.score,
          user: {
            ...m.user,
            fullName: updated.name,
            email: updated.email,
            phone: updated.phone
          }
        };
      }
      return m;
    }));
    setActionMsg(` Updated member details for ${updated.name}`);
  };

  // Normalized display items
  const formattedMembers = rawMembers
    .filter((m) => {
      const role = (m.user?.role || m.role || '').toString().toUpperCase();
      return role !== 'ADMIN';
    })
    .map((m) => {
      const scoreVal = calculateScore(m);
      const scoreMeta = getScoreMeta(scoreVal);
      const dateStr = m.joinedAt ? m.joinedAt.split('T')[0] : 'N/A';

      return {
        id: m.id,
        userId: m.user?.id,
        groupId: m.group?.id,
        name: m.user?.fullName || 'Unknown Member',
        email: m.user?.email || 'N/A',
        phone: m.user?.phone || 'N/A',
        nicNumber: m.user?.nicNumber || '-',
        kycStatus: m.user?.kycStatus || 'UNVERIFIED',
        gnCertificateUrl: m.user?.gnCertificateUrl,
        groupName: m.group?.name || 'General Group',
        joinedDate: dateStr,
        score: scoreVal,
        scoreLabel: scoreMeta.label,
        scoreColor: scoreMeta.color,
        status: m.status === 'ACTIVE' || !m.status ? 'Active' : m.status
      };
    });

  const filteredMembers = formattedMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    const matchesGroup = groupFilter === 'All' || m.groupName === groupFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="members-page-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Members</h2>
          <p className="text-muted small mb-0">Manage registered members across all Seettu groups</p>
        </div>
        {(isOrganizer || isAdmin) && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2"
          >
            <Icon name="user-plus" size={18} />
            <span>Invite Members</span>
          </button>
        )}
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check" size={18} />
          <div>{actionMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionMsg('')} aria-label="Close"></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{errorMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')} aria-label="Close"></button>
        </div>
      )}

      {/* Identity & Grama Niladhari Character Verification Queue */}
      {(isOrganizer || isAdmin) && pendingKycList.length > 0 && (
        <div className="ui-card p-4 mb-4 shadow-sm border-0 rounded-3 border-start border-4 border-warning">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <Icon name="shield" size={20} color="#1A5265" />
                <span>Member Identity & Grama Niladhari Verification Queue ({pendingKycList.length})</span>
              </h5>
              <small className="text-muted">
                Review applicant Sri Lankan NIC numbers and Grama Niladhari Character Certificates to prevent duplicate members and fraud before group entry.
              </small>
            </div>
            <span className="badge rounded-pill bg-warning text-dark px-3 py-1.5 fw-bold">Verification Required</span>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Applicant Name</th>
                  <th>Contact Details</th>
                  <th>NIC Number</th>
                  <th>Grama Niladhari Proof</th>
                  <th>Submission Date</th>
                  <th className="text-end">Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingKycList.map((usr) => (
                  <tr key={usr.id}>
                    <td className="fw-bold text-dark">
                      <div>{usr.fullName}</div>
                      {usr.requestedRole === 'ORGANIZER' && (
                        <div className="mt-1">
                          <span className="badge bg-teal bg-opacity-10 text-dark border border-secondary border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem', backgroundColor: '#E2F0F3', color: '#1A5265' }}>
                            <Icon name="users" size={12} color="#1A5265" />
                            <span>Requested: Organizer</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="small text-muted">
                      <div>{usr.email}</div>
                      <div>{usr.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {usr.nicNumber || 'N/A'}
                      </span>
                      <span className="badge bg-success bg-opacity-10 text-success border border-success ms-1 small" style={{ fontSize: '0.72rem' }}>
                        Unique NIC
                      </span>
                    </td>
                    <td>
                      {usr.gnCertificateUrl ? (
                        <a
                          href={`http://localhost:8081${usr.gnCertificateUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <Icon name="file-text" size={14} />
                          <span>View GN Certificate</span>
                        </a>
                      ) : (
                        <span className="text-muted small">No File</span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {usr.createdAt ? usr.createdAt.split('T')[0] : 'Recent'}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2 align-items-center justify-content-end">
                        <button
                          onClick={() => handleApproveKyc(usr.id, usr.fullName)}
                          className="btn btn-sm btn-success px-3 py-1.5 shadow-sm fw-semibold d-inline-flex align-items-center gap-1.5"
                          style={{ height: '36px', minWidth: '135px', justifyContent: 'center' }}
                          title="Verify as Participating Member"
                        >
                          <Icon name="check" size={15} />
                          <span>Verify Member</span>
                        </button>
                        {isAdmin && usr.requestedRole === 'ORGANIZER' && (
                          <button
                            onClick={() => handleApproveKyc(usr.id, usr.fullName, 'ORGANIZER')}
                            className="btn btn-sm px-3 py-1.5 shadow-sm fw-semibold d-inline-flex align-items-center gap-1.5 text-white"
                            style={{ backgroundColor: '#1A5265', height: '36px', minWidth: '175px', justifyContent: 'center' }}
                            title="Applicant explicitly requested Organizer status. Click to approve and promote."
                          >
                            <Icon name="user-check" size={15} />
                            <span>Make Organizer</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRejectKycTarget(usr);
                            setShowRejectKycModal(true);
                          }}
                          className="btn btn-sm btn-outline-danger px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
                          style={{ height: '36px', minWidth: '85px', justifyContent: 'center' }}
                        >
                          <Icon name="x" size={15} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Join Requests Section for Organizers / Admins */}
      {(isOrganizer || isAdmin) && pendingRequests.length > 0 && (
        <div className="ui-card p-4 mb-4 shadow-sm border-0 rounded-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{ color: '#1A3644' }}>
              Pending Group Join Requests ({pendingRequests.length})
            </h5>
            <span className="badge rounded-pill bg-warning text-dark px-3 py-1">Requires Organizer Approval</span>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Requested Seettu Group</th>
                  <th>Request Date</th>
                  <th className="text-end">Organizer Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-semibold text-dark">{req.memberName}</td>
                    <td className="text-muted small">{req.email}</td>
                    <td><span className="badge-mint">{req.groupName}</span></td>
                    <td className="text-muted small">{req.date}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleApproveRequest(req.id, req.memberName, req.groupName)}
                        className="btn btn-sm btn-success px-3 me-2 shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id, req.memberName)}
                        className="btn btn-sm btn-outline-danger px-2"
                      >
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="input-group bg-white rounded-3 border">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              className="form-control border-0 shadow-none ps-1"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select rounded-3 border bg-white"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="All">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select rounded-3 border bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="REMOVED">Removed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="py-3 px-3 text-muted fw-semibold small">Member Name</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Email</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Phone</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Group</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Joined Date</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Identity (NIC & GN)</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Discipline Score</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Status</th>
                {(isOrganizer || isAdmin) && <th className="py-3 px-3 text-muted fw-semibold small text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={(isOrganizer || isAdmin) ? "9" : "8"} className="text-center py-5">
                    <div className="spinner-border text-teal" role="status" style={{ color: '#1A5265' }}></div>
                    <p className="mt-2 text-muted small">Loading members from database...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={(isOrganizer || isAdmin) ? "9" : "8"} className="text-center py-5">
                    <Icon name="users" size={36} color="#94A3B8" className="mb-2" />
                    <h6 className="fw-bold text-dark">No members found</h6>
                    <p className="text-muted small mb-0">No active members match the current filters or no members are registered yet.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 px-3 fw-semibold text-dark">{member.name}</td>
                    <td className="py-3 px-3 text-muted small">{member.email}</td>
                    <td className="py-3 px-3 text-muted small">{member.phone}</td>
                    <td className="py-3 px-3 text-dark small">{member.groupName}</td>
                    <td className="py-3 px-3 text-muted small">{member.joinedDate}</td>
                    <td className="py-3 px-3 text-center">
                      {member.kycStatus === 'VERIFIED' ? (
                        <div>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                            <Icon name="check" size={11} className="me-1" />Verified
                          </span>
                          <div className="font-monospace text-muted mt-0.5" style={{ fontSize: '0.72rem' }}>
                            {member.nicNumber}
                          </div>
                        </div>
                      ) : member.kycStatus === 'PENDING' ? (
                        <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                          <Icon name="clock" size={11} className="me-1" />KYC Pending
                        </span>
                      ) : member.kycStatus === 'REJECTED' ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                          Rejected
                        </span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-0.5 rounded-pill small">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="fw-bold" style={{ color: member.scoreColor }}>
                        {member.score}
                      </span>
                      <span className="small ms-1" style={{ color: member.scoreColor }}>
                        ({member.scoreLabel})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="badge-mint">
                        {member.status}
                      </span>
                    </td>
                    {(isOrganizer || isAdmin) && (
                      <td className="py-3 px-3 text-end">
                        <div className="d-flex justify-end gap-2">
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#188754' }}
                            title="Edit Member"
                            onClick={() => setEditingMember(member)}
                          >
                            <Icon name="pencil" size={16} color="#188754" />
                          </button>
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title="Delete Member"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Icon name="trash" size={16} color="#DC3545" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectKycModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <Icon name="alert-circle" size={18} />
                  <span>Reject Member Verification</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectKycModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-dark small mb-3">
                  Rejecting verification for <strong>{rejectKycTarget?.fullName}</strong> (NIC: {rejectKycTarget?.nicNumber}).
                  Please provide a reason so the applicant can submit valid Grama Niladhari documentation.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Rejection Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Grama Niladhari seal is unclear, or NIC number mismatch."
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectKycModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 fw-bold"
                  onClick={() => handleRejectKyc(rejectKycTarget?.id, rejectKycTarget?.fullName, rejectReasonInput)}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InviteMemberModal
        show={showInviteModal}
        groups={groups}
        onHide={() => setShowInviteModal(false)}
        onAddMember={handleAddMember}
      />

      <EditMemberModal
        show={!!editingMember}
        onHide={() => setEditingMember(null)}
        member={editingMember}
        onSave={handleSaveMember}
      />
    </div>
  );
};

export default Members;
