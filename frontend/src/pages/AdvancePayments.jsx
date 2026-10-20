import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';
import Icon from '../components/Icons';

const AdvancePayments = () => {
  const { user } = useAuth();
  const isAdminOrOrg = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const [advancePayments, setAdvancePayments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({ amount: '', notes: '' });

  const [formData, setFormData] = useState({
    groupId: '',
    memberId: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;

      const groupRes = isAdminOrOrg
        ? await groupApi.getAllGroups()
        : (uid ? await groupApi.getUserGroups(uid) : null);
      const gList = groupRes?.data || groupRes || [];
      setGroups(Array.isArray(gList) ? gList : []);

      const advRes = isAdminOrOrg
        ? await api.get('/advance-payments')
        : (uid ? await api.get(`/advance-payments/user/${uid}`) : null);
      const advList = advRes?.data?.data || advRes?.data || [];
      setAdvancePayments(Array.isArray(advList) ? advList : []);
    } catch (err) {
      console.error('Error fetching advance payments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = async (gId) => {
    setFormData((prev) => ({ ...prev, groupId: gId, memberId: '' }));
    if (!gId) {
      setMembers([]);
      return;
    }
    try {
      const res = await groupApi.getGroupMembers(gId);
      const mList = res?.data || res || [];
      setMembers(Array.isArray(mList) ? mList : []);
    } catch (err) {
      console.error('Failed to load group members', err);
      setMembers([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const uid = user?.userId || user?.id;
      const targetMemberId = formData.memberId || uid;

      const params = new URLSearchParams({
        amount: formData.amount,
        notes: formData.notes || ''
      });
      if (targetMemberId) params.append('memberId', targetMemberId);
      if (formData.groupId) params.append('groupId', formData.groupId);

      await api.post(`/advance-payments?${params.toString()}`);
      alert('Advance payment recorded successfully!');
      setShowModal(false);
      setFormData({ groupId: '', memberId: '', amount: '', notes: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit advance payment.');
    }
  };

  const handleOpenEdit = (adv) => {
    setEditRecord(adv);
    setEditFormData({
      amount: adv.amount || '',
      notes: adv.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editRecord) return;
    try {
      const params = new URLSearchParams({
        amount: editFormData.amount,
        notes: editFormData.notes || ''
      });
      await api.put(`/advance-payments/${editRecord.id}?${params.toString()}`);
      alert('Advance payment updated successfully!');
      setEditRecord(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update advance payment.');
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (!window.confirm(`Are you sure you want to delete advance payment record #ADV-${id}?`)) {
      return;
    }
    try {
      await api.delete(`/advance-payments/${id}`);
      alert(`Advance payment #ADV-${id} deleted successfully!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete advance payment.');
    }
  };

  const totalAdvance = advancePayments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="advance" size={24} color="#235665" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Advance Contributions</h2>
          </div>
          <p className="text-muted mb-0">Record and track advance installment payments before cycle due dates</p>
        </div>
        {isAdminOrOrg && (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2" 
            onClick={() => setShowModal(true)}
          >
            <span>+</span> Record Advance Payment
          </button>
        )}
      </div>

      {/* Summary Card matching brand teal palette */}
      <div 
        className="card shadow-sm border-0 mb-4 p-4 text-white" 
        style={{ backgroundColor: '#134A5A', borderRadius: '12px' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="text-white-50 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              Total Advance Deposited
            </span>
            <h2 className="display-6 fw-bold mb-0 mt-1">LKR {totalAdvance.toLocaleString()}</h2>
          </div>
          <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}>
            <Icon name="payments" size={32} color="#FFFFFF" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#235665' }} role="status"></div>
          <p className="mt-2 text-muted">Loading advance payment records...</p>
        </div>
      ) : advancePayments.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
            <Icon name="advance" size={36} color="#235665" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>No Advance Payments Recorded</h5>
          <p className="text-muted small mb-4">You have no recorded advance payment contributions for your groups.</p>
          {isAdminOrOrg && (
            <div>
              <button className="btn btn-teal px-4 py-2" onClick={() => setShowModal(true)}>
                Record Advance Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="ui-card shadow-sm border-0 overflow-hidden">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            Advance Contribution History ({advancePayments.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#DCE7EB' }}>
                <tr>
                  <th>Record ID</th>
                  <th>Member</th>
                  <th>Advance Amount</th>
                  <th>Notes</th>
                  <th>Recorded Date</th>
                  {isAdminOrOrg && <th className="text-end pe-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {advancePayments.map((adv) => (
                  <tr key={adv.id}>
                    <td className="fw-bold">#ADV-{adv.id}</td>
                    <td>{adv.member?.fullName || adv.member?.email || 'Member'}</td>
                    <td><strong className="text-success fs-6">LKR {(Number(adv.amount) || 0).toLocaleString()}</strong></td>
                    <td className="text-muted">{adv.notes || '-'}</td>
                    <td className="text-muted">{adv.paymentDate || (adv.createdAt ? new Date(adv.createdAt).toLocaleDateString() : '-')}</td>
                    {isAdminOrOrg && (
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#188754' }}
                            title="Edit Advance Payment"
                            onClick={() => handleOpenEdit(adv)}
                          >
                            <Icon name="pencil" size={16} color="#188754" />
                          </button>
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title="Delete Advance Payment"
                            onClick={() => handleDeleteAdvance(adv.id)}
                          >
                            <Icon name="trash" size={16} color="#DC3545" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Modal (Admin/Organizer only) */}
      {showModal && isAdminOrOrg && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">Record Advance Contribution</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Select Group</label>
                    <select
                      className="form-select"
                      value={formData.groupId}
                      onChange={(e) => handleGroupChange(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    >
                      <option value="">-- Select Group --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Member Selection - Always Visible */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Select Member</label>
                    <select
                      className="form-select"
                      value={formData.memberId}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      disabled={!formData.groupId}
                      required
                    >
                      <option value="">{formData.groupId ? '-- Select Member --' : '-- Choose Group First --'}</option>
                      {isAdminOrOrg && user && (
                        <option value={user?.userId || user?.id}>
                          {user.fullName || user.email || 'Organizer'} (Organizer / Me)
                        </option>
                      )}
                      {members
                        .filter(m => String(m.user?.id || m.userId || m.id) !== String(user?.userId || user?.id))
                        .map((m) => {
                          const mId = m.user?.id || m.userId || m.id;
                          const mName = m.user?.fullName || m.fullName || m.name || `Member #${mId}`;
                          return <option key={mId} value={mId}>{mName}</option>;
                        })}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Advance Amount (LKR)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 5000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Notes / Reference</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Paid 2 months ahead"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>Save Advance Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Admin/Organizer only) */}
      {editRecord && isAdminOrOrg && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">Edit Advance Contribution #ADV-{editRecord.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Member</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={editRecord.member?.fullName || editRecord.member?.email || `Member #${editRecord.member?.id || ''}`}
                      disabled
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Advance Amount (LKR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Notes / Reference</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setEditRecord(null)}>Cancel</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>Update Payment</button>
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
