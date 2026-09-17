import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupsByUser } from '../api/groupApi';
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
        setGroups(defaultGroups);
        setLoading(false);
        return;
      }
      try {
        const res = await getGroupsByUser(userId);
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map(g => ({
            id: g.id,
            name: g.name,
            type: g.seettuType?.name || (g.category === 'NON_MONETARY' ? 'Non-Monetary' : 'Monetary'),
            membersCount: g.members?.length || 10,
            maxMembers: g.memberCount || 10,
            contributionAmount: `${(g.contributionAmount || 1000).toLocaleString()} LKR per month`,
            currentCycle: g.currentCycle || 1,
            totalCycles: g.memberCount || 10,
            completionRate: Math.round(((g.currentCycle || 1) / (g.memberCount || 10)) * 100),
            status: g.status === 'ACTIVE' ? 'Active' : g.status || 'Active'
          }));
          setGroups(formatted);
        } else {
          setGroups(defaultGroups);
        }
      } catch (error) {
        console.error('Failed to fetch groups, using demo defaults', error);
        setGroups(defaultGroups);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

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
        {(isOrganizer || isAdmin || true) && (
          <Link to="/groups/create" className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2">
            <span>+</span> Create New Group
          </Link>
        )}
      </div>

      {/* 3-Column Card Grid */}
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGroups;
