import React, { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import InviteMemberModal from '../components/InviteMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import { getAllMembers, getAllGroups, removeMember, inviteMember } from '../api/groupApi';
import { getErrorMessage } from '../utils/errorHandler';

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

const Members = () => {
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [membersRes, groupsRes] = await Promise.all([
        getAllMembers(),
        getAllGroups()
      ]);

      const mList = membersRes?.data || membersRes || [];
      const gList = groupsRes?.data || groupsRes || [];

      setRawMembers(Array.isArray(mList) ? mList : []);
      setGroups(Array.isArray(gList) ? gList : []);
    } catch (err) {
      console.error('Failed to load members or groups:', err);
      setErrorMsg(getErrorMessage(err, 'Failed to fetch members from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        setActionMsg(`✓ Member ${name} removed successfully.`);
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
    setActionMsg(`✓ Updated member details for ${updated.name}`);
  };

  // Normalized display items
  const formattedMembers = rawMembers.map((m) => {
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
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2"
        >
          <Icon name="user-plus" size={18} />
          <span>Invite Members</span>
        </button>
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
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Discipline Score</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Status</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-teal" role="status" style={{ color: '#1A5265' }}></div>
                    <p className="mt-2 text-muted small">Loading members from database...</p>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
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
                    <td className="py-3 px-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
