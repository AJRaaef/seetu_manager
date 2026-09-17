import React, { useState } from 'react';
import Icon from '../components/Icons';

const Disputes = () => {
  const [selectedGroup, setSelectedGroup] = useState("Village Women's Seettu");
  const [disputeType, setDisputeType] = useState('Payment');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  const [disputes, setDisputes] = useState([
    {
      id: 'DIS-001',
      date: '2026-03-10',
      group: "Village Women's",
      filedBy: 'Suresh',
      type: 'Payment',
      description: 'Claimed paid but not recorded',
      status: 'Open'
    },
    {
      id: 'DIS-002',
      date: '2026-03-12',
      group: 'Small Business',
      filedBy: 'Rani',
      type: 'Payout',
      description: 'Did not receive payout on time',
      status: 'In Review'
    },
    {
      id: 'DIS-003',
      date: '2026-03-14',
      group: 'Community Farmers',
      filedBy: 'Nimal',
      type: 'Member',
      description: 'Member missed 2 payments',
      status: 'Resolved'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter dispute description.');
      return;
    }

    const newDispute = {
      id: `DIS-00${disputes.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      group: selectedGroup,
      filedBy: 'Current User',
      type: disputeType,
      description,
      status: 'Open'
    };

    setDisputes([newDispute, ...disputes]);
    setDescription('');
    setFileName('');
    alert('✓ Dispute submitted successfully! Organizer has been notified.');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="badge-peach">Open</span>;
      case 'In Review':
        return <span className="badge-in-review">In Review</span>;
      case 'Resolved':
      case 'Received':
        return <span className="badge-mint">Resolved</span>;
      default:
        return <span className="badge-peach">{status}</span>;
    }
  };

  return (
    <div className="disputes-page-container pb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>Dispute Management</h2>
        <span className="badge-peach px-3 py-2 fs-6 fw-semibold">
          {disputes.filter(d => d.status !== 'Resolved').length} Open Disputes
        </span>
      </div>

      {/* Existing Disputes Table Card */}
      <div className="table-card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th className="py-3 px-3 text-muted fw-semibold small">Dispute ID</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Date</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Group</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Filed By</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Type</th>
                <th className="py-3 px-3 text-muted fw-semibold small">Description</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">Status</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 px-3 fw-bold text-dark small">{d.id}</td>
                  <td className="py-3 px-3 text-muted small">{d.date}</td>
                  <td className="py-3 px-3 text-dark small">{d.group}</td>
                  <td className="py-3 px-3 text-muted small">{d.filedBy}</td>
                  <td className="py-3 px-3 text-muted small">{d.type}</td>
                  <td className="py-3 px-3 text-dark small">{d.description}</td>
                  <td className="py-3 px-3 text-center">{getStatusBadge(d.status)}</td>
                  <td className="py-3 px-3 text-end">
                    <button
                      className="btn btn-link text-success fw-semibold p-0 text-decoration-none small"
                      onClick={() => alert(`Reviewing dispute ${d.id}: ${d.description}`)}
                    >
                      {d.status === 'Resolved' ? 'View' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit New Dispute Card */}
      <div className="ui-card p-4 shadow-sm">
        <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.2rem' }}>Submit New Dispute</h4>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">Select Group</label>
              <select
                className="form-select bg-white"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="Village Women's Seettu">Village Women's Seettu</option>
                <option value="Small Business">Small Business</option>
                <option value="Community Farmers">Community Farmers</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">Dispute Type</label>
              <select
                className="form-select bg-white"
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value)}
              >
                <option value="Payment">Payment</option>
                <option value="Payout">Payout</option>
                <option value="Member">Member</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark fw-semibold small">Upload Evidence (Optional)</label>
            <div
              className="border border-dashed rounded-3 p-4 text-center"
              style={{ borderColor: '#CBD5E1', backgroundColor: '#FAFAFA', cursor: 'pointer' }}
              onClick={() => document.getElementById('evidenceFileInput').click()}
            >
              <div className="text-muted mb-2">
                <Icon name="upload" size={28} color="#94A3B8" />
              </div>
              <div className="fw-semibold text-dark small">
                {fileName ? fileName : 'Click to Upload or Drag and Drop'}
              </div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                PDF, PNG, JPG (max 5MB)
              </div>
              <input
                id="evidenceFileInput"
                type="file"
                className="d-none"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-teal w-100 py-2 fw-semibold">
            Submit Dispute
          </button>
        </form>
      </div>
    </div>
  );
};

export default Disputes;
