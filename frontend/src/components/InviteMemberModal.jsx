import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';
import { getAllGroups } from '../api/groupApi';

const InviteMemberModal = ({ show, onHide, onAddMember, groups = [] }) => {
  const [groupId, setGroupId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [activeGroups, setActiveGroups] = useState(Array.isArray(groups) ? groups : []);

  useEffect(() => {
    if (Array.isArray(groups) && groups.length > 0) {
      setActiveGroups(groups);
      if (!groupId || !groups.some(g => String(g.id) === String(groupId))) {
        setGroupId(groups[0].id);
      }
    } else if (show) {
      setLoadingGroups(true);
      getAllGroups()
        .then((res) => {
          const raw = res?.data ?? res;
          const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          setActiveGroups(list);
          if (list.length > 0) {
            setGroupId(list[0].id);
          }
        })
        .catch((err) => console.error('Failed to load groups for InviteMemberModal', err))
        .finally(() => setLoadingGroups(false));
    }
  }, [show, groups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) {
      alert('Please select a group.');
      return;
    }
    setLoading(true);
    try {
      if (onAddMember) {
        await onAddMember({ groupId, fullName, email, phone });
      }
      setFullName('');
      setEmail('');
      setPhone('');
      onHide();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = activeGroups.find(g => String(g.id) === String(groupId));

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <h5 className="fw-bold mb-0 text-dark">Invite New Member</h5>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="custom-modal-body">
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Select Seettu Group <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              disabled={loadingGroups}
            >
              {loadingGroups ? (
                <option value="">Loading Seettu groups...</option>
              ) : activeGroups.length === 0 ? (
                <option value="">No Seettu groups available</option>
              ) : (
                <>
                  <option value="">-- Choose Seettu Group --</option>
                  {activeGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (LKR {Number(g.contributionAmount || 0).toLocaleString()} • {g.cycleFrequency || 'Monthly'})
                    </option>
                  ))}
                </>
              )}
            </select>
            {selectedGroup && (
              <small className="text-muted d-block mt-1">
                Selected Group: <strong>{selectedGroup.name}</strong> • Contribution: LKR {Number(selectedGroup.contributionAmount || 0).toLocaleString()}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Sunil Shantha"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. sunil@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-dark fw-semibold small">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="e.g. 0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="custom-modal-footer">
          <button type="button" className="btn btn-link text-muted text-decoration-none px-4" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-teal px-4" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
