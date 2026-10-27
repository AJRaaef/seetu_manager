import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPendingOrganizerApplications, approveOrganizer, rejectOrganizer } from '../api/organizerApi';
import { getErrorMessage } from '../utils/errorHandler';
import Icon from '../components/Icons';

const BASE_URL = 'http://localhost:8081';

const AdminOrganizerRequests = () => {
  const { isAdmin } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ show: false, userId: null, userName: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Preview modal state
  const [previewImg, setPreviewImg] = useState({ show: false, src: '', title: '' });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingOrganizerApplications();
      setApplications(res?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load organizer applications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approve organizer application for "${userName}"?`)) return;
    setActionMsg('');
    setActionError('');
    try {
      await approveOrganizer(userId);
      setActionMsg(`✅ "${userName}" has been approved as an Organizer.`);
      fetchApplications();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to approve application.'));
    }
  };

  const openRejectModal = (userId, userName) => {
    setRejectModal({ show: true, userId, userName });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError('Please provide a rejection reason.');
      return;
    }
    setRejectLoading(true);
    setActionMsg('');
    setActionError('');
    try {
      await rejectOrganizer(rejectModal.userId, rejectReason.trim());
      setActionMsg(`❌ Application for "${rejectModal.userName}" has been rejected.`);
      setRejectModal({ show: false, userId: null, userName: '' });
      setRejectReason('');
      fetchApplications();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to reject application.'));
    } finally {
      setRejectLoading(false);
    }
  };

  const openPreview = (src, title) => {
    if (!src) return;
    setPreviewImg({ show: true, src: src.startsWith('http') ? src : `${BASE_URL}${src}`, title });
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-5 text-muted">
        <Icon name="shield" size={40} color="#CBD5E1" className="mb-3" />
        <div className="fw-semibold">Access Denied — Administrators only.</div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0F2F3D' }}>
            📋 Organizer Applications
          </h2>
          <p className="text-muted mb-0 small">
            Review, approve, or reject pending organizer upgrade requests.
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          onClick={fetchApplications}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" />
          ) : (
            <Icon name="refresh" size={14} />
          )}
          Refresh
        </button>
      </div>

      {/* Action messages */}
      {actionMsg && (
        <div className="alert alert-success alert-dismissible d-flex align-items-center gap-2 mb-3 py-2 small">
          {actionMsg}
          <button className="btn-close ms-auto" onClick={() => setActionMsg('')} />
        </div>
      )}
      {actionError && (
        <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2 mb-3 py-2 small">
          <Icon name="alert-circle" size={16} />
          {actionError}
          <button className="btn-close ms-auto" onClick={() => setActionError('')} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ color: '#0097B2' }} role="status" />
          <p className="mt-2 text-muted small">Loading applications…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger">
          <Icon name="alert-circle" size={16} className="me-2" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && applications.length === 0 && (
        <div className="ui-card p-5 text-center text-muted">
          <Icon name="users" size={40} color="#CBD5E1" className="mb-3 d-block mx-auto" />
          <div className="fw-semibold text-dark mb-1">No Pending Applications</div>
          <div className="small">There are no organizer applications awaiting review at this time.</div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && applications.length > 0 && (
        <div className="ui-card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.87rem' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <tr>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>Applicant</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>Contact</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>District</th>
                  <th className="py-3 px-3 text-center" style={{ color: '#475569', fontWeight: 600 }}>Members</th>
                  <th className="py-3 px-3 text-end" style={{ color: '#475569', fontWeight: 600 }}>Amount (LKR)</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>Experience</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>Notes</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>Documents</th>
                  <th className="py-3 px-3" style={{ color: '#475569', fontWeight: 600 }}>NIC</th>
                  <th className="py-3 px-3 text-center" style={{ color: '#475569', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.userId}>
                    {/* Applicant */}
                    <td className="py-3 px-3">
                      <div className="fw-semibold text-dark">{app.fullName}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{app.email}</div>
                      <span
                        className="badge mt-1"
                        style={{ background: '#D1FAE5', color: '#065F46', fontSize: '0.68rem' }}
                      >
                        {app.kycStatus}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3 text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {app.phone || '—'}
                    </td>

                    {/* District */}
                    <td className="py-3 px-3">
                      <span className="badge bg-light text-secondary border">{app.district || '—'}</span>
                    </td>

                    {/* Target Members */}
                    <td className="py-3 px-3 text-center fw-semibold" style={{ color: '#1E40AF' }}>
                      {app.targetMemberCount ?? '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-end fw-semibold" style={{ color: '#065F46' }}>
                      {app.plannedContributionAmount != null
                        ? app.plannedContributionAmount.toLocaleString()
                        : '—'}
                    </td>

                    {/* Experience */}
                    <td className="py-3 px-3">
                      <span
                        className="badge"
                        style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '0.76rem' }}
                      >
                        {app.experienceLevel || '—'}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3" style={{ maxWidth: '180px' }}>
                      <span
                        title={app.proposalNotes}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.8rem',
                          color: '#475569'
                        }}
                      >
                        {app.proposalNotes || <em className="text-muted">No notes</em>}
                      </span>
                    </td>

                    {/* Documents */}
                    <td className="py-3 px-3" style={{ whiteSpace: 'nowrap' }}>
                      <div className="d-flex flex-column gap-1">
                        {app.nicFrontImagePath && (
                          <button
                            className="btn btn-link btn-sm p-0 text-start text-primary d-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => openPreview(app.nicFrontImagePath, 'NIC Front')}
                          >
                            <Icon name="image" size={12} /> NIC Front
                          </button>
                        )}
                        {app.nicBackImagePath && (
                          <button
                            className="btn btn-link btn-sm p-0 text-start text-primary d-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => openPreview(app.nicBackImagePath, 'NIC Back')}
                          >
                            <Icon name="image" size={12} /> NIC Back
                          </button>
                        )}
                        {app.gnCertificateImagePath && (
                          <button
                            className="btn btn-link btn-sm p-0 text-start text-success d-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => openPreview(app.gnCertificateImagePath, 'GN Certificate')}
                          >
                            <Icon name="file-text" size={12} /> GN Cert
                          </button>
                        )}
                        {!app.nicFrontImagePath && !app.nicBackImagePath && !app.gnCertificateImagePath && (
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>—</span>
                        )}
                      </div>
                    </td>

                    {/* NIC Number */}
                    <td className="py-3 px-3">
                      <code style={{ fontSize: '0.8rem', color: '#374151' }}>{app.nicNumber || '—'}</code>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center" style={{ whiteSpace: 'nowrap' }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm fw-semibold d-flex align-items-center gap-1"
                          style={{ background: '#065F46', color: '#fff', fontSize: '0.8rem', borderRadius: '8px' }}
                          onClick={() => handleApprove(app.userId, app.fullName)}
                        >
                          <Icon name="check" size={13} color="#fff" />
                          Approve
                        </button>
                        <button
                          className="btn btn-sm fw-semibold d-flex align-items-center gap-1"
                          style={{ background: '#991B1B', color: '#fff', fontSize: '0.8rem', borderRadius: '8px' }}
                          onClick={() => openRejectModal(app.userId, app.fullName)}
                        >
                          <Icon name="x" size={13} color="#fff" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 border-top" style={{ background: '#F8FAFC', fontSize: '0.8rem', color: '#94A3B8' }}>
            Showing {applications.length} pending application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ─────────────────────────────── */}
      {rejectModal.show && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
                <div
                  className="modal-header border-0 px-4 py-3 text-white"
                  style={{ background: 'linear-gradient(135deg, #7F1D1D, #DC2626)' }}
                >
                  <h6 className="modal-title fw-bold mb-0">
                    ❌ Reject Application — {rejectModal.userName}
                  </h6>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setRejectModal({ show: false, userId: null, userName: '' })}
                    disabled={rejectLoading}
                  />
                </div>
                <div className="modal-body px-4 py-4">
                  <label className="form-label fw-semibold small mb-1">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide a clear reason for rejection that will be sent to the applicant…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={rejectLoading}
                    autoFocus
                  />
                  <div className="form-text mt-1" style={{ fontSize: '0.75rem' }}>
                    This reason will be included in the notification sent to the applicant.
                  </div>
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setRejectModal({ show: false, userId: null, userName: '' })}
                    disabled={rejectLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn fw-semibold px-4 d-inline-flex align-items-center gap-2"
                    style={{ background: '#DC2626', color: '#fff' }}
                    onClick={handleReject}
                    disabled={rejectLoading || !rejectReason.trim()}
                  >
                    {rejectLoading ? (
                      <><span className="spinner-border spinner-border-sm" /> Rejecting…</>
                    ) : (
                      <><Icon name="x" size={14} color="#fff" /> Confirm Rejection</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Document Preview Modal ──────────────────────────── */}
      {previewImg.show && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1060 }}
            onClick={() => setPreviewImg({ show: false, src: '', title: '' })}
          />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1070 }} aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div
                  className="modal-header border-0 px-4 py-3 text-white"
                  style={{ background: '#0F2F3D' }}
                >
                  <h6 className="modal-title fw-bold mb-0">{previewImg.title}</h6>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setPreviewImg({ show: false, src: '', title: '' })}
                  />
                </div>
                <div className="modal-body p-3 text-center bg-dark" style={{ maxHeight: '75vh', overflow: 'auto' }}>
                  <img
                    src={previewImg.src}
                    alt={previewImg.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: '65vh', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.alt = 'Image could not be loaded'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrganizerRequests;
