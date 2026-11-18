import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';
import Icon from '../components/Icons';

const AdvancePayments = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
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
    paymentMethod: 'Bank Transfer',
    bankName: '',
    referenceNumber: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const loadGroupMembers = async (gId) => {
    if (!gId) {
      setMembers([]);
      return;
    }
    try {
      const res = await groupApi.getGroupMembers(gId);
      const mList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setMembers(mList);
    } catch (err) {
      console.error('Failed to load group members', err);
      setMembers([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;

      const groupRes = isAdminOrOrg
        ? await groupApi.getAllGroups()
        : (uid ? await groupApi.getUserGroups(uid) : null);
      const gList = groupRes?.data || groupRes || [];
      const validGroups = Array.isArray(gList) ? gList : [];
      setGroups(validGroups);

      if (validGroups.length > 0) {
        const defaultGroupId = String(validGroups[0].id);
        setFormData(prev => ({
          ...prev,
          groupId: prev.groupId || defaultGroupId,
          memberId: prev.memberId || (uid ? String(uid) : '')
        }));
        loadGroupMembers(defaultGroupId);
      }

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
    setFormData((prev) => ({ ...prev, groupId: gId }));
    await loadGroupMembers(gId);
  };

  const handleOpenModal = () => {
    const activeGroupId = formData.groupId || (groups.length > 0 ? String(groups[0].id) : '');
    const uid = user ? String(user.userId || user.id) : '';
    setFormData({
      groupId: activeGroupId,
      memberId: isAdminOrOrg ? (formData.memberId || '') : uid,
      amount: '',
      notes: '',
      paymentMethod: 'Bank Transfer',
      bankName: '',
      referenceNumber: ''
    });
    if (activeGroupId) {
      loadGroupMembers(activeGroupId);
    }
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const uid = user?.userId || user?.id;
      const targetMemberId = isAdminOrOrg ? (formData.memberId || uid) : uid;

      let finalNotes = (formData.notes || '').trim();
      const isBankTransfer = formData.paymentMethod === 'Bank Transfer' || !isAdminOrOrg;
      
      if (isBankTransfer) {
        const details = [];
        if (formData.bankName) details.push(`${t('advance_page.bank_label')}: ${formData.bankName}`);
        if (formData.referenceNumber) details.push(`${t('advance_page.reference_label')}: ${formData.referenceNumber}`);
        if (finalNotes) details.push(finalNotes);
        finalNotes = `[Bank Transfer] ${details.join(' | ')}`;
      }

      const params = new URLSearchParams({
        amount: formData.amount,
        notes: finalNotes,
        paymentMethod: isBankTransfer ? 'Bank Transfer' : 'Cash'
      });
      if (targetMemberId) params.append('memberId', targetMemberId);
      if (formData.groupId) params.append('groupId', formData.groupId);

      await api.post(`/advance-payments?${params.toString()}`);
      alert(isAdminOrOrg ? t('advance_page.record_success') : t('advance_page.submit_success'));
      setShowModal(false);
      setFormData({ 
        groupId: '', 
        memberId: '', 
        amount: '', 
        notes: '',
        paymentMethod: 'Bank Transfer',
        bankName: '',
        referenceNumber: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('advance_page.submit_failed'));
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
      alert(t('advance_page.update_success'));
      setEditRecord(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('advance_page.update_failed'));
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (!window.confirm(t('advance_page.delete_confirm', { id }))) {
      return;
    }
    try {
      await api.delete(`/advance-payments/${id}`);
      alert(t('advance_page.delete_success', { id }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || t('advance_page.delete_failed'));
    }
  };

  const totalAdvance = advancePayments.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="advance" size={24} color="#235665" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('advance_page.title', 'Advance Payments')}</h2>
          </div>
          <p className="text-muted mb-0">
            {isAdmin || isOrganizer
              ? t('advance_page.subtitle_org', 'Record and manage member advance contributions and early settlements')
              : t('advance_page.subtitle_member', 'View your verified advance contributions and track early cycle settlements')}
          </p>
        </div>
        {isAdmin ? (
          <span className="badge bg-light text-secondary border px-3 py-2 small fw-semibold d-inline-flex align-items-center gap-1.5">
            <Icon name="shield" size={15} />
            <span>{t('advance_page.platform_oversight')}</span>
          </span>
        ) : isOrganizer ? (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm fw-semibold" 
            onClick={handleOpenModal}
          >
            <Icon name="plus" size={16} />
            <span>{t('advance_page.apply_btn', 'Record Advance Payment')}</span>
          </button>
        ) : (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm fw-semibold" 
            onClick={handleOpenModal}
          >
            <Icon name="plus" size={16} />
            <span>{t('advance_page.member_submit_btn')}</span>
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
              {isAdmin || isOrganizer
                ? t('advance_page.total_collected', 'Total Advance Collected')
                : t('advance_page.total_contributed', 'Total Advance Contributed')}
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
          <p className="mt-2 text-muted">{t('advance_page.loading')}</p>
        </div>
      ) : advancePayments.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
            <Icon name="advance" size={36} color="#235665" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>{t('advance_page.no_records_title')}</h5>
          <p className="text-muted small mb-0">{t('advance_page.no_records_text')}</p>
        </div>
      ) : (
        <div className="ui-card shadow-sm border-0 overflow-hidden">
          <div className="card-header bg-white border-bottom fw-bold text-dark py-3">
            {t('advance_page.title', 'Advance Payments')} ({advancePayments.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#DCE7EB' }}>
                <tr>
                  <th>{t('advance_page.col_id')}</th>
                  <th>{t('common.member', 'Member')}</th>
                  <th>{t('advance_page.col_amount', 'Amount')}</th>
                  <th>{t('advance_page.col_method')}</th>
                  <th>{t('common.notes', 'Notes & Reference')}</th>
                  <th>{t('common.date', 'Date')}</th>
                  {isAdminOrOrg && <th className="text-end pe-3">{t('common.actions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {advancePayments.map((adv) => {
                  const isBank = (adv.notes || '').includes('[Bank Transfer]');
                  return (
                  <tr key={adv.id}>
                    <td className="fw-bold">#ADV-{adv.id}</td>
                    <td>{adv.member?.fullName || adv.member?.email || t('advance_page.member')}</td>
                    <td><strong className="text-success fs-6">LKR {(Number(adv.amount) || 0).toLocaleString()}</strong></td>
                    <td>
                      {isBank ? (
                        <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                          <Icon name="bank" size={12} />
                          <span>{t('advance_page.bank_transfer')}</span>
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1 small fw-semibold d-inline-flex align-items-center gap-1">
                          <Icon name="wallet" size={12} />
                          <span>{t('advance_page.cash')}</span>
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {adv.notes ? adv.notes.replace('[Bank Transfer]', '').trim() || '-' : '-'}
                    </td>
                    <td className="text-muted">{adv.paymentDate || (adv.createdAt ? new Date(adv.createdAt).toLocaleDateString() : '-')}</td>
                    {isAdminOrOrg && (
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-2">
                          {isOrganizer && (
                            <button
                              className="btn btn-link p-1 text-decoration-none"
                              style={{ color: '#188754' }}
                              title={t('advance_page.edit_title')}
                              onClick={() => handleOpenEdit(adv)}
                            >
                              <Icon name="pencil" size={16} color="#188754" />
                            </button>
                          )}
                          <button
                            className="btn btn-link p-1 text-decoration-none"
                            style={{ color: '#DC3545' }}
                            title={t('advance_page.delete_title')}
                            onClick={() => handleDeleteAdvance(adv.id)}
                          >
                            <Icon name="trash" size={16} color="#DC3545" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Modal (Organizers & Members) */}
      {showModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">
                  {isAdminOrOrg ? t('advance_page.modal_record_title') : t('advance_page.modal_submit_title')}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">

                  {/* Member-Only Security Notice: Bank Transfer Only */}
                  {!isAdminOrOrg && (
                    <div className="alert alert-info py-2.5 px-3 small d-flex align-items-start gap-2 mb-3" style={{ borderRadius: '8px' }}>
                      <Icon name="bank" size={18} color="#0C5460" className="mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>{t('advance_page.bank_transfer_only')}</strong> {t('advance_page.bank_transfer_notice')}
                      </div>
                    </div>
                  )}

                  {/* Group Selection */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.select_group')}</label>
                    <select
                      className="form-select"
                      value={formData.groupId}
                      onChange={(e) => handleGroupChange(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    >
                      <option value="">{t('advance_page.select_group_placeholder')}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Member Selection (Organizer only) vs Member Identity Notice */}
                  {isOrganizer ? (
                    <div className="mb-3">
                      <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.select_member')}</label>
                      <select
                        className="form-select"
                        value={formData.memberId}
                        onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                        style={{ borderRadius: '8px' }}
                        required
                      >
                        <option value="">{t('advance_page.select_member_placeholder')}</option>
                        {user && (
                          <option value={String(user?.userId || user?.id)}>
                            {user.fullName || user.email || t('advance_page.organizer')} {t('advance_page.organizer_me')}
                          </option>
                        )}
                        {members
                          .filter(m => String(m.user?.id || m.userId || m.id) !== String(user?.userId || user?.id))
                          .map((m) => {
                            const mId = m.user?.id || m.userId || m.id;
                            const mName = m.user?.fullName || m.fullName || m.name || t('advance_page.member_number', { id: mId });
                            const mNic = m.user?.nicNumber ? ` (${m.user.nicNumber})` : '';
                            return (
                              <option key={mId} value={String(mId)}>
                                {mName}{mNic} - {t('advance_page.member_number', { id: mId })}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3 p-2.5 bg-light rounded border text-muted small">
                      {t('advance_page.contributing_member')} <strong className="text-dark">{user?.fullName || t('advance_page.member')}</strong> {user?.nicNumber && `(${user.nicNumber})`}
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.payment_method')}</label>
                    {!isAdminOrOrg ? (
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted border-end-0">
                          <Icon name="bank" size={16} />
                        </span>
                        <input 
                          type="text" 
                          className="form-control bg-light border-start-0 fw-semibold text-teal" 
                          value={t('advance_page.bank_transfer_field')}
                          disabled 
                          style={{ borderRadius: '0 8px 8px 0' }}
                        />
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="Bank Transfer">{t('advance_page.bank_transfer_option')}</option>
                        <option value="Cash">{t('advance_page.cash_option')}</option>
                      </select>
                    )}
                  </div>

                  {/* Bank Details (For Bank Transfer) */}
                  {(formData.paymentMethod === 'Bank Transfer' || !isAdminOrOrg) && (
                    <div className="row g-2 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.bank_name')}</label>
                        <select
                          className="form-select"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          style={{ borderRadius: '8px' }}
                          required={!isAdminOrOrg}
                        >
                          <option value=""> {t('advance_page.select_bank_placeholder')} </option>
                          <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                          <option value="Commercial Bank">Commercial Bank</option>
                          <option value="People's Bank">People's Bank</option>
                          <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                          <option value="Sampath Bank">Sampath Bank</option>
                          <option value="Seylan Bank">Seylan Bank</option>
                          <option value="Nations Trust Bank (NTB)">Nations Trust Bank (NTB)</option>
                          <option value="DFCC Bank">DFCC Bank</option>
                          <option value="National Savings Bank (NSB)">National Savings Bank (NSB)</option>
                          <option value="Other Bank / Online App">{t('advance_page.other_bank')}</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.transaction_ref')}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t('advance_page.transaction_placeholder')}
                          value={formData.referenceNumber}
                          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                          style={{ borderRadius: '8px' }}
                          required={!isAdminOrOrg}
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.modal_amount_label')}</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={t('advance_page.amount_placeholder')}
                      min="100"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.additional_notes')}</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder={t('advance_page.notes_placeholder')}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>{t('advance_page.cancel')}</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>
                    {isAdminOrOrg ? t('advance_page.save_payment') : t('advance_page.submit_bank_transfer')}
                  </button>
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
                <h5 className="modal-title fw-bold">{t('advance_page.edit_modal_title', { id: editRecord.id })}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.member')}</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={editRecord.member?.fullName || editRecord.member?.email || t('advance_page.member_number', { id: editRecord.member?.id || '' })}
                      disabled
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.modal_amount_label')}</label>
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
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('advance_page.notes_reference')}</label>
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
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setEditRecord(null)}>{t('advance_page.cancel')}</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>{t('advance_page.update_payment')}</button>
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
