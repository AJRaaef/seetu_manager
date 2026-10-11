import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupsByUser, getAllGroups } from '../api/groupApi';
import { createJoinRequest } from '../api/joinRequestApi';
import Icon from '../components/Icons';

const MyGroups = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.userId || user?.id;

  const defaultGroups = [
    {
      id: 1,
      name: "Village Women's Seettu",
      type: 'Monetary',
      membersCount: 12,
      maxMembers: 12,
      contributionAmount: '1,000 LKR per month',
      currentCycle: 5,
      totalCycles: 12,
      completionRate: 42,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Small Business Seettu',
      type: 'Monetary',
      membersCount: 8,
      maxMembers: 10,
      contributionAmount: '5,000 LKR per month',
      currentCycle: 3,
      totalCycles: 10,
      completionRate: 30,
      status: 'Active'
    },
    {
      id: 3,
      name: "Community Farmer's Group",
      type: 'Non-Monetary',
      membersCount: 15,
      maxMembers: 15,
      contributionAmount: '2,000 LKR per month',
      currentCycle: 8,
      totalCycles: 15,
      completionRate: 53,
      status: 'Active'
    }
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) {
        setGroups([]);
        setLoading(false);
        return;
      }
      try {
        const res = await getGroupsByUser(userId);
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(g => ({
            id: g.id,
            name: g.name,
            type: g.seettuType?.name || (g.category === 'NON_MONETARY' ? 'Non-Monetary' : 'Monetary'),
            membersCount: g.members?.length || 1,
            maxMembers: g.memberCount || 10,
            contributionAmount: `${(g.contributionAmount || 1000).toLocaleString()} LKR per month`,
            currentCycle: g.currentCycle || 1,
            totalCycles: g.memberCount || 10,
            completionRate: Math.round(((g.currentCycle || 1) / (g.memberCount || 10)) * 100),
            status: g.status === 'ACTIVE' ? 'Active' : g.status || 'Active'
          }));
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
    };

    fetchGroups();
  }, [userId]);

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

  const defaultPublicGroups = [
    { id: 101, name: "Gold Saver Monthly Seettu", contributionAmount: 10000, category: "GOLD" },
    { id: 102, name: "Community Farmer Circle", contributionAmount: 5000, category: "GENERAL" },
    { id: 103, name: "Small Business Equipment Seettu", contributionAmount: 25000, category: "FURNITURE" },
    { id: 104, name: "Express Weekly Micro Savings", contributionAmount: 2000, category: "GENERAL" }
  ];

  const displayPublicGroups = publicGroups.length > 0 ? publicGroups : defaultPublicGroups;

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJoinGroup) return;
    setSubmittingJoin(true);
    try {
      await createJoinRequest(selectedJoinGroup, userId);
      alert('✓ Request to join Seettu group submitted successfully to the database! The group organizer will review your request.');
      setShowJoinModal(false);
      setSelectedJoinGroup('');
      setJoinMsg('');
    } catch (err) {
      console.error('Join request error', err);
      const msg = err.response?.data?.message || 'Failed to submit join request to database.';
      alert('⚠️ ' + msg);
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleDeleteGroup = (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  return (
    <div className="my-groups-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>My Groups</h2>
        {isOrganizer || isAdmin ? (
          <Link to="/groups/create" className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2">
            <span>+</span> Create New Group
          </Link>
        ) : (
          <button 
            onClick={() => {
              if (user?.role === 'MEMBER' && user?.kycStatus !== 'VERIFIED') {
                alert('⚠️ Verification Required: To prevent fraud, duplicate accounts, and financial risks, you must verify your Sri Lankan NIC and submit a Grama Niladhari Character Certificate before joining Seettu groups.\n\nPlease visit your Profile page to complete verification.');
                navigate('/profile');
                return;
              }
              setShowJoinModal(true);
            }} 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
          >
            <span>+</span> Join Group
          </button>
        )}
      </div>

      {/* 3-Column Card Grid or Empty State */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-teal mb-2" role="status"></div>
          <p className="small mb-0">Loading your Seettu groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="ui-card p-5 text-center shadow-sm">
          <Icon name="groups" size={42} className="text-muted opacity-50 mb-3" />
          <h5 className="fw-bold text-dark mb-1">No Seettu Groups Joined Yet</h5>
          <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
            You are not currently enrolled in any Seettu group circles. Submit your NIC & Grama Niladhari verification to request joining open groups.
          </p>
          {!isOrganizer && !isAdmin && (
            <button 
              onClick={() => {
                if (user?.role === 'MEMBER' && user?.kycStatus !== 'VERIFIED') {
                  alert('⚠️ Verification Required: To prevent fraud, duplicate accounts, and financial risks, you must verify your Sri Lankan NIC and submit a Grama Niladhari Character Certificate before joining Seettu groups.\n\nPlease visit your Profile page to complete verification.');
                  navigate('/profile');
                  return;
                }
                setShowJoinModal(true);
              }}
              className="btn btn-teal px-4 py-2 fw-semibold"
            >
              Explore & Join a Group
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
                      <span>Members</span>
                      <span className="fw-semibold text-dark">{group.membersCount}/{group.maxMembers}</span>
                    </div>
                    <div className="custom-progress">
                      <div className="custom-progress-bar" style={{ width: `${memberPercent}%` }}></div>
                    </div>
                  </div>

                  {/* Contribution & Cycle info */}
                  <div className="mb-2 small">
                    <span className="fw-bold text-dark">Contribution: </span>
                    <span className="text-muted">{group.contributionAmount}</span>
                  </div>

                  <div className="mb-3 small">
                    <span className="fw-bold text-dark">Current: </span>
                    <span className="text-muted">Cycle {group.currentCycle} of {group.totalCycles}</span>
                  </div>

                  {/* Completion Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center small text-muted mb-1">
                      <span>Completion</span>
                      <span className="fw-semibold text-dark">{group.completionRate}%</span>
                    </div>
                    <div className="custom-progress">
                      <div className="custom-progress-bar" style={{ width: `${group.completionRate}%` }}></div>
                    </div>
                  </div>

                  {/* Active Status Badge */}
                  <div className="mb-4">
                    <span className="badge-mint">
                      {group.status}
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
                    View
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
                          {g.name} ({g.contributionAmount ? `${g.contributionAmount} LKR` : 'Standard Contribution'} • {g.category || 'Monetary'})
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
