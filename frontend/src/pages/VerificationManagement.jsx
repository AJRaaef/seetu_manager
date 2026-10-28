import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from '../api/verificationApi';
import VerificationStatusBadge from '../components/VerificationStatusBadge';
import DocumentPreview from '../components/DocumentPreview';
import { Shield, Clock, CheckCircle2, XCircle, Folder, AlertTriangle, Search, ClipboardList, Eye, Check, X, FileText } from 'lucide-react';
import { getErrorMessage } from '../utils/errorHandler';

const VerificationManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected verification for inspection / review modal
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionTargetId, setRejectionTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Full image/PDF preview modal
  const [previewDoc, setPreviewDoc] = useState({ show: false, title: '', fileUrl: '' });

  const reviewerId = user?.userId || user?.id;

  const loadVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingVerifications(filterStatus, searchTerm);
      const data = res?.data || res || [];
      setVerifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load verifications', err);
      setError('Could not load member verification records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadVerifications();
  };

  const handleApprove = async (verificationId) => {
    if (!window.confirm('Are you sure you want to approve this member verification? Once approved, the member can participate in Seettu groups.')) {
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await approveVerification(verificationId, reviewerId);
      setSuccess('Member verification approved successfully!');
      if (selectedVerification && selectedVerification.id === verificationId) {
        setSelectedVerification(prev => ({ ...prev, verificationStatus: 'VERIFIED' }));
      }
      await loadVerifications();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to approve verification.'));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (verificationId) => {
    setRejectionTargetId(verificationId);
    setRejectionReason('');
    setRejectError('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Please specify the reason for rejecting this verification.');
      return;
    }

    setActionLoading(true);
    setRejectError('');
    try {
      await rejectVerification(rejectionTargetId, rejectionReason.trim(), reviewerId);
      setShowRejectModal(false);
      setSuccess('Member verification rejected. Member notified of required corrections.');
      if (selectedVerification && selectedVerification.id === rejectionTargetId) {
        setSelectedVerification(prev => ({
          ...prev,
          verificationStatus: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        }));
      }
      await loadVerifications();
    } catch (err) {
      setRejectError(getErrorMessage(err, 'Failed to reject verification.'));
    } finally {
      setActionLoading(false);
    }
  };

  const openPreview = (title, fileUrl) => {
    setPreviewDoc({ show: true, title, fileUrl });
  };

  // Stats
  const pendingCount = verifications.filter(v => v.verificationStatus === 'PENDING').length;
  const verifiedCount = verifications.filter(v => v.verificationStatus === 'VERIFIED').length;
  const rejectedCount = verifications.filter(v => v.verificationStatus === 'REJECTED').length;

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Shield size={24} style={{ color: '#235665' }} />
            <span>Member Verification Management</span>
          </h3>
          <p className="text-muted mb-0 small">
            Review applicant Sri Lankan NICs and Grama Niladhari Character Certificates for Anti-Fraud Compliance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div
            onClick={() => setFilterStatus('PENDING')}
            className={`card border-0 shadow-sm rounded-3 p-3 h-100 ${filterStatus === 'PENDING' ? 'border-start border-4 border-warning' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: '#FFFBEB' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-warning-emphasis fw-bold small text-uppercase">Pending Review</div>
                <h3 className="fw-bold text-dark mb-0">{pendingCount}</h3>
              </div>
              <Clock size={28} className="text-warning" />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div
            onClick={() => setFilterStatus('VERIFIED')}
            className={`card border-0 shadow-sm rounded-3 p-3 h-100 ${filterStatus === 'VERIFIED' ? 'border-start border-4 border-success' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: '#F0FDF4' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-success fw-bold small text-uppercase">Verified Members</div>
                <h3 className="fw-bold text-dark mb-0">{verifiedCount}</h3>
              </div>
              <CheckCircle2 size={28} className="text-success" />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div
            onClick={() => setFilterStatus('REJECTED')}
            className={`card border-0 shadow-sm rounded-3 p-3 h-100 ${filterStatus === 'REJECTED' ? 'border-start border-4 border-danger' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: '#FEF2F2' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-danger fw-bold small text-uppercase">Rejected</div>
                <h3 className="fw-bold text-dark mb-0">{rejectedCount}</h3>
              </div>
              <XCircle size={28} className="text-danger" />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div
            onClick={() => setFilterStatus('ALL')}
            className={`card border-0 shadow-sm rounded-3 p-3 h-100 ${filterStatus === 'ALL' ? 'border-start border-4 border-primary' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: '#F8FAFC' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted fw-bold small text-uppercase">All Records</div>
                <h3 className="fw-bold text-dark mb-0">{verifications.length}</h3>
              </div>
              <Folder size={28} style={{ color: '#235665' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={18} className="text-danger flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {success && (
        <div className="alert alert-success shadow-sm border-0 rounded-3 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} className="text-success flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setSuccess('')} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-md-3">
            <select
              className="form-select form-select-sm fw-medium"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ borderRadius: '8px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review Only</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>
          <div className="col-md-7">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Search member by full name, email, phone, or NIC number…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '0 8px 8px 0' }}
              />
            </div>
          </div>
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-sm text-white w-100 fw-bold"
              style={{ backgroundColor: '#235665', borderRadius: '8px' }}
            >
              Filter / Search
            </button>
          </div>
        </form>
      </div>

      {/* Verification Records Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <tr>
                <th className="ps-4">Applicant Member</th>
                <th>NIC Number</th>
                <th>Contact Details</th>
                <th>GN Division</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.875rem' }}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-teal mb-2" style={{ color: '#235665' }} />
                    <div className="text-muted small">Loading verifications…</div>
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="mb-2 d-flex justify-content-center"><ClipboardList size={38} className="text-muted" /></div>
                    <h6 className="fw-bold text-dark mb-1">No Verification Records Found</h6>
                    <p className="text-muted small mb-0">
                      {filterStatus === 'PENDING'
                        ? 'There are currently no member verifications awaiting approval.'
                        : 'No records matching the selected status or search filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                verifications.map((v) => (
                  <tr key={v.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: '#235665',
                            fontSize: '0.85rem',
                          }}
                        >
                          {(v.userName || 'M').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{v.userName || 'Unknown Member'}</div>
                          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>User #{v.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace fw-bold text-dark bg-light px-2 py-1 rounded border">
                        {v.nicNumber}
                      </span>
                    </td>
                    <td>
                      <div>{v.userEmail || '—'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{v.userPhone || '—'}</div>
                    </td>
                    <td>
                      <div>{v.gnDivision || <span className="text-muted fst-italic">Not specified</span>}</div>
                      {v.gnIssueDate && (
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Issued: {new Date(v.gnIssueDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {v.createdAt ? new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td>
                      <VerificationStatusBadge status={v.verificationStatus} />
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex align-items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVerification(v)}
                          className="btn btn-sm btn-outline-teal fw-semibold"
                          style={{ color: '#235665', borderColor: '#235665', fontSize: '0.78rem' }}
                        >
                          <Eye size={13} className="me-1" /> Review
                        </button>
                        {v.verificationStatus === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(v.id)}
                              className="btn btn-sm btn-success fw-bold"
                              style={{ fontSize: '0.78rem' }}
                              disabled={actionLoading}
                              title="Approve verification"
                            >
                              <Check size={13} className="me-1" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectModal(v.id)}
                              className="btn btn-sm btn-danger fw-bold"
                              style={{ fontSize: '0.78rem' }}
                              disabled={actionLoading}
                              title="Reject verification"
                            >
                              <X size={13} className="me-1" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Inspection Modal */}
      {selectedVerification && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div className="modal-header text-white px-4 py-3" style={{ backgroundColor: '#235665' }}>
                <div className="d-flex align-items-center gap-2">
                  <Shield size={20} className="text-white" />
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-white">
                      Verification Dossier: {selectedVerification.userName}
                    </h5>
                    <small className="text-white-50">
                      NIC: {selectedVerification.nicNumber} • User ID #{selectedVerification.userId}
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <VerificationStatusBadge status={selectedVerification.verificationStatus} />
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    onClick={() => setSelectedVerification(null)}
                  />
                </div>
              </div>

              <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Member summary banner */}
                <div className="p-3 bg-light rounded-3 mb-4 border">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="text-muted small">Full Legal Name</div>
                      <div className="fw-bold text-dark">{selectedVerification.userName}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small">NIC Number</div>
                      <div className="font-monospace fw-bold text-dark">{selectedVerification.nicNumber}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small">Email & Phone</div>
                      <div className="text-dark small">{selectedVerification.userEmail}</div>
                      <div className="text-dark small">{selectedVerification.userPhone}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small">GN Division / Issue Date</div>
                      <div className="text-dark small">{selectedVerification.gnDivision || 'Not specified'}</div>
                      <div className="text-muted small">
                        {selectedVerification.gnIssueDate ? `Issued: ${selectedVerification.gnIssueDate}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* If rejected, show rejection reason */}
                {selectedVerification.rejectionReason && (
                  <div className="alert alert-danger mb-4 p-3 rounded-3 small">
                    <strong>Rejection Reason:</strong> {selectedVerification.rejectionReason}
                  </div>
                )}

                {/* Primary Documents Grid */}
                <h6 className="fw-bold text-dark mb-3">Primary Verification Documents</h6>
                <div className="row g-3 mb-4">
                  {/* NIC Front */}
                  <div className="col-md-4">
                    <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                      <div className="fw-bold text-dark small mb-2">1. NIC Front Page</div>
                      <div
                        onClick={() => openPreview('NIC Front Page', selectedVerification.nicFrontImagePath)}
                        style={{ height: '170px', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
                        className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                      >
                        <img
                          src={`http://localhost:8081${selectedVerification.nicFrontImagePath}`}
                          alt="NIC Front"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => openPreview('NIC Front Page', selectedVerification.nicFrontImagePath)}
                        className="btn btn-sm btn-outline-secondary w-100 py-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Eye size={13} className="me-1" /> Enlarge NIC Front
                      </button>
                    </div>
                  </div>

                  {/* NIC Back */}
                  <div className="col-md-4">
                    <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                      <div className="fw-bold text-dark small mb-2">2. NIC Back Page</div>
                      <div
                        onClick={() => openPreview('NIC Back Page', selectedVerification.nicBackImagePath)}
                        style={{ height: '170px', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
                        className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                      >
                        <img
                          src={`http://localhost:8081${selectedVerification.nicBackImagePath}`}
                          alt="NIC Back"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => openPreview('NIC Back Page', selectedVerification.nicBackImagePath)}
                        className="btn btn-sm btn-outline-secondary w-100 py-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Eye size={13} className="me-1" /> Enlarge NIC Back
                      </button>
                    </div>
                  </div>

                  {/* Grama Niladhari Certificate */}
                  <div className="col-md-4">
                    <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                      <div className="fw-bold text-dark small mb-2">3. Grama Niladhari Certificate</div>
                      <div
                        onClick={() => openPreview('Grama Niladhari Certificate', selectedVerification.gnCertificateImagePath)}
                        style={{ height: '170px', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
                        className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                      >
                        {selectedVerification.gnCertificateImagePath.toLowerCase().endsWith('.pdf') ? (
                          <div className="text-center p-3">
                            <FileText size={42} className="text-danger" />
                            <div className="text-danger fw-bold small">Official PDF Document</div>
                          </div>
                        ) : (
                          <img
                            src={`http://localhost:8081${selectedVerification.gnCertificateImagePath}`}
                            alt="GN Certificate"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openPreview('Grama Niladhari Certificate', selectedVerification.gnCertificateImagePath)}
                        className="btn btn-sm btn-outline-secondary w-100 py-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Eye size={13} className="me-1" /> Enlarge GN Certificate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Supporting Documents */}
                {selectedVerification.additionalDocuments && selectedVerification.additionalDocuments.length > 0 && (
                  <>
                    <h6 className="fw-bold text-dark mb-3">Additional Supporting Documents</h6>
                    <div className="row g-3 mb-3">
                      {selectedVerification.additionalDocuments.map((doc) => (
                        <div key={doc.id} className="col-md-4">
                          <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                            <div className="fw-bold text-dark small mb-1 text-truncate">{doc.documentName}</div>
                            <span className="badge bg-light text-muted border mb-2 small" style={{ fontSize: '0.7rem' }}>
                              {doc.documentType}
                            </span>
                            <div
                              onClick={() => openPreview(doc.documentName, doc.documentImagePath)}
                              style={{ height: '140px', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
                              className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                            >
                              {doc.documentImagePath.toLowerCase().endsWith('.pdf') ? (
                                <div className="text-center">
                                  <FileText size={36} className="text-danger" />
                                  <div className="text-danger fw-bold small">PDF File</div>
                                </div>
                              ) : (
                                <img
                                  src={`http://localhost:8081${doc.documentImagePath}`}
                                  alt={doc.documentName}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              )}
                            </div>
                            {doc.description && (
                              <p className="text-muted small mb-2 text-truncate" style={{ fontSize: '0.74rem' }}>
                                {doc.description}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => openPreview(doc.documentName, doc.documentImagePath)}
                              className="btn btn-sm btn-outline-secondary w-100 py-1"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <Eye size={13} className="me-1" /> View Document
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer with Actions */}
              <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setSelectedVerification(null)}
                >
                  Close
                </button>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openRejectModal(selectedVerification.id)}
                    className="btn btn-danger fw-bold px-3 shadow-sm"
                    disabled={actionLoading}
                  >
                    <X size={13} className="me-1" /> Reject Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="btn btn-success fw-bold px-4 shadow-sm"
                    disabled={actionLoading || selectedVerification.verificationStatus === 'VERIFIED'}
                  >
                    {selectedVerification.verificationStatus === 'VERIFIED' ? (
                      <span className="d-inline-flex align-items-center gap-1">
                        <Check size={14} /> Verified
                      </span>
                    ) : (
                      <span className="d-inline-flex align-items-center gap-1">
                        <Check size={14} /> Approve Verification
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger text-white px-4 py-3">
                <h6 className="modal-title fw-bold mb-0">Specify Rejection Reason</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRejectModal(false)} />
              </div>
              <form onSubmit={handleConfirmReject}>
                <div className="modal-body p-4">
                  {rejectError && (
                    <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3">
                      {rejectError}
                    </div>
                  )}
                  <p className="text-muted small mb-3">
                    Please provide clear guidance to the member explaining why their verification was rejected, so they can re-upload proper documents.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Rejection Reason <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="e.g. NIC front image is blurry and illegible. Grama Niladhari certificate date is older than 6 months. Please re-upload clear photos."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-danger fw-bold px-3 shadow-sm"
                    disabled={actionLoading || !rejectionReason.trim()}
                  >
                    {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* High-Res Document Preview */}
      <DocumentPreview
        show={previewDoc.show}
        title={previewDoc.title}
        fileUrl={previewDoc.fileUrl}
        onClose={() => setPreviewDoc({ show: false, title: '', fileUrl: '' })}
      />
    </div>
  );
};

export default VerificationManagement;
