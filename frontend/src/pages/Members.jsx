import React, { useState } from 'react';
import Icon from '../components/Icons';
import InviteMemberModal from '../components/InviteMemberModal';
import EditMemberModal from '../components/EditMemberModal';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Kamala Perera',
      email: 'kamala@gmail.com',
      phone: '0771234567',
      group: "Village Women's",
      joinedDate: '2026-01-15',
      score: 92,
      scoreLabel: 'Excellent',
      scoreColor: '#188754',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Suresh Kumar',
      email: 'suresh@gmail.com',
      phone: '0774589632',
      group: "Village Women's",
      joinedDate: '2026-01-15',
      score: 68,
      scoreLabel: 'Fair',
      scoreColor: '#FFB020',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Rani Ammal',
      email: 'rani@gmail.com',
      phone: '0724715869',
      group: 'Small Business',
      joinedDate: '2026-02-01',
      score: 45,
      scoreLabel: 'Poor',
      scoreColor: '#DC3545',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Mohamed Ali',
      email: 'ali@gmail.com',
      phone: '0719876543',
      group: 'Community Farmers',
      joinedDate: '2026-01-20',
      score: 88,
      scoreLabel: 'Good',
      scoreColor: '#0D6EFD',
      status: 'Active'
    }
  ]);

  const handleAddMember = (newMember) => {
    const created = {
      id: Date.now(),
      name: newMember.fullName,
      email: newMember.email,
      phone: newMember.phone,
      group: "Village Women's",
      joinedDate: new Date().toISOString().split('T')[0],
      score: 100,
      scoreLabel: 'Excellent',
      scoreColor: '#188754',
      status: 'Active'
    };
    setMembers([created, ...members]);
  };

  const handleDeleteMember = (id, name) => {
    if (window.confirm(`Are you sure you want to remove member ${name}?`)) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleSaveMember = (updated) => {
    setMembers(members.map(m => m.id === updated.id ? updated : m));
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    const matchesGroup = groupFilter === 'All' || m.group === groupFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="members-page-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Members</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2"
        >
          <Icon name="user-plus" size={18} />
          <span>Invite Members</span>
        </button>
      </div>

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
              placeholder="Search by name..."
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
            <option value="Village Women's">Village Women's</option>
            <option value="Small Business">Small Business</option>
            <option value="Community Farmers">Community Farmers</option>
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
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="py-3 px-3 fw-semibold text-dark">{member.name}</td>
                  <td className="py-3 px-3 text-muted small">{member.email}</td>
                  <td className="py-3 px-3 text-muted small">{member.phone}</td>
                  <td className="py-3 px-3 text-dark small">{member.group}</td>
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
                        onClick={() => handleDeleteMember(member.id, member.name)}
                      >
                        <Icon name="trash" size={16} color="#DC3545" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteMemberModal
        show={showInviteModal}
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
