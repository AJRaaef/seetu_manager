import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';

const EmergencyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    groupId: '',
    reason: '',
    requestedAmount: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupApi.getUserGroups(user.userId);
      setGroups(groupRes.data || []);

      const reqRes = await api.get(`/emergency-requests/user/${user.userId}`);
      setRequests(reqRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching emergency requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/emergency-requests?groupId=${formData.groupId}&memberId=${user.userId}&requestedAmount=${formData.requestedAmount}&reason=${encodeURIComponent(formData.reason)}`);
      setShowModal(false);
      setFormData({ groupId: '', reason: '', requestedAmount: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit emergency request.');
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">🚨 Emergency Payout Requests</h2>
          <p className="text-muted mb-0">Apply for prioritized early payout in case of financial or medical emergencies</p>
        </div>
        <button className="btn btn-warning shadow-sm fw-bold text-dark" onClick={() => setShowModal(true)}>
          ➕ Submit Emergency Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2 text-muted">Loading emergency requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>🚨</div>
          <h5 className="fw-bold mt-3">No Emergency Requests</h5>
          <p className="text-muted">You have no active or previous emergency payout requests.</p>
          <div>
            <button className="btn btn-warning fw-bold text-dark" onClick={() => setShowModal(true)}>
              Submit Emergency Request
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            📋 Submitted Emergency Payout Applications ({requests.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Request ID</th>
                  <th>Group</th>
                  <th>Requested Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold">#{r.id}</td>
                    <td>Group #{r.groupId || r.seettuGroup?.id || 'N/A'}</td>
                    <td><strong className="text-danger fs-6">LKR {(r.requestedAmount || 0).toLocaleString()}</strong></td>
                    <td className="text-dark">{r.reason}</td>
                    <td>
                      <span className={`badge ${r.status === 'APPROVED' ? 'bg-success' : r.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {r.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning-subtle">
                <h5 className="modal-title fw-bold text-dark">Request Emergency Early Payout</h5>
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
                      <option value="">-- Select Group --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Requested Amount (LKR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 50000"
                      value={formData.requestedAmount}
                      onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Emergency Reason</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Describe the medical or financial emergency..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-bold text-dark">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRequests;
