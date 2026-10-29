import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getGroupsByUser, getAllGroups, deleteGroup } from '../api/groupApi';
import {
  createJoinRequest,
  getPendingJoinRequests,
  getJoinRequestsByUser,
  approveJoinRequest,
  rejectJoinRequest,
} from '../api/joinRequestApi';
import { getMyKycStatus } from '../api/userApi';
import { getMyVerification } from '../api/verificationApi';
import Icon from '../components/Icons';
import { Users, Banknote, Gift, X } from 'lucide-react';
import OrganizerApplicationModal from '../components/OrganizerApplicationModal';

const MyGroups = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin, updateUser } = useAuth();
  const navigate = useNavigate();

  const userId = user?.userId || user?.id;

  // Tabs: 'EXPLORE', 'ENROLLED', 'REQUESTS'
  const [activeTab, setActiveTab] = useState('EXPLORE');

  // Groups data
  const [allGroups, setAllGroups] = useState([]);
  const [enrolledGroups, setEnrolledGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join Requests data
  const [myJoinRequests, setMyJoinRequests] = useState([]);
  const [organizerPendingRequests, setOrganizerPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Verification state
  const [userVerification, setUserVerification] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'MONETARY', 'NON_MONETARY'
  const [filterFreq, setFilterFreq] = useState('ALL'); // 'ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
  const [filterSpots, setFilterSpots] = useState('ALL'); // 'ALL', 'OPEN', 'FULL'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'POOL_HIGH', 'CONTRIB_LOW', 'MEMBERS_HIGH'

  // Modals
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [joinModalTarget, setJoinModalTarget] = useState(null);
  const [joinNote, setJoinNote] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Sync latest verification status on page load
  useEffect(() => {
    if (userId) {
      getMyVerification(userId)
        .then((res) => {
          const data = res?.data || res;
          setUserVerification(data);
          if (data?.verificationStatus === 'VERIFIED' && updateUser && user?.kycStatus !== 'VERIFIED') {
            updateUser({
              kycStatus: 'VERIFIED',
              nicNumber: data.nicNumber,
            });
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  const isUserVerified = user?.kycStatus === 'VERIFIED' || userVerification?.verificationStatus === 'VERIFIED';

  // Format contribution string with frequency
  const formatContribution = (amount, frequency) => {
    const formattedAmount = Number(amount || 0).toLocaleString();
    const freq = (frequency || 'MONTHLY').toUpperCase();
    switch (freq) {
      case 'DAILY':
        return `${formattedAmount} LKR / day`;
      case 'WEEKLY':
        return `${formattedAmount} LKR / week`;
      case 'BI_WEEKLY':
        return `${formattedAmount} LKR / 2 weeks`;
      case 'YEARLY':
        return `${formattedAmount} LKR / year`;
      case 'MONTHLY':
      default:
        return `${formattedAmount} LKR / month`;
    }
  };

  const formatFrequency = (freq) => {
    const f = (freq || 'MONTHLY').toUpperCase();
    switch (f) {
      case 'DAILY': return 'Daily Cycle';
      case 'WEEKLY': return 'Weekly Cycle';
      case 'BI_WEEKLY': return 'Bi-Weekly Cycle';
      case 'YEARLY': return 'Yearly Cycle';
      case 'MONTHLY':
      default: return 'Monthly Cycle';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SO';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [allRes, userRes] = await Promise.all([
        getAllGroups().catch(() => ({ data: [] })),
        getGroupsByUser(userId).catch(() => ({ data: [] }))
      ]);

      const allList = allRes?.data || allRes || [];
      const userList = userRes?.data || userRes || [];

      setAllGroups(Array.isArray(allList) ? allList : []);
      setEnrolledGroups(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch join requests
  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    setLoadingRequests(true);
    try {
      // 1. Fetch user's own sent requests
      const userReqRes = await getJoinRequestsByUser(userId).catch(() => ({ data: [] }));
      const userReqs = userReqRes?.data || userReqRes || [];
      setMyJoinRequests(Array.isArray(userReqs) ? userReqs : []);

      // 2. If Organizer or Admin, fetch all pending requests
      if (isOrganizer || isAdmin) {
        const pendingRes = await getPendingJoinRequests().catch(() => ({ data: [] }));
        const pendingList = pendingRes?.data || pendingRes || [];
        // If organizer, filter to groups created by this organizer (Admins see all)
        const relevant = isAdmin
          ? pendingList
          : pendingList.filter((r) => r.group?.createdById === userId || r.group?.createdBy?.id === userId);
        setOrganizerPendingRequests(Array.isArray(relevant) ? relevant : []);
      }
    } catch (err) {
      console.error('Failed to load join requests', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [userId, isOrganizer, isAdmin]);

  useEffect(() => {
    fetchGroups();
    fetchRequests();
  }, [fetchGroups, fetchRequests]);

  // Handle Join Request Submit
  const handleOpenJoinModal = (group) => {
    if (!isUserVerified && user?.role === 'MEMBER') {
      if (window.confirm('Identity verification is required before joining Seettu circles to protect member funds. Would you like to complete your verification now?')) {
        navigate('/verification');
      }
      return;
    }
    setJoinModalTarget(group);
    setJoinNote('');
  };

  const handleConfirmJoinRequest = async (e) => {
    e.preventDefault();
    if (!joinModalTarget) return;

    setSubmittingJoin(true);
    setActionError('');
    try {
      await createJoinRequest(joinModalTarget.id, userId);
      setActionSuccess(`Join request for "${joinModalTarget.name}" submitted successfully! The group organizer will review your request.`);
      setJoinModalTarget(null);
      setJoinNote('');
      setTimeout(() => setActionSuccess(''), 5000);
      await fetchRequests();
    } catch (err) {
      console.error('Join request error', err);
      setActionError(err.response?.data?.message || 'Failed to submit join request.');
    } finally {
      setSubmittingJoin(false);
    }
  };

  // Organizer: Approve Join Request
  const handleApproveRequest = async (requestId, memberName, groupName) => {
    setActionLoadingId(requestId);
    setActionError('');
    setActionSuccess('');
    try {
      await approveJoinRequest(requestId);
      setActionSuccess(`${memberName || 'Member'} has been approved and added to "${groupName || 'the group'}"!`);
      setTimeout(() => setActionSuccess(''), 5000);
      await Promise.all([fetchGroups(), fetchRequests()]);
    } catch (err) {
      console.error('Failed to approve request', err);
      setActionError(err.response?.data?.message || 'Failed to approve join request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Organizer: Reject Join Request
  const handleRejectRequest = async (requestId, memberName) => {
    if (!window.confirm(`Are you sure you want to decline the join request from ${memberName || 'this member'}?`)) {
      return;
    }
    setActionLoadingId(requestId);
    setActionError('');
    setActionSuccess('');
    try {
      await rejectJoinRequest(requestId);
      setActionSuccess(`Declined join request from ${memberName || 'member'}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to reject request', err);
      setActionError(err.response?.data?.message || 'Failed to reject join request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Group (Organizer / Admin)
  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete the circle "${groupName}"?`)) {
      return;
    }
    try {
      await deleteGroup(groupId);
      setActionSuccess(`Circle "${groupName}" deleted successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert(err.response?.data?.message || 'Failed to delete group from database.');
    }
  };

  // Filter & Search Logic
  const filteredDisplayGroups = useMemo(() => {
    const sourceList = activeTab === 'ENROLLED' ? enrolledGroups : allGroups;

    return sourceList.filter((g) => {
      // Search keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name?.toLowerCase().includes(q);
        const matchesDesc = g.description?.toLowerCase().includes(q);
        const matchesOrg = g.createdByName?.toLowerCase().includes(q);
        const matchesShop = g.shopName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesOrg && !matchesShop) return false;
      }

      // Seettu Type
      if (filterType !== 'ALL') {
        const isMonetary = g.seettuTypeName === 'Monetary' || g.category === 'Financial' || g.category === 'MONETARY';
        if (filterType === 'MONETARY' && !isMonetary) return false;
        if (filterType === 'NON_MONETARY' && isMonetary) return false;
      }

      // Frequency
      if (filterFreq !== 'ALL') {
        if ((g.cycleFrequency || 'MONTHLY').toUpperCase() !== filterFreq) return false;
      }

      // Spots
      if (filterSpots !== 'ALL') {
        const membersCount = Array.isArray(g.members) ? g.members.length : (g.membersCount || 0);
        const maxMembers = g.memberCount || 10;
        const isFull = membersCount >= maxMembers;
        if (filterSpots === 'OPEN' && isFull) return false;
        if (filterSpots === 'FULL' && !isFull) return false;
      }

      return true;
    }).sort((a, b) => {
      const aPool = Number(a.contributionAmount || 0) * (a.memberCount || 10);
      const bPool = Number(b.contributionAmount || 0) * (b.memberCount || 10);
      if (sortBy === 'POOL_HIGH') return bPool - aPool;
      if (sortBy === 'CONTRIB_LOW') return Number(a.contributionAmount || 0) - Number(b.contributionAmount || 0);
      if (sortBy === 'MEMBERS_HIGH') return (b.members?.length || 0) - (a.members?.length || 0);
      return b.id - a.id;
    });
  }, [activeTab, allGroups, enrolledGroups, searchQuery, filterType, filterFreq, filterSpots, sortBy]);

  // Helper to test if user is in group
  const isUserInGroup = (group) => {
    if (!group || !userId) return false;
    if (Array.isArray(group.members)) {
      return group.members.some(
        (m) => (m.userId === userId || m.id === userId) && (m.status === 'ACTIVE' || !m.status)
      );
    }
    return enrolledGroups.some((eg) => eg.id === group.id);
  };

  // Helper to check if user has a pending join request
  const hasUserRequested = (group) => {
    if (!group || !userId) return false;
    return myJoinRequests.some(
      (r) => (r.group?.id === group.id || r.groupId === group.id) && r.status === 'PENDING'
    );
  };

  // Helper to check if user created this group
  const isUserGroupCreator = (group) => {
    if (!group || !userId) return false;
    return group.createdById === userId || group.createdBy?.id === userId;
  };

  const pendingRequestsCountForGroup = (groupId) => {
    return organizerPendingRequests.filter(
      (r) => r.group?.id === groupId || r.groupId === groupId
    ).length;
  };

  return (
    <div className="my-groups-container">
      {/* Page Title & Top Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0F2F3D' }}>
            <Users size={24} style={{ color: '#0F2F3D' }} />
            <span>{t('my_groups_page.title', 'Seettu Circles & Contribution Pools')}</span>
          </h2>
          <p className="text-muted mb-0 small">
            Browse active rotational credit schemes, check funding targets, and apply to join open circles.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {isAdmin ? (
            <span className="badge bg-light text-secondary border px-3 py-2 small fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm">
              <Icon name="shield" size={15} color="#235665" />
              <span>Platform Overseer</span>
            </span>
          ) : isOrganizer ? (
            <Link
              to="/groups/create"
              className="btn btn-teal px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm text-white fw-semibold"
              style={{ backgroundColor: '#1c4d4b', borderColor: '#0097B2' }}
            >
              <Icon name="plus" size={16} color="#FFFFFF" />
              <span>{t('my_groups_page.create_new', 'Create New Circle')}</span>
            </Link>
          ) : (
            <div className="d-flex align-items-center gap-2">
              {!isUserVerified ? (
                <Link
                  to="/verification"
                  className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1.5 fw-bold shadow-sm px-3 py-2"
                  title="Verify your NIC & Grama Niladhari certificate to be authorized to join contribution circles"
                >
                  <Icon name="shield" size={15} color="#D97706" />
                  <span>Verify ID to Join Circles</span>
                </Link>
              ) : (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-inline-flex align-items-center gap-1.5 fw-semibold">
                  <Icon name="check-circle" size={14} color="#059669" />
                  <span>Verified Member</span>
                </span>
              )}
              {user?.requestedRole !== 'ORGANIZER' && (
                <button
                  type="button"
                  onClick={() => setShowOrganizerModal(true)}
                  className="btn btn-sm btn-outline-secondary px-3 py-2 d-inline-flex align-items-center gap-1.5 fw-semibold"
                  style={{ background: '#0F2F3D', color: '#fff'}}
                >
                  <Icon name="award" size={15} />
                  <span>Become Organizer</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Alert Messages */}
      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
          <Icon name="check-circle" size={18} color="#059669" />
          <div className="fw-semibold">{actionSuccess}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionSuccess('')} aria-label="Close"></button>
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
          <Icon name="alert-circle" size={18} color="#DC2626" />
          <div>{actionError}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionError('')} aria-label="Close"></button>
        </div>
      )}

      {/* Verification Notice Banner for Unverified Members */}
      {!isUserVerified && user?.role === 'MEMBER' && (
        <div className="card border-0 mb-4 rounded-3 shadow-sm" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
          <div className="card-body p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-2 bg-white text-warning shadow-sm flex-shrink-0">
                <Icon name="shield" size={24} color="#D97706" />
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0.5">Identity Verification Required for Pool Participation</h6>
                <p className="text-dark mb-0 small" style={{ fontSize: '0.85rem' }}>
                  Under the Sri Lankan Cheetus Ordinance and platform rules, all members must verify their National Identity Card (NIC) & Grama Niladhari Character Certificate before joining Seettu groups.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="btn btn-sm btn-dark text-white fw-bold px-3 py-2 flex-shrink-0 text-nowrap shadow-sm"
              style={{ backgroundColor: '#1F2937' }}
            >
              Complete Verification →
            </Link>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-4 flex-wrap gap-2">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`nav-link px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${
                activeTab === 'EXPLORE' ? 'active shadow-sm' : 'text-secondary'
              }`}
              style={activeTab === 'EXPLORE' ? { backgroundColor: '#0097B2', color: '#FFFFFF' } : {}}
              onClick={() => setActiveTab('EXPLORE')}
            >
              <Icon name="globe" size={16} color={activeTab === 'EXPLORE' ? '#FFFFFF' : 'currentColor'} />
              <span>Explore All Circles</span>
              <span className={`badge rounded-pill ${activeTab === 'EXPLORE' ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`}>
                {allGroups.length}
              </span>
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${
                activeTab === 'ENROLLED' ? 'active shadow-sm' : 'text-secondary'
              }`}
              style={activeTab === 'ENROLLED' ? { backgroundColor: '#0097B2', color: '#FFFFFF' } : {}}
              onClick={() => setActiveTab('ENROLLED')}
            >
              <Icon name="groups" size={16} color={activeTab === 'ENROLLED' ? '#FFFFFF' : 'currentColor'} />
              <span>My Enrolled Circles</span>
              <span className={`badge rounded-pill ${activeTab === 'ENROLLED' ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`}>
                {enrolledGroups.length}
              </span>
            </button>
          </li>

          {(isOrganizer || isAdmin) && (
            <li className="nav-item">
              <button
                className={`nav-link px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${
                  activeTab === 'REQUESTS' ? 'active shadow-sm' : 'text-secondary'
                }`}
                style={activeTab === 'REQUESTS' ? { backgroundColor: '#0F2F3D', color: '#FFFFFF' } : {}}
                onClick={() => setActiveTab('REQUESTS')}
              >
                <Icon name="users" size={16} color={activeTab === 'REQUESTS' ? '#FFFFFF' : 'currentColor'} />
                <span>Member Join Requests</span>
                {organizerPendingRequests.length > 0 && (
                  <span className="badge rounded-pill bg-danger text-white">
                    {organizerPendingRequests.length}
                  </span>
                )}
              </button>
            </li>
          )}
        </ul>

        {activeTab !== 'REQUESTS' && (
          <div className="small text-muted">
            Showing <strong>{filteredDisplayGroups.length}</strong> {activeTab === 'ENROLLED' ? 'enrolled' : 'available'} circles
          </div>
        )}
      </div>

      {/* View 1: Join Requests Review Portal (For Organizers / Admins) */}
      {activeTab === 'REQUESTS' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">Incoming Member Join Requests</h5>
              <p className="text-muted small mb-0">
                Review verified members who have requested to participate in your Seettu circles.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={fetchRequests}
              disabled={loadingRequests}
            >
              <Icon name="rotate" size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingRequests ? (
            <div className="text-center py-5">
              <div className="spinner-border text-teal mb-2" role="status" style={{ color: '#0097B2' }}></div>
              <p className="text-muted small">Loading membership applications...</p>
            </div>
          ) : organizerPendingRequests.length === 0 ? (
            <div className="ui-card p-5 text-center shadow-sm rounded-4">
              <div className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center bg-light text-muted mb-3" style={{ width: '64px', height: '64px' }}>
                <Icon name="check-circle" size={32} color="#059669" />
              </div>
              <h5 className="fw-bold text-dark mb-1">No Pending Join Requests</h5>
              <p className="text-muted small mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
                All member applications for your contribution circles have been processed. New requests will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {organizerPendingRequests.map((req) => {
                const reqUser = req.user || {};
                const reqGroup = req.group || {};
                const isVerifiedApplicant = reqUser.kycStatus === 'VERIFIED';
                const isBusy = actionLoadingId === req.id;

                return (
                  <div key={req.id} className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3 h-100 p-3 bg-white d-flex flex-column justify-content-between">
                      <div>
                        {/* Header: Member Avatar & Verification Status */}
                        <div className="d-flex justify-content-between align-items-start mb-2.5">
                          <div className="d-flex align-items-center gap-2.5">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                              style={{ width: '42px', height: '42px', backgroundColor: '#1A5265', fontSize: '0.9rem' }}
                            >
                              {getInitials(reqUser.fullName || 'Member')}
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-0">{reqUser.fullName || 'Member'}</h6>
                              <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                                {reqUser.email || 'No email provided'} • {reqUser.phone || 'No phone'}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isVerifiedApplicant ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                                <Icon name="check-circle" size={12} color="#059669" />
                                <span>Verified ID (NIC: {reqUser.nicNumber || 'Yes'})</span>
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 small fw-semibold">
                                Pending NIC Verification
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Target Circle Details */}
                        <div className="p-2.5 rounded-2 mb-2.5" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div className="small text-muted">Requested Circle:</div>
                          <div className="fw-bold text-dark">{reqGroup.name || 'Seettu Group'}</div>
                          <div className="d-flex justify-content-between text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
                            <span>Contribution: <strong className="text-dark">Rs. {Number(reqGroup.contributionAmount || 0).toLocaleString()} LKR</strong></span>
                            <span>Target Slots: <strong className="text-dark">{reqGroup.memberCount || 10} members</strong></span>
                          </div>
                        </div>

                        <div className="small text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                          Applied on: {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </div>
                      </div>

                      {/* Organizer Decision Actions */}
                      <div className="d-flex gap-2 pt-2 border-top">
                        <button
                          type="button"
                          className="btn btn-teal btn-sm fw-bold flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1.5 text-white"
                          style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                          disabled={isBusy}
                          onClick={() => handleApproveRequest(req.id, reqUser.fullName, reqGroup.name)}
                        >
                          {isBusy ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <>
                              <Icon name="check" size={14} color="#FFFFFF" />
                              <span>Approve & Add to Group</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm fw-semibold d-inline-flex align-items-center gap-1"
                          disabled={isBusy}
                          onClick={() => handleRejectRequest(req.id, reqUser.fullName)}
                        >
                          <Icon name="x" size={13} />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Donation Card Grid (Explore All Circles & My Enrolled Circles) */}
      {activeTab !== 'REQUESTS' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="card shadow-sm border-0 mb-4 bg-white p-3 rounded-3">
            <div className="row g-2 align-items-center">
              {/* Search Keyword */}
              <div className="col-12 col-md-4">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Icon name="search" size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by circle name, organizer, shop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchQuery('')}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="MONETARY">Monetary</option>
                  <option value="NON_MONETARY">Non-Monetary</option>
                </select>
              </div>

              {/* Frequency Filter */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filterFreq}
                  onChange={(e) => setFilterFreq(e.target.value)}
                >
                  <option value="ALL">All Frequencies</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              {/* Spots Filter */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filterSpots}
                  onChange={(e) => setFilterSpots(e.target.value)}
                >
                  <option value="ALL">All Availabilities</option>
                  <option value="OPEN">Open Spots</option>
                  <option value="FULL">Full Circles</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="DEFAULT">Sort: Default</option>
                  <option value="POOL_HIGH">Highest Pool</option>
                  <option value="CONTRIB_LOW">Lowest Contribution</option>
                  <option value="MEMBERS_HIGH">Most Members</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-teal mb-3" role="status" style={{ color: '#0097B2' }}></div>
              <p className="text-muted fw-semibold">Loading Seettu circles...</p>
            </div>
          ) : filteredDisplayGroups.length === 0 ? (
            <div className="ui-card p-5 text-center shadow-sm rounded-4">
              <div className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center bg-light text-muted mb-3" style={{ width: '64px', height: '64px' }}>
                <Icon name="groups" size={32} color="#94A3B8" />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {activeTab === 'ENROLLED' ? 'No Enrolled Circles Yet' : 'No Seettu Circles Found'}
              </h5>
              <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
                {activeTab === 'ENROLLED'
                  ? 'You are not enrolled in any Seettu circles yet. Explore open circles and send a join request to organizers.'
                  : 'No circles match your current search and filter criteria. Try resetting filters.'}
              </p>
              {activeTab === 'ENROLLED' ? (
                <button
                  type="button"
                  className="btn btn-teal px-4 py-2 fw-semibold text-white shadow-sm"
                  style={{ backgroundColor: '#0097B2' }}
                  onClick={() => setActiveTab('EXPLORE')}
                >
                  Explore Available Circles
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3 py-1.5 small fw-semibold"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setFilterFreq('ALL');
                    setFilterSpots('ALL');
                    setSortBy('DEFAULT');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {filteredDisplayGroups.map((group) => {
                const isMonetary = group.seettuTypeName === 'Monetary' || group.category === 'Financial' || group.category === 'MONETARY';
                const membersCount = Array.isArray(group.members) ? group.members.length : (group.membersCount || 0);
                const maxMembers = group.memberCount || 10;
                const memberPercent = Math.min(100, Math.round((membersCount / maxMembers) * 100));
                const spotsRemaining = Math.max(0, maxMembers - membersCount);
                const isFull = spotsRemaining === 0;

                const contributionVal = Number(group.contributionAmount || 0);
                const totalTargetPool = contributionVal * maxMembers;

                const isEnrolled = isUserInGroup(group);
                const isRequested = hasUserRequested(group);
                const isCreator = isUserGroupCreator(group);
                const groupPendingRequests = pendingRequestsCountForGroup(group.id);

                return (
                  <div key={group.id} className="col-12 col-md-6 col-lg-4">
                    <div
                      className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column justify-content-between transition-all"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 18px rgba(15, 47, 61, 0.06)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(15, 47, 61, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 47, 61, 0.06)';
                      }}
                    >
                      {/* Top Donation Header Banner */}
                      <div
                        className="p-3 text-white position-relative"
                        style={{
                          background: isMonetary
                            ? 'linear-gradient(135deg, #0F2F3D 0%, #1A5265 60%, #0097B2 100%)'
                            : 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 60%, #4F46E5 100%)',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span
                            className="badge px-2.5 py-1 text-uppercase fw-bold"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.18)',
                              backdropFilter: 'blur(6px)',
                              fontSize: '0.72rem',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {isMonetary ? (<span className="d-inline-flex align-items-center gap-1"><Banknote size={13} /> Cash Rotation</span>) : (<span className="d-inline-flex align-items-center gap-1"><Gift size={13} /> Commodity Goods</span>)}
                          </span>

                          <span
                            className="badge px-2.5 py-1 fw-bold"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              color: isMonetary ? '#0F2F3D' : '#312E81',
                              fontSize: '0.72rem'
                            }}
                          >
                            {formatFrequency(group.cycleFrequency)}
                          </span>
                        </div>

                        {/* Title inside Header */}
                        <h5
                          className="fw-bold mb-1 text-white text-truncate cursor-pointer"
                          style={{ fontSize: '1.15rem' }}
                          title={group.name}
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          {group.name}
                        </h5>

                        {/* Shop badge if non-monetary */}
                        {!isMonetary && group.shopName && (
                          <div className="small text-white-50 d-flex align-items-center gap-1 text-truncate" style={{ fontSize: '0.78rem' }}>
                            <Icon name="shop" size={13} color="#FFFFFF" />
                            <span>Partner Shop: <strong>{group.shopName}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                          {/* Organizer Row */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ width: '28px', height: '28px', backgroundColor: '#3E7B8E', fontSize: '0.75rem' }}
                              >
                                {getInitials(group.createdByName || 'Organizer')}
                              </div>
                              <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                                Organized by <strong className="text-dark">{group.createdByName || 'Verified Organizer'}</strong>
                              </div>
                            </div>

                            {/* Spot Availability Tag */}
                            {isFull ? (
                              <span className="badge bg-secondary-subtle text-secondary small px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                                Circle Full
                              </span>
                            ) : (
                              <span
                                className="badge px-2 py-0.5 fw-bold"
                                style={{
                                  backgroundColor: spotsRemaining <= 2 ? '#FEF2F2' : '#ECFDF5',
                                  color: spotsRemaining <= 2 ? '#DC2626' : '#059669',
                                  border: `1px solid ${spotsRemaining <= 2 ? '#FECACA' : '#A7F3D0'}`,
                                  fontSize: '0.72rem'
                                }}
                              >
                                {spotsRemaining} {spotsRemaining === 1 ? 'Spot Left' : 'Spots Left'}
                              </span>
                            )}
                          </div>

                          {/* Description snippet */}
                          {group.description && (
                            <p className="text-muted small mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.4', minHeight: '34px' }}>
                              {group.description.length > 95 ? `${group.description.slice(0, 95)}...` : group.description}
                            </p>
                          )}

                          {/* Target Pool Goal Box (The Core Donation Card Box) */}
                          <div
                            className="p-3 rounded-3 mb-3"
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-0.5">
                              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                Total Target Pool
                              </span>
                              <span className="badge bg-light text-dark border small" style={{ fontSize: '0.68rem' }}>
                                {maxMembers} Shares
                              </span>
                            </div>
                            <div className="fs-4 fw-bold text-dark d-flex align-items-baseline gap-1">
                              <span>Rs. {totalTargetPool.toLocaleString()}</span>
                              <span className="text-muted fw-normal small" style={{ fontSize: '0.8rem' }}>LKR</span>
                            </div>
                            <div className="text-muted small mt-1 d-flex justify-content-between align-items-center pt-1 border-top" style={{ fontSize: '0.78rem' }}>
                              <span>Per Member Contribution:</span>
                              <strong className="text-dark">{formatContribution(group.contributionAmount, group.cycleFrequency)}</strong>
                            </div>
                          </div>

                          {/* Donation-Style Member Progress Bar */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center small mb-1">
                              <span className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                                {membersCount} of {maxMembers} Members Joined
                              </span>
                              <span className="fw-bold" style={{ color: memberPercent >= 100 ? '#059669' : '#0097B2', fontSize: '0.8rem' }}>
                                {memberPercent}% Filled
                              </span>
                            </div>
                            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${memberPercent}%`,
                                  height: '100%',
                                  background: memberPercent >= 100
                                    ? '#10B981'
                                    : 'linear-gradient(90deg, #0097B2 0%, #10B981 100%)',
                                  borderRadius: '10px',
                                  transition: 'width 0.4s ease'
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                              <span>{isFull ? 'All slots filled' : `${spotsRemaining} slots remaining to begin`}</span>
                              <span>Cycle: {group.completedCycles || 0}/{maxMembers}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="pt-2 border-top mt-auto">
                          {isEnrolled ? (
                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="btn btn-outline-success btn-sm w-100 fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                              >
                                <Icon name="check" size={15} color="#16A34A" />
                                <span>Enrolled Member • View Circle →</span>
                              </button>
                            </div>
                          ) : isRequested ? (
                            <button
                              type="button"
                              className="btn btn-warning btn-sm w-100 fw-bold py-2 text-dark d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                              style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}
                              disabled
                            >
                              <Icon name="clock" size={15} color="#92400E" />
                              <span>Join Request Pending Organizer Review</span>
                            </button>
                          ) : isCreator ? (
                            <div className="d-flex gap-2 align-items-center">
                              <button
                                type="button"
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold py-1.5"
                              >
                                Manage Circle
                              </button>
                              {groupPendingRequests > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('REQUESTS')}
                                  className="btn btn-danger btn-sm fw-bold py-1.5 px-2.5 d-inline-flex align-items-center gap-1"
                                  title={`${groupPendingRequests} join requests waiting`}
                                >
                                  <Icon name="bell" size={13} color="#FFFFFF" />
                                  <span>{groupPendingRequests}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                className="btn btn-link text-danger p-1"
                                title="Delete Circle"
                              >
                                <Icon name="trash" size={15} color="#DC2626" />
                              </button>
                            </div>
                          ) : isFull ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm w-100 fw-semibold py-2"
                              disabled
                            >
                              Circle Full ({membersCount}/{maxMembers})
                            </button>
                          ) : isUserVerified ? (
                            <button
                              type="button"
                              onClick={() => handleOpenJoinModal(group)}
                              className="btn btn-teal btn-sm w-100 fw-bold py-2 text-white shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                              style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                            >
                              <Icon name="plus" size={15} color="#FFFFFF" />
                              <span>Request to Join Circle</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate('/verification')}
                              className="btn btn-outline-warning btn-sm w-100 fw-bold py-2 text-dark d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                            >
                              <Icon name="shield" size={15} color="#D97706" />
                              <span>Verify ID to Request Join</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Interactive Join Request Confirmation for Verified Members */}
      {joinModalTarget && (
        <div className="modal show d-block tab-modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header border-0 text-white p-4"
                style={{
                  background: 'linear-gradient(135deg, #0F2F3D 0%, #1A5265 60%, #0097B2 100%)',
                }}
              >
                <div>
                  <h5 className="modal-title fw-bold mb-1">Request to Join Seettu Circle</h5>
                  <p className="text-white-50 mb-0 small">
                    Your verified profile will be shared with the circle organizer for admission.
                  </p>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setJoinModalTarget(null)}></button>
              </div>

              <form onSubmit={handleConfirmJoinRequest}>
                <div className="modal-body p-4">
                  {/* Summary of Circle */}
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="small text-muted">Circle Target:</div>
                    <div className="fw-bold text-dark fs-5">{joinModalTarget.name}</div>
                    <div className="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
                      <span>Contribution:</span>
                      <strong className="text-dark">{formatContribution(joinModalTarget.contributionAmount, joinModalTarget.cycleFrequency)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mt-1">
                      <span>Total Pool Goal:</span>
                      <strong className="text-dark">
                        Rs. {(Number(joinModalTarget.contributionAmount || 0) * (joinModalTarget.memberCount || 10)).toLocaleString()} LKR
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mt-1">
                      <span>Organizer:</span>
                      <strong className="text-dark">{joinModalTarget.createdByName || 'Verified Organizer'}</strong>
                    </div>
                  </div>

                  {/* Verified Member Credentials Badge */}
                  <div className="p-2.5 rounded-2 mb-3 d-flex align-items-center gap-2 bg-success-subtle border border-success-subtle">
                    <Icon name="check-circle" size={18} color="#059669" />
                    <div className="small text-success-emphasis">
                      Submitting as verified member: <strong>{user?.fullName || 'Member'}</strong>
                      {user?.nicNumber && <span> (NIC: {user.nicNumber})</span>}
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div className="mb-2 text-start">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Optional Note for Organizer
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g., I am interested in joining this circle for regular monthly savings. My profession is..."
                      value={joinNote}
                      onChange={(e) => setJoinNote(e.target.value)}
                    ></textarea>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                      The organizer will receive this note along with your verified contact information.
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 p-3 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setJoinModalTarget(null)}
                    disabled={submittingJoin}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-teal px-4 fw-bold text-white shadow-sm d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                    disabled={submittingJoin}
                  >
                    {submittingJoin ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} color="#FFFFFF" />
                        <span>Send Join Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* In-App Organizer Upgrade Modal */}
      <OrganizerApplicationModal
        show={showOrganizerModal}
        onClose={() => setShowOrganizerModal(false)}
        onSuccess={() => setShowOrganizerModal(false)}
      />
    </div>
  );
};

export default MyGroups;
