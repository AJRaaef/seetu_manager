import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGroupById, addMember, deleteGroup, removeMember } from '../api/groupApi';
import { getAllMembersWithKyc } from '../api/userApi';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';
import DisbursementVoucherModal from '../components/DisbursementVoucherModal';
import KulukkalDrawModal from '../components/KulukkalDrawModal';
import Icon from '../components/Icons';
import { Check, CheckCircle2, AlertTriangle } from 'lucide-react';

const GroupDetail = () => {
  const { t } = useTranslation();
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
    if (!window.confirm(t('group_detail.delete_group_confirm', { groupName: group?.name }))) {
      return;
    }
    try {
      await deleteGroup(id);
      alert(t('group_detail.delete_group_success', { groupName: group?.name }));
      navigate('/groups');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('group_detail.delete_group_error')));
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(t('group_detail.remove_member_confirm', { memberName }))) {
      return;
    }
    try {
      await removeMember(id, userId);
      setActionMsg(t('group_detail.remove_member_success', { memberName }));
      await fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('group_detail.remove_member_error')));
    }
  };

  const fetchGroup = async () => {
    try {
      const res = await getGroupById(id);
      setGroup(res.data);
    } catch (error) {
      console.error('Failed to fetch group details', error);
      setErrorMsg(getErrorMessage(error, t('group_detail.fetch_group_error')));
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

    if ((group.members?.length || 0) >= (group.memberCount || 0)) {
      setErrorMsg(t('group_detail.maximum_member_count'));
      setShowAddMemberModal(false);
      return;
    }

    try {
      await addMember(id, memberUserId);
      setActionMsg(t('group_detail.member_added_success'));
      setShowAddMemberModal(false);
      setMemberUserId('');
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('group_detail.add_member_error')));
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
      if (payoutMode === 'random') modeNote = t('group_detail.payout_method_random');
      else if (payoutMode === 'auction') {
        const disc = parseFloat(bidDiscount) || 0;
        modeNote = t('group_detail.payout_method_auction', { amount: disc.toLocaleString() });
      }
      setActionMsg(t('group_detail.payout_assigned_success', { cycle: selectedCycle.cycleNumber, modeNote }));
      setShowAssignPayoutModal(false);
      resetPayoutModal();
      setSelectedCycle(null);
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('group_detail.assign_payout_error')));
    }
  };

  const handleCycleStatusChange = async (cycleId, status) => {
    setActionMsg('');
    setErrorMsg('');
    const targetCycle = group?.cycles?.find((c) => c.id === cycleId);

    if (status === 'COMPLETED') {
      const winnerName = targetCycle?.payoutMember?.fullName || targetCycle?.payoutMemberName;
      if (!winnerName || winnerName === 'Unassigned' || winnerName === 'Pending Rotation Selection') {
        alert(t('group_detail.assign_recipient_before_complete', { cycle: targetCycle?.cycleNumber }));
        setSelectedCycle(targetCycle);
        setShowAssignPayoutModal(true);
        return;
      }
      const confirmMsg = t('group_detail.complete_cycle_confirm', {
        cycle: targetCycle.cycleNumber,
        amount: totalPool.toLocaleString(),
        winner: winnerName,
      });
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      await api.put(`/payment-cycles/${cycleId}/status?status=${status}`);
      if (status === 'COMPLETED') {
        setActionMsg(t('group_detail.complete_cycle_success', { cycle: targetCycle?.cycleNumber, amount: totalPool.toLocaleString() }));
        setDisbursementCycle(targetCycle);
        setShowDisbursementModal(true);
      } else {
        setActionMsg(t('group_detail.cycle_status_updated', { status }));
      }
      fetchGroup();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('group_detail.update_cycle_error')));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">{t('group_detail.loading')}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="alert alert-danger shadow-sm my-4">
        {t('group_detail.not_found')} <Link to="/groups">{t('group_detail.back_to_groups')}</Link>
      </div>
    );
  }

  const totalPool = (group.contributionAmount || 0) * (group.memberCount || 1);
  const isAllCompleted = group.status === 'COMPLETED' || (Array.isArray(group.cycles) && group.cycles.length > 0 && group.cycles.every(c => c.status === 'COMPLETED'));
  const activeCycle = group.cycles?.find(c => c.status === 'ACTIVE') || (isAllCompleted ? null : group.cycles?.[0]);

  const formatModelLabel = (cat, typeObj) => {
    if (cat === 'AUCTION') return { label: t('group_detail.model_auction'), cls: 'bg-warning text-dark border' };
    if (cat === 'RANDOM_DRAW') return { label: t('group_detail.model_random'), cls: 'bg-primary-subtle text-primary border border-primary' };
    if (cat === 'NON_MONETARY' || typeObj?.name === 'Non-Monetary') return { label: t('group_detail.model_non_monetary'), cls: 'bg-success text-white' };
    return { label: t('group_detail.model_fixed'), cls: 'bg-secondary-subtle text-dark border' };
  };

  const modelInfo = formatModelLabel(group.category, group.seettuType);

  return (
    <div className="py-2">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h2 className="fw-bold text-dark mb-0">{group.name}</h2>
            <span className={`badge ${isAllCompleted ? 'bg-success' : 'bg-primary'} fs-6`}>{isAllCompleted ? t('group_detail.completed') : (group.status || t('group_detail.active'))}</span>
            <span className={`badge ${modelInfo.cls}`}>{modelInfo.label}</span>
            <span className="badge bg-info-subtle text-info border">{t('group_detail.cycle_frequency_label')}: {group.cycleFrequency}</span>
          </div>
          <p className="text-muted mb-0">{group.description || t('group_detail.description_fallback')}</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/groups" className="btn btn-outline-secondary">
            ← {t('group_detail.back_to_groups')}
          </Link>
          {(isOrganizer || isAdmin) && (
            <>
              <button 
                className="btn btn-outline-success fw-semibold d-flex align-items-center gap-1.5 shadow-xs" 
                onClick={() => setShowKulukkalModal(true)}
                title={t('group_detail.conduct_kulukkal_title')}
              >
                <Icon name="refresh" size={15} />
                <span>{t('group_detail.kulukkal_draw')}</span>
              </button>
              <button className="btn btn-teal fw-semibold d-flex align-items-center gap-1" onClick={() => setShowAddMemberModal(true)}>
                <span>+</span> {t('group_detail.add_member')}
              </button>
              <button className="btn btn-outline-danger fw-semibold d-flex align-items-center gap-1" onClick={handleDeleteGroup}>
                {t('group_detail.delete_group')}
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
              <span>{t('group_detail.summary_title')}</span>
              {isAllCompleted ? (
                <span className="badge rounded-pill bg-success text-white">{t('group_detail.all_cycles_completed')}</span>
              ) : activeCycle ? (
                <span className="badge rounded-pill bg-light text-dark">{t('group_detail.active_cycle', { number: activeCycle.cycleNumber })}</span>
              ) : null}
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">{t('group_detail.contribution_per_member')}</span>
                  <strong className="text-primary fs-6">
                    LKR {(group.contributionAmount || 0).toLocaleString()} <span className="small text-muted fw-normal">
                      ({group.cycleFrequency === 'DAILY' ? t('group_detail.per_day') : group.cycleFrequency === 'WEEKLY' ? t('group_detail.per_week') : group.cycleFrequency === 'BI_WEEKLY' ? t('group_detail.per_two_weeks') : t('group_detail.per_month')})
                    </span>
                  </strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">{t('group_detail.cycle_frequency')}</span>
                  <strong className="text-dark">{group.cycleFrequency || 'MONTHLY'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">{t('group_detail.total_pool_amount')}</span>
                  <strong className="text-success fw-bold fs-6">LKR {totalPool.toLocaleString()}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">{t('group_detail.enrolled_members')}</span>
                  <strong className="text-dark">{t('group_detail.member_count', { enrolled: group.members?.length || 0, total: group.memberCount || 0 })}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="text-muted">{t('group_detail.created_by')}</span>
                  <strong className="text-dark">{group.createdByName || t('group_detail.organizer')}</strong>
                </li>
                {group.shopName && (
                  <li className="list-group-item p-3 bg-light border-top">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>{t('group_detail.partner_shop')}</small>
                      <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.7rem' }}>{t('group_detail.verified_partner')}</span>
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
                    {t('group_detail.enrolled_members_tab', { count: group.members?.length || 0 })}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 py-3 px-4 fw-bold ${activeTab === 'cycles' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    onClick={() => setActiveTab('cycles')}
                  >
                    {t('group_detail.rotation_cycles_tab', { count: group.cycles?.length || 0 })}
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
                        <th>{t('group_detail.member_id')}</th>
                        <th>{t('group_detail.member_name')}</th>
                        <th>{t('group_detail.email')}</th>
                        <th>{t('group_detail.nic_number')}</th>
                        <th>{t('group_detail.status')}</th>
                        <th>{t('group_detail.role')}</th>
                        {(isOrganizer || isAdmin) && <th className="text-end">{t('group_detail.action')}</th>}
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
                              {m.status || t('group_detail.active')}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-secondary-subtle text-dark">
                              {m.role || t('group_detail.member')}
                            </span>
                          </td>
                          {(isOrganizer || isAdmin) && (
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-2 small fw-semibold"
                                onClick={() => handleRemoveMember(m.userId || m.id, m.fullName)}
                                title={t('group_detail.remove_member_title')}
                              >
                                {t('group_detail.remove')}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {(!group.members || group.members.length === 0) && (
                        <tr>
                          <td colSpan={(isOrganizer || isAdmin) ? 7 : 6} className="text-center py-4 text-muted">{t('group_detail.no_members')}</td>
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
                        <strong>{t('group_detail.kulukkal_method')}</strong> {t('group_detail.kulukkal_method_description')}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs"
                        onClick={() => setShowKulukkalModal(true)}
                      >
                        <Icon name="refresh" size={14} />
                        <span>{t('group_detail.conduct_kulukkal_draw')}</span>
                      </button>
                    </div>
                  )}
                  <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('group_detail.cycle_number')}</th>
                        <th>{t('group_detail.period')}</th>
                        <th>{t('group_detail.payout_recipient')}</th>
                        <th>{t('group_detail.status')}</th>
                        <th>{t('group_detail.rotation_action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.cycles?.map((c) => (
                        <tr key={c.id}>
                          <td className="fw-bold">{t('group_detail.cycle_number_value', { number: c.cycleNumber })}</td>
                          <td className="small text-muted">
                            {c.startDate || '-'} {t('group_detail.to')} {c.endDate || '-'}
                          </td>
                          <td className="fw-semibold text-primary">
                            {c.payoutMemberName || c.payoutMember?.fullName || t('group_detail.pending_rotation_selection')}
                          </td>
                          <td>
                            <span className={`badge ${c.status === 'ACTIVE' ? 'bg-primary' : c.status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <Link
                                to={`/rotation/${c.id}`}
                                className="btn btn-sm text-white fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                                style={{ background: 'linear-gradient(135deg, #0097B2 0%, #0F2F3D 100%)' }}
                                title={t('group_detail.open_spinning_wheel_title')}
                              >
                                <span>{t('group_detail.spin_wheel')}</span>
                              </Link>
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
                                     {t('group_detail.select_payout')}
                                  </button>
                                  {c.status === 'ACTIVE' && (
                                    <button
                                      className="btn btn-sm btn-success fw-bold"
                                      onClick={() => handleCycleStatusChange(c.id, 'COMPLETED')}
                                    >
                                      {t('group_detail.complete_cycle')}
                                    </button>
                                  )}
                                  {c.status === 'PENDING' && (
                                    <button
                                      className="btn btn-sm btn-warning text-dark fw-bold"
                                      onClick={() => handleCycleStatusChange(c.id, 'ACTIVE')}
                                    >
                                       {t('group_detail.start_cycle')}
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
                                  title={t('group_detail.view_payout_voucher_title')}
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  <Icon name="award" size={13} />
                                  <span>{t('group_detail.payout_voucher')}</span>
                                </button>
                              )}
                              {(c.payoutMemberName && c.payoutMemberName !== 'Unassigned' && c.payoutMemberName !== 'Pending Rotation Selection') && group.shopName && (
                                <button
                                  className="btn btn-sm btn-outline-success fw-bold"
                                  onClick={() => {
                                    setVoucherCycle(c);
                                    setShowVoucherModal(true);
                                  }}
                                  title={t('group_detail.view_asset_voucher_title')}
                                >
                                  {t('group_detail.asset_voucher')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!group.cycles || group.cycles.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">{t('group_detail.no_payment_cycles')}</td>
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
                  <h5 className="modal-title fw-bold text-dark">{t('group_detail.add_member_to', { groupName: group.name })}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddMemberModal(false)}></button>
                </div>
                <form onSubmit={handleAddMember}>
                  <div className="modal-body py-3">
                    {((group.members?.length || 0) >= (group.memberCount || 0)) && (
                      <div className="alert alert-danger py-2 px-3 small fw-bold mb-3 d-flex align-items-center gap-2">
                        <Icon name="alert-circle" size={16} color="#DC2626" />
                        <span>{t('group_detail.maximum_members', { enrolled: group.members?.length || 0, total: group.memberCount || 0 })}</span>
                      </div>
                    )}
                    <p className="small text-muted mb-3">
                      {t('group_detail.member_id_required_prefix')} <strong>{t('group_detail.member_id')}</strong> {t('group_detail.member_id_required_suffix')}
                    </p>

                    {verifiedMembers && verifiedMembers.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">
                          {t('group_detail.quick_select_members')}
                        </label>
                        <select
                          className="form-select"
                          value={memberUserId}
                          onChange={(e) => setMemberUserId(e.target.value)}
                        >
                          <option value="">{t('group_detail.choose_verified_member')}</option>
                          {verifiedMembers
                            .filter((vm) => vm.role !== 'ADMIN')
                            .map((vm) => {
                              const enrolled = group.members?.some((m) => String(m.userId || m.id) === String(vm.id));
                              return (
                                <option key={vm.id} value={vm.id}>
                                  {t('group_detail.member_option', { id: vm.id, name: vm.fullName, nic: vm.nicNumber ? `(${vm.nicNumber})` : '', enrolled: enrolled ? `• ${t('group_detail.already_enrolled')}` : '' })}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        {t('group_detail.member_id')} <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light font-monospace fw-bold text-muted">#</span>
                        <input
                          type="number"
                          className="form-control font-monospace"
                          placeholder={t('group_detail.member_id_placeholder')}
                          value={memberUserId}
                          onChange={(e) => setMemberUserId(e.target.value)}
                          required
                          min="1"
                          autoFocus
                        />
                      </div>
                      <small className="text-muted">{t('group_detail.member_id_help')}</small>
                    </div>

                    {memberUserId && matchedMember && (
                      <div className={`alert ${alreadyEnrolled ? 'alert-warning border-warning' : 'alert-success border-success'} py-2 px-3 mt-2 rounded-2 mb-0 small`}>
                        <div className="fw-bold text-dark">{matchedMember.fullName}</div>
                        <div className="text-muted">{matchedMember.email} • {t('group_detail.nic_label')}: {matchedMember.nicNumber || t('group_detail.not_available')}</div>
                        {alreadyEnrolled ? (
                          <div className="text-danger fw-bold mt-1 d-flex align-items-center gap-1"><AlertTriangle size={14} /> {t('group_detail.member_already_enrolled')}</div>
                        ) : (
                          <div className="text-success fw-bold mt-1 d-flex align-items-center gap-1"><CheckCircle2 size={14} /> {t('group_detail.identity_verified', { status: matchedMember.kycStatus })}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMemberModal(false)}>{t('group_detail.cancel')}</button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm px-3 fw-bold"
                      disabled={alreadyEnrolled || !memberUserId}
                    >
                      {t('group_detail.add_member')}
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
                      {t('group_detail.cycle_payout_selection', { number: selectedCycle.cycleNumber })}
                    </h5>
                    <small className="text-white-50">
                      {t('group_detail.select_payout_method')}
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
                      {t('group_detail.fixed_rotation')}
                    </button>
                    <button
                      type="button"
                      className={`nav-link py-2 fw-bold text-nowrap rounded-3 ${payoutMode === 'random' ? 'active shadow-sm' : 'text-secondary'}`}
                      style={payoutMode === 'random' ? { backgroundColor: '#235665', color: '#fff' } : {}}
                      onClick={() => setPayoutMode('random')}
                    >
                      {t('group_detail.kulukkal_draw')}
                    </button>
                    <button
                      type="button"
                      className={`nav-link py-2 fw-bold text-nowrap rounded-3 ${payoutMode === 'auction' ? 'active shadow-sm' : 'text-secondary'}`}
                      style={payoutMode === 'auction' ? { backgroundColor: '#235665', color: '#fff' } : {}}
                      onClick={() => setPayoutMode('auction')}
                    >
                      {t('group_detail.auction_bidding')}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAssignPayout}>
                  <div className="modal-body p-4">
                    {/* MODE 1: FIXED ROTATION */}
                    {payoutMode === 'direct' && (
                      <div>
                        <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                          <strong>{t('group_detail.fixed_rotation')}:</strong> {t('group_detail.fixed_rotation_description')} <strong>LKR {totalPool.toLocaleString()}</strong>.
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold small text-secondary">{t('group_detail.select_recipient')} <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            value={selectedPayoutMemberId}
                            onChange={(e) => setSelectedPayoutMemberId(e.target.value)}
                            required
                          >
                            <option value="">{t('group_detail.choose_member')}</option>
                            {group.members?.map((m) => {
                              const isAwarded = alreadyAwardedIds.includes(String(m.userId || m.id));
                              return (
                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                  {m.fullName} ({m.email}) {isAwarded ? `• (${t('group_detail.already_received_payout')})` : ''}
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
                            <span><strong>{t('group_detail.seettu_rule')}</strong> {t('group_detail.cycle_one_organizer_rule', { organizer: group.createdByName || t('group_detail.organizer') })}</span>
                          ) : (
                            <span><strong>{t('group_detail.kulukkal_lot_shaker')}</strong> {t('group_detail.kulukkal_lot_description')}</span>
                          )}
                        </div>

                        <div className="p-4 text-center rounded-3 mb-3 border bg-light">
                          <div className="text-secondary small fw-bold mb-2">
                            {selectedCycle.cycleNumber === 1 ? t('group_detail.organizer_guaranteed_turn') : t('group_detail.eligible_members_pool', { count: eligibleMembers.length })}
                          </div>
                          
                          {isRolling ? (
                            <div className="py-3">
                              <div className="spinner-border text-primary mb-2" role="status"></div>
                              <h4 className="fw-bold font-monospace text-primary">{rolledName || t('group_detail.shuffling_chits')}</h4>
                              <small className="text-muted">{t('group_detail.mixing_chits')}</small>
                            </div>
                          ) : drawWinner ? (
                            <div className="py-2">
                              <span className="badge bg-success fs-6 px-3 py-2 mb-2 rounded-pill">{t('group_detail.kulukkal_winner_drawn')}</span>
                              <h3 className="fw-bold text-dark mt-1">{drawWinner.fullName}</h3>
                              <div className="text-muted small">{drawWinner.email} • ID #{drawWinner.userId || drawWinner.id}</div>
                              <div className="text-success small fw-semibold mt-1">{t('group_detail.lump_sum_pot')}: LKR {totalPool.toLocaleString()}</div>
                            </div>
                          ) : (
                            <div className="py-2">
                              {selectedCycle.cycleNumber === 1 ? (
                                <div>
                                  <p className="text-muted small mb-3">
                                    {t('group_detail.assign_cycle_one_prompt', { organizer: group.createdByName || t('group_detail.organizer') })}
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
                                    {t('group_detail.assign_to_organizer', { organizer: group.createdByName || t('group_detail.organizer') })}
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-muted small mb-3">
                                    {eligibleMembers.length > 0
                                      ? t('group_detail.eligible_members_message', { count: eligibleMembers.length })
                                      : t('group_detail.all_members_received_payout')}
                                  </p>
                                  <button
                                    type="button"
                                    className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                                    style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                                    onClick={handleRunRandomDraw}
                                    disabled={eligibleMembers.length === 0}
                                  >
                                    {t('group_detail.shake_kulukkal_lots')}
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
                              {t('group_detail.redraw_kulukkal_lot')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODE 3: AUCTION / BIDDING */}
                    {payoutMode === 'auction' && (
                      <div>
                        <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                          <strong>{t('group_detail.auction_bidding')}:</strong> {t('group_detail.auction_description')}
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-md-7">
                            <label className="form-label fw-bold small text-secondary">{t('group_detail.winning_bidder')} <span className="text-danger">*</span></label>
                            <select
                              className="form-select"
                              value={selectedPayoutMemberId}
                              onChange={(e) => setSelectedPayoutMemberId(e.target.value)}
                              required
                            >
                              <option value="">{t('group_detail.select_highest_bidder')}</option>
                              {eligibleMembers.map((m) => (
                                <option key={m.id || m.userId} value={m.userId || m.id}>
                                  {m.fullName} ({m.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-5">
                            <label className="form-label fw-bold small text-secondary">{t('group_detail.winning_bid_discount')} <span className="text-danger">*</span></label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder={t('group_detail.bid_discount_placeholder')}
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
                              <small className="text-muted d-block">{t('group_detail.gross_pool')}</small>
                              <strong className="text-dark">LKR {totalPool.toLocaleString()}</strong>
                            </div>
                            <div className="col-4 border-end">
                              <small className="text-muted d-block">{t('group_detail.bid_discount')}</small>
                              <strong className="text-danger">- LKR {discountVal.toLocaleString()}</strong>
                            </div>
                            <div className="col-4">
                              <small className="text-muted d-block">{t('group_detail.net_payout')}</small>
                              <strong className="text-success fs-6">LKR {netPayout.toLocaleString()}</strong>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-top text-center">
                            <span className="badge bg-success-subtle text-success border small">
                              {t('group_detail.dividend_per_member', { count: otherMembersCount })}: LKR {dividendPerMember.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('group_detail.each')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer border-top p-3 bg-white">
                    <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAssignPayoutModal(false)}>{t('group_detail.cancel')}</button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-bold shadow-sm"
                      style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                      disabled={!selectedPayoutMemberId || isRolling}
                    >
                      {t('group_detail.confirm_payout_assignment')}
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
                      {t('group_detail.asset_redemption_voucher')}
                    </span>
                    <h3 className="fw-bold mb-1 text-white">{t('group_detail.physical_asset_collection_order')}</h3>
                    <p className="mb-0 text-white-50 small">
                      {t('group_detail.voucher_document_subtitle')}
                    </p>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowVoucherModal(false)}></button>
                </div>
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="row g-4 mb-4">
                  {/* Beneficiary */}
                  <div className="col-md-6 border-end">
                    <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>{t('group_detail.beneficiary_subscriber')}</small>
                    <h4 className="fw-bold text-dark mt-1 mb-1">{voucherCycle.payoutMemberName || voucherCycle.payoutMember?.fullName}</h4>
                    <div className="text-muted small">{t('group_detail.cycle_turn')}: <strong>{t('group_detail.cycle_number_value', { number: voucherCycle.cycleNumber })}</strong></div>
                    <div className="text-muted small">{t('group_detail.asset_category')}: <strong>{group.category || t('group_detail.physical_goods')}</strong></div>
                    <div className="text-muted small">{t('group_detail.validity_period')}: {voucherCycle.startDate} {t('group_detail.to')} {voucherCycle.endDate}</div>

                    <div className="mt-3 p-3 bg-light rounded-3 border">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('group_detail.authorized_asset_value')}</small>
                      <h4 className="fw-bold text-success mb-0">LKR {totalPool.toLocaleString()}</h4>
                    </div>
                  </div>

                  {/* Partner Merchant Showroom */}
                  <div className="col-md-6">
                    <small className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>{t('group_detail.partner_showroom')}</small>
                    <h4 className="fw-bold text-dark mt-1 mb-1">{group.shopName || t('group_detail.registered_partner')}</h4>
                    {group.shopAddress && (
                      <p className="text-muted small mb-2">{group.shopAddress}</p>
                    )}
                    <span className="badge bg-info-subtle text-info border">{t('group_detail.verified_partner_merchant')}</span>

                    <div className="mt-3 p-3 bg-light rounded-3 border font-monospace">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('group_detail.voucher_serial_code')}</small>
                      <strong className="text-dark">VCH-SEETTU-{group.id}-{voucherCycle.cycleNumber}-REDM</strong>
                    </div>
                  </div>
                </div>

                {/* Redemption Instructions & Terms */}
                <div className="alert alert-light border small text-secondary rounded-3 p-3 mb-0">
                  <div className="fw-bold text-dark mb-1">{t('group_detail.redemption_instructions')}</div>
                  <ul className="mb-0 ps-3">
                    <li>{t('group_detail.voucher_instruction_identity')}</li>
                    <li>{t('group_detail.voucher_instruction_goods')}</li>
                    <li>{t('group_detail.voucher_instruction_payment')} <strong>LKR {totalPool.toLocaleString()}</strong> {t('group_detail.voucher_instruction_payment_suffix')}</li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button type="button" className="btn btn-secondary px-3" onClick={() => setShowVoucherModal(false)}>{t('group_detail.close')}</button>
                <button 
                  type="button" 
                  className="btn btn-teal px-4 fw-bold text-white shadow-sm"
                  style={{ backgroundColor: '#235665' }}
                  onClick={() => window.print()}
                >
                  {t('group_detail.print_voucher')}
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
          setActionMsg(t('group_detail.kulukkal_draw_success'));
          fetchGroup();
        }}
      />
    </div>
  );
};

export default GroupDetail;
