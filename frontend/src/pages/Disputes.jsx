import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as disputeApi from '../api/disputeApi';
import * as groupApi from '../api/groupApi';

const Disputes = () => {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    description: '',
    disputeType: 'PAYMENT_ISSUE',
  });

  const [resolveModal, setResolveModal] = useState({ show: false, dispute: null, status: 'RESOLVED', notes: '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userGroups = await groupApi.getUserGroups(user.userId);
      setGroups(userGroups.data || []);

      const disputeRes = await disputeApi.getDisputesByUser(user.userId);
      setDisputes(disputeRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load disputes data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await disputeApi.createDispute(formData, user.userId);
      setShowModal(false);
      setFormData({ groupId: '', title: '', description: '', disputeType: 'PAYMENT_ISSUE' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit dispute.');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await disputeApi.updateDisputeStatus(
        resolveModal.dispute.id,
        resolveModal.status,
        resolveModal.notes,
        user.userId
      );
      setResolveModal({ show: false, dispute: null, status: 'RESOLVED', notes: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dispute status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-warning text-dark';
      case 'IN_REVIEW': return 'bg-info text-dark';
      case 'RESOLVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">⚖️ Dispute Resolution System</h2>
          <p className="text-muted mb-0">File, track, and resolve member disputes or payout issues transparently</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
          ➕ Raise New Dispute
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading dispute records...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>⚖️</div>
          <h5 className="fw-bold mt-3">No Disputes Recorded</h5>
          <p className="text-muted">You currently have no open or resolved dispute records.</p>
          <div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Raise New Dispute
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            📋 Active & Historical Disputes ({disputes.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Dispute ID</th>
                  <th>Group</th>
                  <th>Issue Title & Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date Filed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-bold">#{d.id}</td>
                    <td>Group #{d.groupId || d.seettuGroup?.id || 'N/A'}</td>
                    <td>
                      <div className="fw-bold text-dark">{d.title}</div>
                      <div className="small text-muted">{d.description}</div>
                    </td>
                    <td><span className="badge bg-secondary-subtle text-dark border">{d.disputeType}</span></td>
                    <td><span className={`badge ${getStatusBadge(d.status)}`}>{d.status}</span></td>
                    <td className="text-muted">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      {(isAdmin || isOrganizer) && d.status !== 'RESOLVED' && (
                        <button
                          className="btn btn-sm btn-outline-success fw-bold"
                          onClick={() => setResolveModal({ show: true, dispute: d, status: 'RESOLVED', notes: '' })}
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Dispute Modal */}
      {showModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Raise New Dispute</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Group</label>
                    <select
                      className="form-select"
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Seettu Group --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dispute Type</label>
                    <select
                      className="form-select"
                      value={formData.disputeType}
                      onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
                    >
                      <option value="PAYMENT_ISSUE">Payment Issue</option>
                      <option value="PAYOUT_DELAY">Payout Delay</option>
                      <option value="MEMBER_CONDUCT">Member Conduct</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Brief summary of the issue"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Provide complete details..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Dispute</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {resolveModal.show && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success-subtle">
                <h5 className="modal-title fw-bold text-dark">Update Dispute #{resolveModal.dispute?.id}</h5>
                <button type="button" className="btn-close" onClick={() => setResolveModal({ show: false, dispute: null, status: 'RESOLVED', notes: '' })}></button>
              </div>
              <form onSubmit={handleResolveSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={resolveModal.status}
                      onChange={(e) => setResolveModal({ ...resolveModal, status: e.target.value })}
                    >
                      <option value="IN_REVIEW">In Review</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Resolution Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={resolveModal.notes}
                      onChange={(e) => setResolveModal({ ...resolveModal, notes: e.target.value })}
                      placeholder="Explain resolution decision..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setResolveModal({ show: false, dispute: null, status: 'RESOLVED', notes: '' })}>Cancel</button>
                  <button type="submit" className="btn btn-success fw-bold">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disputes;
