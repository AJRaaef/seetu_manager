import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icons';
import InviteMemberModal from '../components/InviteMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { getAllMembers, getAllGroups, removeMember, inviteMember } from '../api/groupApi';
import { getErrorMessage } from '../utils/errorHandler';
import { getPendingKycUsers, verifyMemberKyc } from '../api/userApi';

import { useAuth } from '../hooks/useAuth';

const getScoreMeta = (scoreNum, category, t) => {
  if (category) {
    if (category === 'EXCELLENT') return { label: t('members_page.score_excellent'), color: '#188754' };
    if (category === 'GOOD') return { label: t('members_page.score_good'), color: '#0D6EFD' };
    if (category === 'FAIR') return { label: t('members_page.score_fair'), color: '#FFB020' };
    if (category === 'POOR') return { label: t('members_page.score_poor'), color: '#FD7E14' };
    if (category === 'HIGH_RISK') return { label: t('members_page.score_high_risk'), color: '#DC3545' };
  }
  const num = Number(scoreNum);
  if (num >= 90) return { label: t('members_page.score_excellent'), color: '#188754' };
  if (num >= 75) return { label: t('members_page.score_good'), color: '#0D6EFD' };
  if (num >= 60) return { label: t('members_page.score_fair'), color: '#FFB020' };
  if (num >= 40) return { label: t('members_page.score_poor'), color: '#FD7E14' };
  return { label: t('members_page.score_high_risk'), color: '#DC3545' };
};

const calculateScore = (member) => {
  if (member.disciplineScore !== undefined && member.disciplineScore !== null) {
    const n = Number(member.disciplineScore);
    return n % 1 === 0 ? n : Number(n.toFixed(1));
  }
  if (member.score !== undefined && member.score !== null) {
    const n = Number(member.score);
    return n % 1 === 0 ? n : Number(n.toFixed(1));
  }
  return 100;
};

import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from '../api/joinRequestApi';

const Members = () => {
  const { t } = useTranslation();
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
        isAdmin ? getPendingKycUsers().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      const mList = Array.isArray(membersRes?.data) ? membersRes.data : (Array.isArray(membersRes) ? membersRes : (membersRes?.data?.data || []));
      const gList = Array.isArray(groupsRes?.data) ? groupsRes.data : (Array.isArray(groupsRes) ? groupsRes : (groupsRes?.data?.data || []));
      const pList = Array.isArray(pendingRes?.data) ? pendingRes.data : (Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data?.data || []));
      const kycList = Array.isArray(pendingKycRes?.data) ? pendingKycRes.data : (Array.isArray(pendingKycRes) ? pendingKycRes : (pendingKycRes?.data?.data || []));

      setRawMembers(Array.isArray(mList) ? mList : []);
      setGroups(Array.isArray(gList) ? gList : []);
      setPendingKycList(Array.isArray(kycList) ? kycList : []);

      if (Array.isArray(pList) && pList.length > 0) {
        const formattedPending = pList.map(r => ({
          id: r.id,
          memberName: r.user?.fullName || r.userName || t('members_page.status_default_member'),
          email: r.user?.email || t('members_page.not_available'),
          groupName: r.group?.name || t('members_page.status_general_group'),
          date: r.requestedAt ? r.requestedAt.split('T')[0] : t('members_page.status_today'),
          status: r.status || 'PENDING'
        }));
        setPendingRequests(formattedPending);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error(t('members_page.loading_error'), err);
      setErrorMsg(getErrorMessage(err, t('members_page.fetch_members_error')));
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
      setActionMsg(t('members_page.approve_request_success', { memberName, groupName }));
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('members_page.approve_request_error')));
    }
  };

  const handleRejectRequest = async (reqId, memberName) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await rejectJoinRequest(reqId);
      setActionMsg(t('members_page.reject_request_success', { memberName }));
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('members_page.reject_request_error')));
    }
  };

  const handleApproveKyc = async (userId, memberName, role = null) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await verifyMemberKyc(userId, 'VERIFIED', '', role);
      const roleText = role === 'ORGANIZER' ? t('members_page.organizer_promotion') : '';
      setActionMsg(t('members_page.verify_member_success', { memberName, roleText }));
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('members_page.verify_member_error')));
    }
  };

  const handleRejectKyc = async (userId, memberName, reason) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await verifyMemberKyc(userId, 'REJECTED', reason);
      setActionMsg(t('members_page.reject_verification_success', { memberName, reason }));
      setShowRejectKycModal(false);
      setRejectKycTarget(null);
      setRejectReasonInput('');
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('members_page.reject_verification_error')));
    }
  };

  const handleAddMember = async ({ groupId, fullName, email, phone }) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      await inviteMember(groupId, { fullName, email, phone });
      setActionMsg(t('members_page.add_member_success', { memberName: fullName }));
      await fetchData();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('members_page.add_member_error')));
      throw err;
    }
  };

  const handleDeleteMember = async (member) => {
    const name = member.name || member.user?.fullName || t('members_page.status_default_member');
    const groupId = member.groupId || member.group?.id;
    const userId = member.userId || member.user?.id;

    if (!groupId || !userId) {
      alert(t('members_page.missing_member_ids'));
      return;
    }

    if (window.confirm(t('members_page.confirm_remove_member', { memberName: name, groupName: member.groupName || member.group?.name }))) {
      try {
        setActionMsg('');
        setErrorMsg('');
        await removeMember(groupId, userId);
        setActionMsg(t('members_page.remove_member_success', { memberName: name }));
        await fetchData();
      } catch (err) {
        setErrorMsg(getErrorMessage(err, t('members_page.remove_member_error')));
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
    setActionMsg(t('members_page.update_member_success', { memberName: updated.name }));
  };

  // Normalized display items
  const formattedMembers = rawMembers
    .filter((m) => {
      const role = (m.user?.role || m.role || '').toString().toUpperCase();
      return role !== 'ADMIN';
    })
    .map((m) => {
      const scoreVal = calculateScore(m);
      const scoreMeta = getScoreMeta(scoreVal, m.disciplineCategory, t);
      const dateStr = m.joinedAt ? m.joinedAt.split('T')[0] : t('members_page.not_available');

      return {
        id: m.id,
        userId: m.user?.id,
        groupId: m.group?.id,
        name: m.user?.fullName || t('members_page.status_unknown'),
        email: m.user?.email || t('members_page.not_available'),
        phone: m.user?.phone || t('members_page.not_available'),
        nicNumber: m.user?.nicNumber || '-',
        kycStatus: m.user?.kycStatus || 'UNVERIFIED',
        gnCertificateUrl: m.user?.gnCertificateUrl,
        profilePictureUrl: m.user?.profilePictureUrl,
        groupName: m.group?.name || t('members_page.status_general_group'),
        joinedDate: dateStr,
        score: scoreVal,
        scoreLabel: scoreMeta.label,
        scoreColor: scoreMeta.color,
        status: m.status === 'ACTIVE' || !m.status ? 'Active' : m.status
      };
    });

  const filteredMembers = formattedMembers.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      m.phone.includes(searchTerm) ||
      String(m.userId || m.id || '').includes(searchTerm);
    const matchesGroup = groupFilter === 'All' || m.groupName === groupFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="members-page-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('members_page.title')}</h2>
          <p className="text-muted small mb-0">{t('members_page.subtitle')}</p>
        </div>
        {isAdmin ? (
          <span className="badge bg-light text-secondary border px-3 py-2 small fw-semibold d-inline-flex align-items-center gap-1.5">
            <Icon name="shield" size={15} />
            <span>{t('members_page.platform_overseer')}</span>
          </span>
        ) : isOrganizer ? (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2"
          >
            <Icon name="user-plus" size={18} />
            <span>{t('members_page.invite_btn')}</span>
          </button>
        ) : null}
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check" size={18} />
          <div>{actionMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionMsg('')} aria-label={t('members_page.close')}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{errorMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')} aria-label={t('members_page.close')}></button>
        </div>
      )}

      {/* Identity & Grama Niladhari Character Verification Queue */}
      {isAdmin && pendingKycList.length > 0 && (
        <div className="ui-card p-4 mb-4 shadow-sm border-0 rounded-3 border-start border-4 border-warning">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <Icon name="shield" size={20} color="#1A5265" />
                <span>{t('members_page.queue_title', { count: pendingKycList.length })}</span>
              </h5>
              <small className="text-muted">
                {t('members_page.queue_description')}
              </small>
            </div>
            <span className="badge rounded-pill bg-warning text-dark px-3 py-1.5 fw-bold">{t('members_page.verification_required')}</span>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('members_page.applicant_name')}</th>
                  <th>{t('members_page.contact_details')}</th>
                  <th>{t('members_page.nic_number')}</th>
                  <th>{t('members_page.gn_proof')}</th>
                  <th>{t('members_page.submission_date')}</th>
                  <th className="text-end">{t('members_page.verification_action')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingKycList.map((usr) => (
                  <tr key={usr.id}>
                    <td className="fw-bold text-dark">
                      <div>{usr.fullName}</div>
                      {usr.requestedRole === 'ORGANIZER' ? (
                        <div className="mt-1">
                          <span className="badge bg-teal bg-opacity-10 text-dark border border-secondary border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem', backgroundColor: '#E2F0F3', color: '#1A5265' }}>
                            <Icon name="users" size={12} color="#1A5265" />
                            <span>{t('members_page.applicant_organizer')}</span>
                          </span>
                          {usr.district && (
                            <div className="small text-muted mt-1 fw-normal" style={{ fontSize: '0.78rem' }}>
                              <Icon name="map-pin" size={12} className="me-1 text-info" />
                              <strong className="text-dark">{usr.district}</strong> {usr.address ? `(${usr.address})` : ''}
                            </div>
                          )}
                          {usr.organizerApplicationNote && (
                            <div className="small text-muted fst-italic mt-0.5 fw-normal" style={{ fontSize: '0.74rem', maxWidth: '320px', lineHeight: '1.4' }}>
                              "{usr.organizerApplicationNote}"
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                    <td className="small text-muted">
                      <div>{usr.email}</div>
                      <div>{usr.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {usr.nicNumber || (usr.requestedRole === 'ORGANIZER' ? t('members_page.pending_gn_nic') : t('members_page.not_available'))}
                      </span>
                      {usr.nicNumber && (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success ms-1 small" style={{ fontSize: '0.72rem' }}>
                          {t('members_page.unique_nic')}
                        </span>
                      )}
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
                          <span>{t('members_page.view_gn_certificate')}</span>
                        </a>
                      ) : (
                        <span className="badge bg-light text-muted border small">{t('members_page.no_document_uploaded')}</span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {usr.createdAt ? usr.createdAt.split('T')[0] : t('members_page.recent')}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2 align-items-center justify-content-end">
                        {isAdmin && usr.requestedRole === 'ORGANIZER' ? (
                          <button
                            onClick={() => handleApproveKyc(usr.id, usr.fullName, 'ORGANIZER')}
                            className="btn btn-sm px-3 py-1.5 shadow-sm fw-semibold d-inline-flex align-items-center gap-1.5 text-white"
                            style={{ backgroundColor: '#0097B2', height: '36px', minWidth: '165px', justifyContent: 'center' }}
                            title={t('members_page.approve_organizer_title')}
                          >
                            <Icon name="user-check" size={15} />
                            <span>{t('members_page.approve_organizer')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveKyc(usr.id, usr.fullName)}
                            className="btn btn-sm btn-success px-3 py-1.5 shadow-sm fw-semibold d-inline-flex align-items-center gap-1.5"
                            style={{ height: '36px', minWidth: '135px', justifyContent: 'center' }}
                            title={t('members_page.verify_member_title')}
                          >
                            <Icon name="check" size={15} />
                            <span>{t('members_page.verify_member')}</span>
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
                          <span>{t('members_page.reject')}</span>
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
              {t('members_page.pending_join_requests', { count: pendingRequests.length })}
            </h5>
            <span className="badge rounded-pill bg-warning text-dark px-3 py-1">{t('members_page.requires_organizer_approval')}</span>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('members_page.table_member_name')}</th>
                  <th>{t('members_page.table_email')}</th>
                  <th>{t('members_page.requested_group')}</th>
                  <th>{t('members_page.request_date')}</th>
                  <th className="text-end">{t('members_page.organizer_action')}</th>
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
                        {t('members_page.approve')}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id, req.memberName)}
                        className="btn btn-sm btn-outline-danger px-2"
                      >
                        ✕ {t('members_page.reject')}
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
              placeholder={t('members_page.search_placeholder')}
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
            <option value="All">{t('members_page.filter_group')}</option>
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
            <option value="All">{t('members_page.all')}</option>
            <option value="Active">{t('members_page.status_active')}</option>
            <option value="REMOVED">{t('members_page.status_removed')}</option>
            <option value="Inactive">{t('members_page.status_inactive')}</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.table_id')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.col_name')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.table_email')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.table_phone')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.table_group')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('members_page.table_joined_date')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">{t('members_page.col_kyc')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">{t('members_page.col_score')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">{t('members_page.table_status')}</th>
                {(isOrganizer || isAdmin) && <th className="py-3 px-3 text-muted fw-semibold small text-end">{t('members_page.col_actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={(isOrganizer || isAdmin) ? "10" : "9"} className="text-center py-5">
                    <div className="spinner-border text-teal" role="status" style={{ color: '#1A5265' }}></div>
                    <p className="mt-2 text-muted small">{t('members_page.loading_members')}</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={(isOrganizer || isAdmin) ? "10" : "9"} className="text-center py-5">
                    <Icon name="users" size={36} color="#94A3B8" className="mb-2" />
                    <h6 className="fw-bold text-dark">{t('members_page.no_members')}</h6>
                    <p className="text-muted small mb-0">{t('members_page.no_members_desc')}</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 px-3">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        #{member.userId || member.id}
                      </span>
                    </td>
                    <td className="py-3 px-3 fw-semibold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center text-white flex-shrink-0"
                          style={{ width: '28px', height: '28px', backgroundColor: '#3E7B8E', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {member.profilePictureUrl ? (
                            <img
                              src={`http://localhost:8081${member.profilePictureUrl}`}
                              alt={member.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            member.name ? member.name.charAt(0).toUpperCase() : t('members_page.status_default_member').charAt(0).toUpperCase()
                          )}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted small">{member.email}</td>
                    <td className="py-3 px-3 text-muted small">{member.phone}</td>
                    <td className="py-3 px-3 text-dark small">{member.groupName}</td>
                    <td className="py-3 px-3 text-muted small">{member.joinedDate}</td>
                    <td className="py-3 px-3 text-center">
                      {member.kycStatus === 'VERIFIED' ? (
                        <div>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                            <Icon name="check" size={11} className="me-1" />{t('members_page.badge_verified')}
                          </span>
                          <div className="font-monospace text-muted mt-0.5" style={{ fontSize: '0.72rem' }}>
                            {member.nicNumber}
                          </div>
                        </div>
                      ) : member.kycStatus === 'PENDING' ? (
                        <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                          <Icon name="clock" size={11} className="me-1" />{t('members_page.badge_kyc_pending')}
                        </span>
                      ) : member.kycStatus === 'REJECTED' ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-0.5 rounded-pill small fw-semibold">
                          {t('members_page.badge_rejected')}
                        </span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-0.5 rounded-pill small">
                          {t('members_page.badge_unverified')}
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
                        {member.status === 'Active' ? t('members_page.status_active_member') : member.status === 'REMOVED' ? t('members_page.status_removed') : member.status === 'Inactive' ? t('members_page.status_inactive') : member.status}
                      </span>
                    </td>
                    {(isOrganizer || isAdmin) && (
                      <td className="py-3 px-3 text-end">
                        <div className="d-flex justify-end gap-2">
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#188754' }}
                            title={t('members_page.edit_member')}
                            onClick={() => setEditingMember(member)}
                          >
                            <Icon name="pencil" size={16} color="#188754" />
                          </button>
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title={t('members_page.delete_member')}
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
                  <span>{t('members_page.reject_verification_title')}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectKycModal(false)} aria-label={t('members_page.close')}></button>
              </div>
              <div className="modal-body">
                <p className="text-dark small mb-3">
                  {t('members_page.rejecting_verification_for')} <strong>{rejectKycTarget?.fullName}</strong> ({t('members_page.nic_label')} {rejectKycTarget?.nicNumber}).
                  {' '}{t('members_page.rejection_instructions')}
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">{t('members_page.rejection_reason')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={t('members_page.rejection_reason_placeholder')}
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectKycModal(false)}>{t('members_page.cancel')}</button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 fw-bold"
                  onClick={() => handleRejectKyc(rejectKycTarget?.id, rejectKycTarget?.fullName, rejectReasonInput)}
                >
                  {t('members_page.confirm_rejection')}
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
        groups={groups}
        onSave={handleSaveMember}
      />
    </div>
  );
};

export default Members;
