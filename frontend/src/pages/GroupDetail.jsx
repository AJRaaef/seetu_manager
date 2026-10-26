import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGroupById, addMember, deleteGroup, removeMember } from '../api/groupApi';
import { getAllMembersWithKyc } from '../api/userApi';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';
import DisbursementVoucherModal from '../components/DisbursementVoucherModal';
import KulukkalDrawModal from '../components/KulukkalDrawModal';
import Icon from '../components/Icons';

const GroupDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignPayoutModal, setShowAssignPayoutModal] = useState(false);
  const [showKulukkalModal, setShowKulukkalModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedPayoutMemberId, setSelectedPayoutMemberId] = useState('');
  const [payoutMode, setPayoutMode] = useState('direct'); // 'direct', 'random', 'auction'
  const [bidDiscount, setBidDiscount] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [rolledName, setRolledName] = useState('');
  const [drawWinner, setDrawWinner] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCycle, setVoucherCycle] = useState(null);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [disbursementCycle, setDisbursementCycle] = useState(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [verifiedMembers, setVerifiedMembers] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetPayoutModal = () => {
    setSelectedPayoutMemberId('');
    setPayoutMode('direct');
    setBidDiscount('');
    setIsRolling(false);
    setRolledName('');
    setDrawWinner(null);
  };

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
        .catch(err => {
          console.warn('Could not load verified members list', err);
          setVerifiedMembers([]);
        });
    }
  }, [id, isOrganizer, isAdmin]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionMsg('');
    setErrorMsg('');
    try {
      await addMember(id, memberUserId);
      setActionMsg('Member added successfully to group!');
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
      let modeNote = '';
      if (payoutMode === 'random') modeNote = ' via Fair Random Lot Draw';
      else if (payoutMode === 'auction') {
        const disc = parseFloat(bidDiscount) || 0;
        modeNote = ` via Auction (Bid Discount: LKR ${disc.toLocaleString()})`;
      }
      setActionMsg(`Payout for Cycle #${selectedCycle.cycleNumber} assigned successfully${modeNote}!`);
      setShowAssignPayoutModal(false);
      resetPayoutModal();
      setSelectedCycle(null);
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to assign payout member.'));
    }
  };

  const handleCycleStatusChange = async (cycleId, status) => {
    setActionMsg('');
    setErrorMsg('');
    const targetCycle = group?.cycles?.find((c) => c.id === cycleId);

    if (status === 'COMPLETED') {
      const winnerName = targetCycle?.payoutMember?.fullName || targetCycle?.payoutMemberName;
      if (!winnerName || winnerName === 'Unassigned' || winnerName === 'Pending Rotation Selection') {
        alert(`Please assign a payout recipient member for Cycle #${targetCycle?.cycleNumber} before marking it as completed.`);
        setSelectedCycle(targetCycle);
        setShowAssignPayoutModal(true);
        return;
      }
      const confirmMsg = `Confirm Cycle #${targetCycle.cycleNumber} Completion:\n\nAre you sure you want to complete this cycle and disburse the rotational pot of LKR ${totalPool.toLocaleString()} to ${winnerName}?\n\n• An automatic notification will be sent to all circle members\n• Official Payout Verification Voucher will be issued\n• Next cycle will be activated automatically`;
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      await api.put(`/payment-cycles/${cycleId}/status?status=${status}`);
      if (status === 'COMPLETED') {
        setActionMsg(`Cycle #${targetCycle?.cycleNumber} completed successfully! Payout pot of LKR ${totalPool.toLocaleString()} disbursed. All circle members notified!`);
        setDisbursementCycle(targetCycle);
        setShowDisbursementModal(true);
      } else {
        setActionMsg(`Cycle status updated to ${status}!`);
      }
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
  const isAllCompleted = group.status === 'COMPLETED' || (Array.isArray(group.cycles) && group.cycles.length > 0 && group.cycles.every(c => c.status === 'COMPLETED'));
  const activeCycle = group.cycles?.find(c => c.status === 'ACTIVE') || (isAllCompleted ? null : group.cycles?.[0]);

  const formatModelLabel = (cat, typeObj) => {
    if (cat === 'AUCTION') return { label: 'Auction / Bidding Seettu', cls: 'bg-warning text-dark border' };
    if (cat === 'RANDOM_DRAW') return { label: 'Random Draw / Lottery', cls: 'bg-primary-subtle text-primary border border-primary' };
    if (cat === 'NON_MONETARY' || typeObj?.name === 'Non-Monetary') return { label: 'Non-Monetary Asset Seettu', cls: 'bg-success text-white' };
    return { label: 'Fixed Rotation Seettu', cls: 'bg-secondary-subtle text-dark border' };
  };

  const modelInfo = formatModelLabel(group.category, group.seettuType);

  return (
    <div className="py-2">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h2 className="fw-bold text-dark mb-0">{group.name}</h2>
            <span className={`badge ${isAllCompleted ? 'bg-success' : 'bg-primary'} fs-6`}>{isAllCompleted ? 'COMPLETED' : (group.status || 'ACTIVE')}</span>
            <span className={`badge ${modelInfo.cls}`}>{modelInfo.label}</span>
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
              <button 
                className="btn btn-outline-success fw-semibold d-flex align-items-center gap-1.5 shadow-xs" 
                onClick={() => setShowKulukkalModal(true)}
                title="Conduct Kulukkal Lot Drawing (குலுக்கல் சீட்டு)"
              >
                <Icon name="refresh" size={15} />
                <span>Kulukkal Draw (குலுக்கல்)</span>
              </button>
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
              {isAllCompleted ? (
                <span className="badge rounded-pill bg-success text-white">All Cycles Completed</span>
              ) : activeCycle ? (
                <span className="badge rounded-pill bg-light text-dark">Active Cycle #{activeCycle.cycleNumber}</span>
              ) : null}
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">Contribution / Member</span>
                  <strong className="text-primary fs-6">
                    LKR {(group.contributionAmount || 0).toLocaleString()} <span className="small text-muted fw-normal">
                      ({group.cycleFrequency === 'DAILY' ? 'per day' : group.cycleFrequency === 'WEEKLY' ? 'per week' : group.cycleFrequency === 'BI_WEEKLY' ? 'per 2 weeks' : 'per month'})
                    </span>
                  </strong>
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
                {group.shopName && (
                  <li className="list-group-item p-3 bg-light border-top">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Partner Merchant Shop</small>
                      <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.7rem' }}>Verified Partner</span>
                    </div>
                    <div className="fw-bold text-dark">{group.shopName}</div>
                    {group.shopAddress && <div className="text-muted small mt-0.5">{group.shopAddress}</div>}
                  </li>
                )}
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
                <>
                  {(isOrganizer || isAdmin) && (
                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div className="small text-muted">
                        <strong>Kulukkal Method (குலுக்கல்):</strong> Cycle #1 is allocated to the Organizer. Cycles #2+ are drawn via lot chits.
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs"
                        onClick={() => setShowKulukkalModal(true)}
                      >
                        <Icon name="refresh" size={14} />
                        <span>Conduct Kulukkal Draw (குலுக்கல்)</span>
                      </button>
                    </div>
                  )}
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
                            <div className="d-flex gap-1 flex-wrap">
                              {(isOrganizer || isAdmin) && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-primary fw-bold"
                                    onClick={() => {
                                      setSelectedCycle(c);
                                      resetPayoutModal();
                                      if (group.category === 'AUCTION') setPayoutMode('auction');
                                      else if (group.category === 'RANDOM_DRAW') setPayoutMode('random');
                                      else setPayoutMode('direct');
                                      if (c.payoutMember?.id || c.payoutMemberId) {
                                        setSelectedPayoutMemberId(String(c.payoutMember?.id || c.payoutMemberId));
                                      }
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
                                </>
                              )}
                              {(c.payoutMember || (c.payoutMemberName && c.payoutMemberName !== 'Unassigned' && c.payoutMemberName !== 'Pending Rotation Selection')) && (
                                <button
                                  className="btn btn-sm btn-outline-primary fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
                                  onClick={() => {
                                    setDisbursementCycle(c);
                                    setShowDisbursementModal(true);
                                  }}
                                  title="View Official Rotational Payout Disbursement Voucher"
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  <Icon name="award" size={13} />
                                  <span>Payout Voucher</span>
                                </button>
                              )}
                              {(c.payoutMemberName && c.payoutMemberName !== 'Unassigned' && c.payoutMemberName !== 'Pending Rotation Selection') && group.shopName && (
                                <button
                                  className="btn btn-sm btn-outline-success fw-bold"
                                  onClick={() => {
                                    setVoucherCycle(c);
                                    setShowVoucherModal(true);
                                  }}
                                  title="View Physical Asset Redemption Voucher"
                                >
                                  Asset Voucher
                                </button>
                              )}
                            </div>
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
                </>
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

      {/* Multi-Model Assign Payout Member Modal */}
      {showAssignPayoutModal && selectedCycle && (() => {
        const alreadyAwardedIds = (group.cycles || [])
          .filter(c => (c.payoutMember?.id || c.payoutMemberId) && c.id !== selectedCycle.id)
          .map(c => String(c.payoutMember?.id || c.payoutMemberId));

        const eligibleMembers = (group.members || []).filter(
          m => !alreadyAwardedIds.includes(String(m.userId || m.id))
        );

        const discountVal = parseFloat(bidDiscount) || 0;
        const netPayout = Math.max(0, totalPool - discountVal);
        const otherMembersCount = Math.max(1, (group.memberCount || group.members?.length || 2) - 1);
        const dividendPerMember = discountVal / otherMembersCount;

        const handleRunRandomDraw = () => {
          if (eligibleMembers.length === 0) return;
          setIsRolling(true);
          setDrawWinner(null);
          let counter = 0;
          const interval = setInterval(() => {
            const randomTemp = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
            setRolledName(randomTemp.fullName);
            counter++;
            if (counter > 12) {
              clearInterval(interval);
              const finalWinner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
              setIsRolling(false);
              setDrawWinner(finalWinner);
              setRolledName(finalWinner.fullName);
              setSelectedPayoutMemberId(String(finalWinner.userId || finalWinner.id));
            }
          }, 90);
        };

        return (
          <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="modal-header text-white" style={{ backgroundColor: '#235665' }}>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      Cycle #{selectedCycle.cycleNumber} Payout Selection
                    </h5>
                    <small className="text-white-50">
                      Select recipient via Fixed Rotation, Kulukkal Lot Draw (குலுக்கல்), or Auction Bidding
                    </small>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignPayoutModal(false)}></button>
                </div>

                {/* 3 Payout Allocation Modes */}
                <div className="bg-light border-bottom p-2 px-3">
                  <div className="nav nav-pills nav-fill gap-2">
                    <button
                      type="button"
                      className={`nav-link py-2 fw-bold text-nowrap rounded-3 ${payoutMode === 'direct' ? 'active shadow-sm' : 'text-secondary'}`}
                      style={payoutMode === 'direct' ? { backgroundColor: '#235665', color: '#fff' } : {}}
                      onClick={() => setPayoutMode('direct')}
                    >
                      Fixed Rotation
                    </button>
                    <button
                      type="button"
                      className={`nav-link py-2 fw-bold text-nowrap rounded-3 ${payoutMode === 'random' ? 'active shadow-sm' : 'text-secondary'}`}
                      style={payoutMode === 'random' ? { backgroundColor: '#235665', color: '#fff' } : {}}
                      onClick={() => setPayoutMode('random')}
                    >
                      Kulukkal Draw (குலுக்கல்)
                    </button>
                    <button
                      type="button"
                      className={`nav-link py-2 fw-bold text-nowrap rounded-3 ${payoutMode === 'auction' ? 'active shadow-sm' : 'text-secondary'}`}
                      style={payoutMode === 'auction' ? { backgroundColor: '#235665', color: '#fff' } : {}}
                      onClick={() => setPayoutMode('auction')}
                    >
                      Auction Bidding
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAssignPayout}>
                  <div className="modal-body p-4">
                    {/* MODE 1: FIXED ROTATION */}
                    {payoutMode === 'direct' && (
                      <div>
                        <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                          <strong>Fixed Rotation:</strong> Assign the next predetermined member in order to receive the standard lump-sum of <strong>LKR {totalPool.toLocaleString()}</strong>.
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold small text-secondary">Select Recipient Member <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            value={selectedPayoutMemberId}
                            onChange={(e) => setSelectedPayoutMemberId(e.target.value)}
                            required
                          >
                            <option value="">-- Choose Member --</option>
                            {group.members?.map((m) => {
                              const isAwarded = alreadyAwardedIds.includes(String(m.userId || m.id));
                              return (
                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                  {m.fullName} ({m.email}) {isAwarded ? '• (Already received payout)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* MODE 2: KULUKKAL LOT DRAW */}
                    {payoutMode === 'random' && (
                      <div>
                        <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                          {selectedCycle.cycleNumber === 1 ? (
                            <span><strong>Seettu Rule:</strong> Cycle #1 is allocated directly to the Circle Organizer ({group.createdByName || 'Organizer'}) as customary management remuneration.</span>
                          ) : (
                            <span><strong>Kulukkal Lot Shaker (குலுக்கல்):</strong> Fair algorithmic lot drawing among participating subscribers who have not received a payout yet.</span>
                          )}
                        </div>

                        <div className="p-4 text-center rounded-3 mb-3 border bg-light">
                          <div className="text-secondary small fw-bold mb-2">
                            {selectedCycle.cycleNumber === 1 ? 'CYCLE 1: ORGANIZER GUARANTEED TURN' : `ELIGIBLE MEMBERS IN KULUKKAL POOL: ${eligibleMembers.length}`}
                          </div>
                          
                          {isRolling ? (
                            <div className="py-3">
                              <div className="spinner-border text-primary mb-2" role="status"></div>
                              <h4 className="fw-bold font-monospace text-primary">{rolledName || 'Shuffling chits...'}</h4>
                              <small className="text-muted">Mixing Kulukkal chits in the shaker...</small>
                            </div>
                          ) : drawWinner ? (
                            <div className="py-2">
                              <span className="badge bg-success fs-6 px-3 py-2 mb-2 rounded-pill">KULUKKAL WINNER DRAWN</span>
                              <h3 className="fw-bold text-dark mt-1">{drawWinner.fullName}</h3>
                              <div className="text-muted small">{drawWinner.email} • ID #{drawWinner.userId || drawWinner.id}</div>
                              <div className="text-success small fw-semibold mt-1">Lump-sum Pot: LKR {totalPool.toLocaleString()}</div>
                            </div>
                          ) : (
                            <div className="py-2">
                              {selectedCycle.cycleNumber === 1 ? (
                                <div>
                                  <p className="text-muted small mb-3">
                                    Click below to assign Cycle #1 to the Organizer ({group.createdByName || 'Organizer'}).
                                  </p>
                                  <button
                                    type="button"
                                    className="btn btn-success px-4 py-2 fw-bold shadow-sm"
                                    onClick={() => {
                                      const organizer = (group.members || []).find(m => String(m.userId || m.id) === String(group.createdById)) || group.members?.[0];
                                      if (organizer) {
                                        setDrawWinner(organizer);
                                        setSelectedPayoutMemberId(String(organizer.userId || organizer.id));
                                      }
                                    }}
                                  >
                                    Assign to Organizer ({group.createdByName || 'Organizer'})
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-muted small mb-3">
                                    {eligibleMembers.length > 0
                                      ? `${eligibleMembers.length} active member(s) have not received a payout yet.`
                                      : 'All enrolled members have already received a payout!'}
                                  </p>
                                  <button
                                    type="button"
                                    className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                                    style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                                    onClick={handleRunRandomDraw}
                                    disabled={eligibleMembers.length === 0}
                                  >
                                    Shake Kulukkal Lots (குலுக்கல்)
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {drawWinner && selectedCycle.cycleNumber !== 1 && (
                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={handleRunRandomDraw}
                            >
                              Re-Draw Kulukkal Lot
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODE 3: AUCTION / BIDDING */}
                    {payoutMode === 'auction' && (
                      <div>
                        <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                          <strong>Auction / Bidding:</strong> Competitive discount bidding. The highest discount bidder takes the pot; their discount is redistributed as a dividend to reduce all other members' installment.
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-md-7">
                            <label className="form-label fw-bold small text-secondary">Winning Bidder <span className="text-danger">*</span></label>
                            <select
                              className="form-select"
                              value={selectedPayoutMemberId}
                              onChange={(e) => setSelectedPayoutMemberId(e.target.value)}
                              required
                            >
                              <option value="">-- Select Highest Bidder --</option>
                              {eligibleMembers.map((m) => (
                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                  {m.fullName} ({m.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-5">
                            <label className="form-label fw-bold small text-secondary">Winning Bid Discount (LKR) <span className="text-danger">*</span></label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="e.g. 15000"
                              min="0"
                              max={totalPool}
                              value={bidDiscount}
                              onChange={(e) => setBidDiscount(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Financial Ledger Breakdown */}
                        <div className="p-3 rounded-3 border bg-light">
                          <div className="row text-center g-2">
                            <div className="col-4 border-end">
                              <small className="text-muted d-block">Gross Pool</small>
                              <strong className="text-dark">LKR {totalPool.toLocaleString()}</strong>
                            </div>
                            <div className="col-4 border-end">
                              <small className="text-muted d-block">Bid Discount</small>
                              <strong className="text-danger">- LKR {discountVal.toLocaleString()}</strong>
                            </div>
                            <div className="col-4">
                              <small className="text-muted d-block">Net Payout</small>
                              <strong className="text-success fs-6">LKR {netPayout.toLocaleString()}</strong>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-top text-center">
                            <span className="badge bg-success-subtle text-success border small">
                              Dividend to {otherMembersCount} other members: LKR {dividendPerMember.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer border-top p-3 bg-white">
                    <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAssignPayoutModal(false)}>Cancel</button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-bold shadow-sm"
                      style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                      disabled={!selectedPayoutMemberId || isRolling}
                    >
                      Confirm Payout Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Official Rotational Payout Disbursement Voucher Modal */}
      <DisbursementVoucherModal
        show={showDisbursementModal}
        onHide={() => setShowDisbursementModal(false)}
        cycle={disbursementCycle}
        group={group}
        organizerName={group?.organizerName || user?.fullName}
      />

      {/* Non-Monetary Asset Collection Voucher Modal */}
      {showVoucherModal && voucherCycle && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="p-4 text-white position-relative" style={{ backgroundColor: '#134A5A' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success mb-2 px-3 py-1 font-monospace" style={{ fontSize: '0.75rem' }}>
                      NON-MONETARY ASSET REDEMPTION VOUCHER
                    </span>
                    <h3 className="fw-bold mb-1 text-white">Physical Asset Collection Order</h3>
                    <p className="mb-0 text-white-50 small">
                      The Cheetus Ordinance No. 61 of 1935 (Section 3) • SeettuManager Official Document
                    </p>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowVoucherModal(false)}></button>
                </div>
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="row g-4 mb-4">
                  {/* Beneficiary */}
                  <div className="col-md-6 border-end">
                    <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Beneficiary Subscriber (Prizewinner)</small>
                    <h4 className="fw-bold text-dark mt-1 mb-1">{voucherCycle.payoutMemberName || voucherCycle.payoutMember?.fullName}</h4>
                    <div className="text-muted small">Cycle Turn: <strong>Cycle #{voucherCycle.cycleNumber}</strong></div>
                    <div className="text-muted small">Asset Category: <strong>{group.category || 'Physical Goods'}</strong></div>
                    <div className="text-muted small">Validity Period: {voucherCycle.startDate} to {voucherCycle.endDate}</div>

                    <div className="mt-3 p-3 bg-light rounded-3 border">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Authorized Lump-Sum Asset Value</small>
                      <h4 className="fw-bold text-success mb-0">LKR {totalPool.toLocaleString()}</h4>
                    </div>
                  </div>

                  {/* Partner Merchant Showroom */}
                  <div className="col-md-6">
                    <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Partner Merchant Showroom</small>
                    <h4 className="fw-bold text-dark mt-1 mb-1">{group.shopName || 'Registered Partner Merchant'}</h4>
                    {group.shopAddress && (
                      <p className="text-muted small mb-2">{group.shopAddress}</p>
                    )}
                    <span className="badge bg-info-subtle text-info border">Verified Partner Merchant</span>

                    <div className="mt-3 p-3 bg-light rounded-3 border font-monospace">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Voucher Serial Code</small>
                      <strong className="text-dark">VCH-SEETTU-{group.id}-{voucherCycle.cycleNumber}-REDM</strong>
                    </div>
                  </div>
                </div>

                {/* Redemption Instructions & Terms */}
                <div className="alert alert-light border small text-secondary rounded-3 p-3 mb-0">
                  <div className="fw-bold text-dark mb-1">Redemption Instructions & Legal Notice:</div>
                  <ul className="mb-0 ps-3">
                    <li>Present this digital voucher along with your registered Sri Lankan National Identity Card (NIC) at the partner showroom address.</li>
                    <li>The partner merchant will release the physical goods and provide an official commercial tax invoice and manufacturer warranty.</li>
                    <li>The pooled sum of <strong>LKR {totalPool.toLocaleString()}</strong> is settled directly with the merchant by the group organizer.</li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button type="button" className="btn btn-secondary px-3" onClick={() => setShowVoucherModal(false)}>Close</button>
                <button 
                  type="button" 
                  className="btn btn-teal px-4 fw-bold text-white shadow-sm"
                  style={{ backgroundColor: '#235665' }}
                  onClick={() => window.print()}
                >
                  Print Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Kulukkal Draw Modal */}
      <KulukkalDrawModal
        show={showKulukkalModal}
        onHide={() => setShowKulukkalModal(false)}
        group={group}
        onDrawSuccess={(updatedCycles) => {
          setActionMsg('Kulukkal Draw completed successfully! Cycle #1 is allocated to Organizer, and other cycle turns have been fairly drawn.');
          fetchGroup();
        }}
      />
    </div>
  );
};

export default GroupDetail;
