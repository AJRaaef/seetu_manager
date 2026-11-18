import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';
import Icon from '../components/Icons';

const EmergencyRequests = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
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
      const uid = user?.userId || user?.id;
      const groupRes = await groupApi.getUserGroups(uid);
      setGroups(groupRes.data || []);

      const reqRes = (isAdmin || isOrganizer)
        ? await api.get('/emergency')
        : await api.get(`/emergency/user/${uid}`);

      const list = reqRes.data?.data || reqRes.data || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching emergency requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isAdmin) {
      alert(t('emergency_page.admin_submit_error'));
      return;
    }
    try {
      const uid = user?.userId || user?.id;
      const payload = {
        groupId: Number(formData.groupId),
        reason: formData.reason,
        requestedAmount: Number(formData.requestedAmount),
      };
      await api.post(`/emergency?raisedById=${uid}`, payload);
      setShowModal(false);
      setFormData({ groupId: '', reason: '', requestedAmount: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('emergency_page.submit_failed'));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const uid = user?.userId || user?.id;
      await api.put(`/emergency/${id}/status?status=${status}&resolvedById=${uid}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('emergency_page.status_update_failed'));
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="emergency" size={24} color="#DC3545" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('emergency_page.title')}</h2>
          </div>
          <p className="text-muted mb-0">
            {isAdmin 
              ? t('emergency_page.admin_subtitle')
              : t('emergency_page.member_subtitle')}
          </p>
        </div>

      </div>

      {isAdmin && (
        <div className="alert alert-info border-0 shadow-sm d-flex align-items-center gap-3 mb-4" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
          <Icon name="shield" size={24} />
          <div>
            <strong>{t('emergency_page.admin_notice_title')}</strong> {t('emergency_page.admin_notice_text')}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#235665' }} role="status"></div>
          <p className="mt-2 text-muted">{t('emergency_page.loading')}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#FEE2E2' }}>
            <Icon name="emergency" size={36} color="#DC3545" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>{t('emergency_page.no_requests_title')}</h5>
          <p className="text-muted small mb-4">
            {isAdmin 
              ? t('emergency_page.admin_no_req')
              : t('emergency_page.member_no_req')}
          </p>
          {!isAdmin && (
            <div>
              <button className="btn btn-teal px-4 py-2" onClick={() => setShowModal(true)}>
                {t('emergency_page.submit_btn')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="ui-card shadow-sm border-0 overflow-hidden">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            {t('emergency_page.table_title', { count: requests.length })}
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#DCE7EB' }}>
                <tr>
                  <th>{t('emergency_page.col_id')}</th>
                  {(isAdmin || isOrganizer) && <th>{t('emergency_page.col_raised_by')}</th>}
                  <th>{t('emergency_page.col_group')}</th>
                  <th>{t('emergency_page.col_amount')}</th>
                  <th>{t('emergency_page.col_reason')}</th>
                  <th>{t('emergency_page.col_status')}</th>
                  <th>{t('emergency_page.col_date')}</th>
                  {(isAdmin || isOrganizer) && <th className="text-end">{t('emergency_page.col_actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold">#{r.id}</td>
                    {(isAdmin || isOrganizer) && (
                      <td>
                        <span className="fw-semibold text-dark">{r.raisedBy?.fullName || r.raisedBy?.email || t('emergency_page.member')}</span>
                      </td>
                    )}
                    <td>{r.group?.name || t('emergency_page.group_number', { number: r.groupId || r.seettuGroup?.id || t('emergency_page.not_available') })}</td>
                    <td><strong className="text-danger fs-6">LKR {(r.requestedAmount || 0).toLocaleString()}</strong></td>
                    <td className="text-dark">{r.reason}</td>
                    <td>
                      <span className={`badge ${r.status === 'APPROVED' ? 'bg-success' : r.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {r.status === 'PENDING' ? t('emergency_page.awaiting_organizer_approval') : t(`emergency_page.status_${(r.status || 'PENDING').toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : t('emergency_page.not_available')}</td>
                    {(isAdmin || isOrganizer) && (
                      <td className="text-end">
                        {r.status === 'PENDING' ? (
                          isOrganizer ? (
                            <div className="d-inline-flex gap-1">
                              <button
                                className="btn btn-sm btn-success px-2 py-1 fs-7"
                                onClick={() => handleStatusUpdate(r.id, 'APPROVED')}
                              >
                                {t('emergency_page.approve')}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger px-2 py-1 fs-7"
                                onClick={() => handleStatusUpdate(r.id, 'REJECTED')}
                              >
                                {t('emergency_page.reject')}
                              </button>
                            </div>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
                              {t('emergency_page.supervisory_oversight')}
                            </span>
                          )
                        ) : (
                          <span className="text-muted small">{r.status === 'APPROVED' ? t('emergency_page.approved') : t('emergency_page.rejected')}</span>
                        )}
                      </td>
                    )}
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">{t('emergency_page.modal_title')}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('emergency_page.select_group')}</label>
                    <select
                      className="form-select"
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    >
                      <option value="">{t('emergency_page.select_group_placeholder')}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('emergency_page.modal_amount_label')}</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={t('emergency_page.amount_placeholder')}
                      value={formData.requestedAmount}
                      onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('emergency_page.modal_reason_label')}</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder={t('emergency_page.reason_placeholder')}
                      style={{ borderRadius: '8px' }}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>{t('emergency_page.cancel')}</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>{t('emergency_page.modal_submit')}</button>
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
