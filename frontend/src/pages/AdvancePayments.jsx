import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';

const AdvancePayments = () => {
  const { user } = useAuth();
  const [advancePayments, setAdvancePayments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    groupId: '',
    memberId: user.userId,
    amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupApi.getUserGroups(user.userId);
      setGroups(groupRes.data || []);

      const advRes = await api.get(`/advance-payments/user/${user.userId}`);
      setAdvancePayments(advRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching advance payments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/advance-payments?groupId=${formData.groupId}&memberId=${user.userId}&amount=${formData.amount}&notes=${encodeURIComponent(formData.notes || '')}`);
      setShowModal(false);
      setFormData({ groupId: '', memberId: user.userId, amount: '', notes: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit advance payment.');
    }
  };

  const totalAdvance = advancePayments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">⚡ Advance Contributions</h2>
          <p className="text-muted mb-0">Record and track advance installment payments before cycle due dates</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
          ➕ Record Advance Payment
        </button>
      </div>

      {/* Summary Card */}
      <div className="card shadow-sm border-0 mb-4 bg-gradient text-white p-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="text-white-50 text-uppercase fw-bold small">Total Advance Deposited</span>
            <h2 className="display-6 fw-bold mb-0 mt-1">LKR {totalAdvance.toLocaleString()}</h2>
          </div>
          <div style={{ fontSize: '2.5rem' }}>💰</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading advance payment records...</p>
        </div>
      ) : advancePayments.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>⚡</div>
          <h5 className="fw-bold mt-3">No Advance Payments Recorded</h5>
          <p className="text-muted">You have no recorded advance payment contributions for your groups.</p>
          <div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Record Advance Payment
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            📋 Advance Contribution History ({advancePayments.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Record ID</th>
                  <th>Group</th>
                  <th>Advance Amount</th>
                  <th>Notes</th>
                  <th>Recorded Date</th>
                </tr>
              </thead>
              <tbody>
                {advancePayments.map((adv) => (
                  <tr key={adv.id}>
                    <td className="fw-bold">#{adv.id}</td>
                    <td>Group #{adv.groupId || adv.seettuGroup?.id || 'N/A'}</td>
                    <td><strong className="text-success fs-6">LKR {(adv.amount || 0).toLocaleString()}</strong></td>
                    <td className="text-muted">{adv.notes || '-'}</td>
                    <td className="text-muted">{adv.createdAt ? new Date(adv.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Modal */}
      {showModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Advance Contribution</h5>
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
                    <label className="form-label">Advance Amount (LKR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 5000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes / Reference</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Paid 2 months ahead"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Advance Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePayments;
