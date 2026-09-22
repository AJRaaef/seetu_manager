import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';

const InviteMemberModal = ({ show, onHide, onAddMember, groups = [] }) => {
  const [groupId, setGroupId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (groups && groups.length > 0 && !groupId) {
      setGroupId(groups[0].id);
    }
  }, [groups]);

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
            <label className="form-label text-dark fw-semibold small">Select Seettu Group</label>
            <select
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (LKR {Number(g.contributionAmount || 0).toLocaleString()})
                </option>
              ))}
            </select>
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
