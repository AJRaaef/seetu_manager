import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getGroupsByUser, getAllGroups, deleteGroup } from '../api/groupApi';
import { createJoinRequest } from '../api/joinRequestApi';
import { getMyKycStatus } from '../api/userApi';
import { getMyVerification } from '../api/verificationApi';
import Icon from '../components/Icons';
import OrganizerRequestModal from '../components/OrganizerRequestModal';

const MyGroups = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin, updateUser } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);

  // Sync latest verification status on page load
  useEffect(() => {
    if (user?.role === 'MEMBER' && user?.kycStatus !== 'VERIFIED') {
      getMyKycStatus()
        .then((res) => {
          if (res?.data?.kycStatus === 'VERIFIED') {
            updateUser({
              kycStatus: 'VERIFIED',
              nicNumber: res.data.nicNumber,
              role: res.data.role || user?.role
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.role, user?.kycStatus]);

  const handleOpenJoinModal = async () => {
    if (user?.role === 'MEMBER') {
      try {
        const [kycRes, verifRes] = await Promise.allSettled([
          getMyKycStatus(),
          getMyVerification(userId),
        ]);
        const kycStatus = kycRes.status === 'fulfilled' ? kycRes.value?.data?.kycStatus : null;
        const verifStatus = verifRes.status === 'fulfilled' ? (verifRes.value?.data?.verificationStatus || verifRes.value?.verificationStatus) : null;

        if (kycStatus === 'VERIFIED' || verifStatus === 'VERIFIED' || user?.kycStatus === 'VERIFIED') {
          setShowJoinModal(true);
          return;
        }
      } catch (err) {}

      alert('Please complete your identity verification first. Go to Verification page.');
      navigate('/verification');
      return;
    }
    setShowJoinModal(true);
  };

  const userId = user?.userId || user?.id;

  const formatContribution = (amount, frequency) => {
    const formattedAmount = Number(amount || 0).toLocaleString();
    const freq = (frequency || 'MONTHLY').toUpperCase();
    switch (freq) {
      case 'DAILY':
        return t('groups_per_day', { amount: formattedAmount, defaultValue: `${formattedAmount} LKR per day` });
      case 'WEEKLY':
        return t('groups_per_week', { amount: formattedAmount, defaultValue: `${formattedAmount} LKR per week` });
      case 'BI_WEEKLY':
        return t('groups_per_bi_week', { amount: formattedAmount, defaultValue: `${formattedAmount} LKR per 2 weeks` });
      case 'MONTHLY':
      default:
        return t('groups_per_month', { amount: formattedAmount, defaultValue: `${formattedAmount} LKR per month` });
    }
  };



  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    try {
      const res = await getGroupsByUser(userId);
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map(g => {
          const totalCycles = (Array.isArray(g.cycles) && g.cycles.length > 0)
            ? g.cycles.length
            : (g.memberCount || 10);

          // Calculate completed cycles count
          let completedCyclesCount = 0;
          if (g.status === 'COMPLETED') {
            completedCyclesCount = totalCycles;
          } else if (typeof g.completedCycles === 'number') {
            completedCyclesCount = g.completedCycles;
          } else if (Array.isArray(g.cycles) && g.cycles.length > 0) {
            completedCyclesCount = g.cycles.filter(c => c.status === 'COMPLETED' || c.isFullyPaid).length;
          } else {
            completedCyclesCount = Math.max(0, (g.currentCycle || 1) - 1);
          }

          const completionRate = (g.status === 'COMPLETED' || completedCyclesCount >= totalCycles)
            ? 100
            : (typeof g.completionRate === 'number'
                ? Math.round(g.completionRate)
                : (totalCycles > 0 ? Math.min(100, Math.max(0, Math.round((completedCyclesCount / totalCycles) * 100))) : 0));

          // Determine active/current cycle number
          let currentCycleNumber = 1;
          if (g.status === 'COMPLETED' || completedCyclesCount >= totalCycles) {
            currentCycleNumber = totalCycles;
          } else if (Array.isArray(g.cycles) && g.cycles.length > 0) {
            const activeCycle = g.cycles.find(c => c.status === 'ACTIVE' && !c.isFullyPaid);
            const nextPending = g.cycles.find(c => c.status === 'PENDING');
            currentCycleNumber = activeCycle?.cycleNumber || nextPending?.cycleNumber || (completedCyclesCount > 0 ? Math.min(totalCycles, completedCyclesCount + 1) : 1);
          } else {
            currentCycleNumber = g.currentCycle || (completedCyclesCount > 0 ? Math.min(totalCycles, completedCyclesCount + 1) : 1);
          }

          return {
            id: g.id,
            name: g.name,
            type: g.seettuType?.name || (g.category === 'NON_MONETARY' ? 'Non-Monetary' : 'Monetary'),
            membersCount: Array.isArray(g.members) ? g.members.length : (typeof g.membersCount === 'number' ? g.membersCount : 0),
            maxMembers: g.memberCount || 10,
            cycleFrequency: g.cycleFrequency || 'MONTHLY',
            contributionAmount: formatContribution(g.contributionAmount, g.cycleFrequency),
            currentCycle: currentCycleNumber,
            totalCycles: totalCycles,
            completionRate: completionRate,
            status: (g.status === 'COMPLETED' || completionRate === 100) ? 'Completed' : (g.status === 'ACTIVE' ? 'Active' : (g.status || 'Active'))
          };
        });
        setGroups(formatted);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Failed to fetch groups from database', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedJoinGroup, setSelectedJoinGroup] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [publicGroups, setPublicGroups] = useState([]);

  useEffect(() => {
    const fetchPublicGroups = async () => {
      try {
        const res = await getAllGroups();
        const list = res.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setPublicGroups(list);
        }
      } catch (err) {
        console.error('Failed to load public groups for join modal', err);
      }
    };
    fetchPublicGroups();
  }, []);

  const displayPublicGroups = publicGroups;

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJoinGroup) return;
    setSubmittingJoin(true);
    try {
      await createJoinRequest(selectedJoinGroup, userId);
      alert('Request to join Seettu group submitted successfully! The group organizer will review your request.');
      setShowJoinModal(false);
      setSelectedJoinGroup('');
      setJoinMsg('');
    } catch (err) {
      console.error('Join request error', err);
      const msg = err.response?.data?.message || 'Failed to submit join request.';
      alert('⚠️ ' + msg);
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      return;
    }
    try {
      await deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      alert(`Group "${groupName}" deleted successfully.`);
      fetchGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert(err.response?.data?.message || 'Failed to delete group from database.');
    }
  };

  return (
    <div className="my-groups-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>
          {isAdmin ? t('my_groups_page.admin_title', 'All Seettu Circles') : t('my_groups_page.title', 'My Groups')}
        </h2>
        {isAdmin ? (
          <span className="badge bg-light text-secondary border px-3 py-2 small fw-semibold d-inline-flex align-items-center gap-1.5">
            <Icon name="shield" size={15} />
            <span>Platform Overseer Mode</span>
          </span>
        ) : isOrganizer ? (
          <Link to="/groups/create" className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2">
            <span>+</span>{t('my_groups_page.create_new', 'Create New Group')}
          </Link>
        ) : (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {user?.requestedRole === 'ORGANIZER' ? (
              <span 
                className="badge px-3 py-2 d-flex align-items-center gap-1.5 shadow-sm border"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#F59E0B', fontSize: '0.82rem' }}
                title="Your application to become a Group Organizer is currently under Administrator review"
              >
                <Icon name="clock" size={15} />
                <span>Organizer Application Pending Review</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowOrganizerModal(true)}
                className="btn btn-outline-teal px-3 py-2 d-flex align-items-center gap-1.5 shadow-sm fw-semibold"
                style={{ borderColor: '#0097B2', color: '#0097B2', fontSize: '0.88rem' }}
                title="Apply to create and organize your own Seettu circles without creating a new account"
              >
                <Icon name="award" size={16} />
                <span>Become an Organizer</span>
              </button>
            )}
            <button
              onClick={handleOpenJoinModal}
              className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm text-white"
              style={{ backgroundColor: '#1A5265', borderColor: '#1A5265' }}
            >
              {t('my_groups_page.join_group', 'Join Group')}
            </button>
          </div>
        )}
      </div>

      {/* 3-Column Card Grid or Empty State */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-teal mb-2" role="status"></div>
          <p className="small mb-0">{t('my_groups_page.loading', 'Loading your Seettu groups...')}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="ui-card p-5 text-center shadow-sm">
          <Icon name="groups" size={42} className="text-muted opacity-50 mb-3" />
          <h5 className="fw-bold text-dark mb-1">{t('my_groups_page.empty_title', 'No Seettu Groups Joined Yet')}</h5>
          <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
            {t('my_groups_page.empty_desc', 'You are not currently enrolled in any Seettu group circles. Submit your NIC & Grama Niladhari verification to request joining open groups.')}
          </p>
          {!isOrganizer && !isAdmin && (
            <button
              onClick={handleOpenJoinModal}
              className="btn btn-teal px-4 py-2 fw-semibold"
            >
              {t('my_groups_page.explore_btn', 'Explore & Join a Group')}
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {groups.map((group) => {
          const memberPercent = Math.min(100, Math.round((group.membersCount / group.maxMembers) * 100));

          return (
            <div key={group.id} className="col-12 col-md-6 col-lg-4">
              <div className="ui-card p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  {/* Top Row: Title + Type Badge */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark mb-0 pe-2" style={{ fontSize: '1.05rem' }}>
                      {group.name}
                    </h5>
                    <span className="badge-mint flex-shrink-0">
                      {group.type}
                    </span>
                  </div>

                  {/* Members Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
                      <span>{t('my_groups_page.members_enrolled', 'Members')}</span>
                      <span className="fw-semibold text-dark">{group.membersCount}/{group.maxMembers}</span>
                    </div>
                    <div className="custom-progress">
                      <div className="custom-progress-bar" style={{ width: `${memberPercent}%` }}></div>
                    </div>
                  </div>

                  {/* Contribution & Cycle info */}
                  <div className="mb-2 small">
                    <span className="fw-bold text-dark">{t('amount', 'Contribution')}: </span>
                    <span className="text-muted">{group.contributionAmount}</span>
                  </div>

                  <div className="mb-3 small">
                    <span className="fw-bold text-dark">{t('common.cycle', 'Current')}: </span>
                    <span className="text-muted">Cycle {group.currentCycle} of {group.totalCycles}{group.completionRate === 100 && " (Completed)"}</span>
                  </div>

                  {/* Completion Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
                      <span>{t('my_groups_page.completion', 'Completion')}</span>
                      <span className="fw-semibold text-dark">{group.completionRate}%</span>
                    </div>
                    <div className="custom-progress">
                      <div className="custom-progress-bar" style={{ width: `${group.completionRate}%` }}></div>
                    </div>
                  </div>

                  {/* Active Status Badge */}
                  <div className="mb-4">
                    <span className={group.status === 'Completed' || group.completionRate === 100 ? "badge bg-success text-white px-2.5 py-1 rounded-pill fw-semibold" : "badge-mint"}>
                      {group.status === 'Completed' || group.completionRate === 100 ? "Completed" : t(`status.${group.status?.toUpperCase()}`, group.status)}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="d-flex gap-2 align-items-center pt-3 border-top">
                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="btn flex-grow-1 fw-semibold py-1 rounded-2"
                    style={{ border: '1px solid #188754', color: '#188754', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                  >
                    {t('common.view', 'View')}
                  </button>

                  {(isOrganizer || isAdmin) && (
                    <>
                      <button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="btn btn-link p-1 text-decoration-none"
                        style={{ color: '#188754' }}
                        title="Edit Group"
                      >
                        <Icon name="pencil" size={16} color="#188754" />
                      </button>

                      <button
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="btn btn-link p-1 text-decoration-none"
                        style={{ color: '#DC3545' }}
                        title="Delete Group"
                      >
                        <Icon name="trash" size={16} color="#DC3545" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* In-App Organizer Upgrade Modal (No Logout Required) */}
      <OrganizerRequestModal
        isOpen={showOrganizerModal}
        onClose={() => setShowOrganizerModal(false)}
        onSuccess={() => setShowOrganizerModal(false)}
      />

      {/* Join Seettu Group Modal for Members */}
      {showJoinModal && (
        <div className="modal show d-block tab-modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: '#1A3644' }}>Join Seettu Group</h5>
                <button type="button" className="btn-close" onClick={() => setShowJoinModal(false)}></button>
              </div>
              <form onSubmit={handleJoinSubmit}>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-3">
                    Select an open Seettu group to request joining as a participating member.
                  </p>
                  <div className="mb-3 text-start">
                    <label className="form-label fw-semibold text-dark small mb-1">Select Available Seettu Scheme</label>
                    <select
                      className="form-select"
                      value={selectedJoinGroup}
                      onChange={(e) => setSelectedJoinGroup(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a Seettu Group --</option>
                      {displayPublicGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.contributionAmount ? formatContribution(g.contributionAmount, g.cycleFrequency) : 'Standard Contribution'} • {g.category || 'Monetary'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label fw-semibold text-dark small mb-1">Optional Note for Organizer</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Interested in joining this monthly cycle scheme."
                      value={joinMsg}
                      onChange={(e) => setJoinMsg(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingJoin} className="btn btn-teal px-4 fw-semibold">
                    {submittingJoin ? 'Submitting...' : 'Submit Join Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGroups;
