import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getMyVerification,
  submitVerification,
  uploadAdditionalDocument,
  deleteDocument,
} from '../api/verificationApi';
import VerificationStatusBadge from '../components/VerificationStatusBadge';
import DocumentUpload from '../components/DocumentUpload';
import DocumentPreview from '../components/DocumentPreview';
import { getErrorMessage } from '../utils/errorHandler';

const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

const ADDITIONAL_DOC_TYPES = [
  { value: 'CLUB_MEMBERSHIP', label: 'Club / Association Membership' },
  { value: 'EMPLOYMENT_LETTER', label: 'Employment Letter / Salary Slip' },
  { value: 'UTILITY_BILL', label: 'Utility Bill (Address Proof)' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement / Passbook Proof' },
  { value: 'OTHER', label: 'Other Supporting Document' },
];

const MemberVerification = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Form State
  const [nicNumber, setNicNumber] = useState('');
  const [gnDivision, setGnDivision] = useState('');
  const [gnIssueDate, setGnIssueDate] = useState('');
  const [nicFrontFile, setNicFrontFile] = useState(null);
  const [nicBackFile, setNicBackFile] = useState(null);
  const [gnCertFile, setGnCertFile] = useState(null);

  // Initial Additional Doc (Optional)
  const [includeAdditional, setIncludeAdditional] = useState(false);
  const [additionalDocType, setAdditionalDocType] = useState('CLUB_MEMBERSHIP');
  const [additionalDocName, setAdditionalDocName] = useState('');
  const [additionalDocDesc, setAdditionalDocDesc] = useState('');
  const [additionalDocFile, setAdditionalDocFile] = useState(null);

  // Standalone Additional Doc Upload Modal
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocType, setNewDocType] = useState('EMPLOYMENT_LETTER');
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [addDocError, setAddDocError] = useState('');

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState({ show: false, title: '', fileUrl: '' });

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const userId = user?.userId || user?.id;

  const loadVerification = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMyVerification(userId);
      const data = res?.data || res;
      setVerification(data || null);
      if (data) {
        setNicNumber(data.nicNumber || '');
        setGnDivision(data.gnDivision || '');
        setGnIssueDate(data.gnIssueDate || '');
      }
    } catch (err) {
      console.error('Failed to load verification', err);
      setError('Could not load existing verification details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, [userId]);

  const validateForm = () => {
    const errors = {};
    const cleanNic = nicNumber.trim().toUpperCase();

    if (!cleanNic) {
      errors.nicNumber = 'NIC number is required.';
    } else if (!NIC_REGEX.test(cleanNic)) {
      errors.nicNumber = 'Invalid format. Must be 9 digits followed by V/X, or modern 12 digits.';
    }

    if (!nicFrontFile && !verification?.nicFrontImagePath) {
      errors.nicFront = 'NIC Front page image is required.';
    }

    if (!nicBackFile && !verification?.nicBackImagePath) {
      errors.nicBack = 'NIC Back page image is required.';
    }

    if (!gnCertFile && !verification?.gnCertificateImagePath) {
      errors.gnCert = 'Grama Niladhari Certificate is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please resolve the highlighted validation errors.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nicNumber', nicNumber.trim().toUpperCase());
      if (gnDivision.trim()) formData.append('gnDivision', gnDivision.trim());
      if (gnIssueDate) formData.append('gnIssueDate', gnIssueDate);
      if (userId) formData.append('userId', userId);

      if (nicFrontFile) formData.append('nicFront', nicFrontFile);
      if (nicBackFile) formData.append('nicBack', nicBackFile);
      if (gnCertFile) formData.append('gnCert', gnCertFile);

      if (includeAdditional && additionalDocFile) {
        formData.append('additionalDoc', additionalDocFile);
        formData.append('additionalDocType', additionalDocType);
        formData.append('additionalDocName', additionalDocName.trim() || additionalDocFile.name);
        if (additionalDocDesc.trim()) formData.append('additionalDocDescription', additionalDocDesc.trim());
      }

      const res = await submitVerification(formData);
      const updated = res?.data || res;
      setVerification(updated);
      setIsResubmitting(false);
      if (updateUser && updated) {
        updateUser({
          kycStatus: updated.verificationStatus || 'PENDING',
          nicNumber: updated.nicNumber,
        });
      }
      setSuccess('Identity verification and documents submitted successfully! Organizers will review your submission.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit verification. Please verify file sizes and formats.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSingleAdditionalDoc = async (e) => {
    e.preventDefault();
    if (!newDocFile) {
      setAddDocError('Please select a file to upload.');
      return;
    }

    setUploadingDoc(true);
    setAddDocError('');
    try {
      const formData = new FormData();
      formData.append('file', newDocFile);
      formData.append('documentType', newDocType);
      formData.append('documentName', newDocName.trim() || newDocFile.name);
      if (newDocDesc.trim()) formData.append('description', newDocDesc.trim());

      await uploadAdditionalDocument(verification.id, formData, userId);
      setShowAddDocModal(false);
      setNewDocName('');
      setNewDocDesc('');
      setNewDocFile(null);
      await loadVerification();
      setSuccess('Additional supporting document uploaded successfully.');
    } catch (err) {
      setAddDocError(getErrorMessage(err, 'Failed to upload additional document.'));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteAdditionalDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this supporting document?')) return;
    try {
      await deleteDocument(docId, userId);
      await loadVerification();
      setSuccess('Document removed.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete document.'));
    }
  };

  const openPreview = (title, fileUrl) => {
    setPreviewDoc({ show: true, title, fileUrl });
  };

  const status = verification?.verificationStatus || 'INCOMPLETE';
  const showForm = !verification || status === 'INCOMPLETE' || isResubmitting;

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-teal mb-3" style={{ color: '#235665' }} role="status"></div>
        <div className="text-muted fw-semibold">Loading identity verification records…</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Top Banner / Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span>🛡️</span>
            <span>Member Identity Verification</span>
          </h3>
          <p className="text-muted mb-0 small">
            Sri Lankan National Identity Card (NIC) & Grama Niladhari Anti-Fraud Proof
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <VerificationStatusBadge status={status} />
          {verification && !showForm && status === 'REJECTED' && (
            <button
              onClick={() => setIsResubmitting(true)}
              className="btn btn-sm btn-primary fw-bold"
              style={{ backgroundColor: '#235665', borderColor: '#235665' }}
            >
              🔄 Re-Submit Verification
            </button>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {success && (
        <div className="alert alert-success shadow-sm border-0 rounded-3 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>✓</span>
            <span>{success}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setSuccess('')} />
        </div>
      )}

      {/* Rejection Notice if rejected */}
      {status === 'REJECTED' && !isResubmitting && (
        <div className="card border-0 shadow-sm mb-4 rounded-3" style={{ borderLeft: '5px solid #DC3545', backgroundColor: '#FEF2F2' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3">
              <span style={{ fontSize: '2rem' }}>🛑</span>
              <div className="flex-grow-1">
                <h5 className="fw-bold text-danger mb-1">Verification Rejected by Organizer / Admin</h5>
                <p className="text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                  <strong>Reason:</strong> {verification.rejectionReason || 'Uploaded documents did not meet verification criteria. Please upload clear, unaltered copies.'}
                </p>
                <div className="text-muted small mb-3">
                  You can re-upload your NIC images and official Grama Niladhari Certificate to request a new review.
                </div>
                <button
                  type="button"
                  onClick={() => setIsResubmitting(true)}
                  className="btn btn-sm btn-danger fw-bold px-3 py-1.5 shadow-sm"
                >
                  Click Here to Re-Submit Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Banner */}
      {status === 'VERIFIED' && (
        <div className="card border-0 shadow-sm mb-4 rounded-3" style={{ borderLeft: '5px solid #198754', backgroundColor: '#F0FDF4' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3">
              <span style={{ fontSize: '2.2rem' }}>✅</span>
              <div>
                <h5 className="fw-bold text-success mb-1">Identity Officially Verified</h5>
                <p className="text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                  Your identity has been fully cleared with verified Sri Lankan NIC and official Grama Niladhari Character Certificate. You have full access to participate in and join Seettu contribution groups.
                </p>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <div>
                    <strong>Verified NIC:</strong> <span className="font-monospace text-dark fw-bold">{verification.nicNumber}</span>
                  </div>
                  {verification.gnDivision && (
                    <div>
                      <strong>GN Division:</strong> <span className="text-dark">{verification.gnDivision}</span>
                    </div>
                  )}
                  {verification.verifiedAt && (
                    <div>
                      <strong>Verified At:</strong> <span className="text-dark">{new Date(verification.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Banner */}
      {status === 'PENDING' && !isResubmitting && (
        <div className="card border-0 shadow-sm mb-4 rounded-3" style={{ borderLeft: '5px solid #FFC107', backgroundColor: '#FFFBEB' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3">
              <span style={{ fontSize: '2.2rem' }}>⏳</span>
              <div>
                <h5 className="fw-bold text-dark mb-1">Verification Review in Progress</h5>
                <p className="text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                  Your documents are currently undergoing anti-fraud inspection by group organizers. Once verified, you will receive an instant notification and can immediately join Seettu circles.
                </p>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <div>
                    <strong>Submitted NIC:</strong> <span className="font-monospace text-dark fw-bold">{verification.nicNumber}</span>
                  </div>
                  <div>
                    <strong>Submitted Date:</strong> <span className="text-dark">{new Date(verification.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If Showing Submission / Re-submission Form */}
      {showForm ? (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="p-4 text-white" style={{ backgroundColor: '#235665' }}>
            <h5 className="fw-bold mb-1 text-white">
              {isResubmitting ? 'Re-Submit Identity Verification' : 'Identity Verification Submission'}
            </h5>
            <small className="text-white-50">
              Please provide clear, legible copies of your identification documents. Accepted formats: JPG, PNG, PDF (Max 5MB each).
            </small>
          </div>

          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit} noValidate>
              {/* SECTION 1: NIC Details */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-light text-dark border">1</span>
                  <span>National Identity Card (NIC) Verification</span>
                </h6>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                      Sri Lankan NIC Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control font-monospace text-uppercase ${fieldErrors.nicNumber ? 'is-invalid' : ''}`}
                      placeholder="e.g. 951234567V or 199512345678"
                      value={nicNumber}
                      maxLength={15}
                      onChange={(e) => {
                        setNicNumber(e.target.value.toUpperCase());
                        if (fieldErrors.nicNumber) setFieldErrors({ ...fieldErrors, nicNumber: '' });
                      }}
                      style={{ borderRadius: '8px' }}
                    />
                    {fieldErrors.nicNumber && <div className="invalid-feedback">{fieldErrors.nicNumber}</div>}
                    <div className="form-text text-muted small" style={{ fontSize: '0.74rem' }}>
                      Format: 9 digits ending with V/X, or 12 modern digits.
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <DocumentUpload
                      id="nicFront"
                      label="NIC Front Page Image"
                      required
                      helperText="Clear photo or scan of the front face of your NIC."
                      file={nicFrontFile}
                      existingUrl={verification?.nicFrontImagePath}
                      onChange={(file) => {
                        setNicFrontFile(file);
                        if (fieldErrors.nicFront) setFieldErrors({ ...fieldErrors, nicFront: '' });
                      }}
                      onRemove={() => setNicFrontFile(null)}
                      error={fieldErrors.nicFront}
                    />
                  </div>
                  <div className="col-md-6">
                    <DocumentUpload
                      id="nicBack"
                      label="NIC Back Page Image"
                      required
                      helperText="Clear photo or scan of the reverse side of your NIC."
                      file={nicBackFile}
                      existingUrl={verification?.nicBackImagePath}
                      onChange={(file) => {
                        setNicBackFile(file);
                        if (fieldErrors.nicBack) setFieldErrors({ ...fieldErrors, nicBack: '' });
                      }}
                      onRemove={() => setNicBackFile(null)}
                      error={fieldErrors.nicBack}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Grama Niladhari Character Certificate */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-light text-dark border">2</span>
                  <span>Grama Niladhari Character Certificate (Original)</span>
                </h6>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                      GN Division Name <span className="text-muted small">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dematagoda GN Division / 512"
                      value={gnDivision}
                      onChange={(e) => setGnDivision(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                      Certificate Issue Date <span className="text-muted small">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={gnIssueDate}
                      onChange={(e) => setGnIssueDate(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <DocumentUpload
                      id="gnCert"
                      label="Grama Niladhari Certificate Original Image / PDF"
                      required
                      helperText="Official certificate verifying character and permanent residency within Sri Lanka."
                      file={gnCertFile}
                      existingUrl={verification?.gnCertificateImagePath}
                      onChange={(file) => {
                        setGnCertFile(file);
                        if (fieldErrors.gnCert) setFieldErrors({ ...fieldErrors, gnCert: '' });
                      }}
                      onRemove={() => setGnCertFile(null)}
                      error={fieldErrors.gnCert}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Optional Additional Supporting Documents */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                    <span className="badge bg-light text-dark border">3</span>
                    <span>Additional Supporting Documents</span>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border small">Optional</span>
                  </h6>
                  <button
                    type="button"
                    onClick={() => setIncludeAdditional(!includeAdditional)}
                    className="btn btn-sm btn-link text-decoration-none fw-semibold"
                    style={{ color: '#235665' }}
                  >
                    {includeAdditional ? '− Remove Additional Document' : '+ Add Supporting Document'}
                  </button>
                </div>
                <p className="text-muted small mb-3">
                  Upload club membership proof, employment confirmation letter, utility bill, or other references to enhance your trust score.
                </p>

                {includeAdditional && (
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Document Type</label>
                        <select
                          className="form-select form-select-sm"
                          value={additionalDocType}
                          onChange={(e) => setAdditionalDocType(e.target.value)}
                        >
                          {ADDITIONAL_DOC_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">
                          Document Title / Identifier
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Rotary Club ID, Dialog Axiata Salary Letter"
                          value={additionalDocName}
                          onChange={(e) => setAdditionalDocName(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-secondary small">
                          Description / Reference Details
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Club Member #9928 or Employee ID #10492"
                          value={additionalDocDesc}
                          onChange={(e) => setAdditionalDocDesc(e.target.value)}
                        />
                      </div>
                    </div>
                    <DocumentUpload
                      id="additionalDoc"
                      label="Supporting Document File (JPG, PNG, PDF)"
                      file={additionalDocFile}
                      onChange={(file) => setAdditionalDocFile(file)}
                      onRemove={() => setAdditionalDocFile(null)}
                    />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                {isResubmitting && (
                  <button
                    type="button"
                    onClick={() => setIsResubmitting(false)}
                    className="btn btn-outline-secondary px-4 fw-semibold"
                    style={{ borderRadius: '8px' }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn text-white fw-bold px-4 py-2 shadow-sm"
                  style={{ backgroundColor: '#235665', borderColor: '#235665', borderRadius: '8px' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Uploading & Submitting…
                    </>
                  ) : (
                    'Submit Verification for Approval'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* If already submitted / reviewed: View Document Gallery */
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="p-3 px-4 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark">Verified Evidence & Uploaded Documents</h5>
              <small className="text-muted">Click any document to inspect full resolution or download</small>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDocModal(true)}
              className="btn btn-sm btn-outline-teal fw-semibold d-inline-flex align-items-center gap-1.5"
              style={{ color: '#235665', borderColor: '#235665' }}
            >
              <span>+ Add Supporting Document</span>
            </button>
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              {/* NIC Front */}
              {verification.nicFrontImagePath && (
                <div className="col-md-4 col-sm-6">
                  <div className="card h-100 border rounded-3 p-3 text-center shadow-sm hover-shadow">
                    <div className="fw-semibold text-dark small mb-2">NIC Front Page</div>
                    <div
                      onClick={() => openPreview('NIC Front Page', verification.nicFrontImagePath)}
                      style={{ cursor: 'pointer', height: '140px', backgroundColor: '#F8FAFC' }}
                      className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                    >
                      <img
                        src={`http://localhost:8081${verification.nicFrontImagePath}`}
                        alt="NIC Front"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openPreview('NIC Front Page', verification.nicFrontImagePath)}
                      className="btn btn-sm btn-outline-secondary w-100 py-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      🔍 View Document
                    </button>
                  </div>
                </div>
              )}

              {/* NIC Back */}
              {verification.nicBackImagePath && (
                <div className="col-md-4 col-sm-6">
                  <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                    <div className="fw-semibold text-dark small mb-2">NIC Back Page</div>
                    <div
                      onClick={() => openPreview('NIC Back Page', verification.nicBackImagePath)}
                      style={{ cursor: 'pointer', height: '140px', backgroundColor: '#F8FAFC' }}
                      className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                    >
                      <img
                        src={`http://localhost:8081${verification.nicBackImagePath}`}
                        alt="NIC Back"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openPreview('NIC Back Page', verification.nicBackImagePath)}
                      className="btn btn-sm btn-outline-secondary w-100 py-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      🔍 View Document
                    </button>
                  </div>
                </div>
              )}

              {/* Grama Niladhari Certificate */}
              {verification.gnCertificateImagePath && (
                <div className="col-md-4 col-sm-6">
                  <div className="card h-100 border rounded-3 p-3 text-center shadow-sm">
                    <div className="fw-semibold text-dark small mb-2">Grama Niladhari Certificate</div>
                    <div
                      onClick={() => openPreview('Grama Niladhari Certificate', verification.gnCertificateImagePath)}
                      style={{ cursor: 'pointer', height: '140px', backgroundColor: '#F8FAFC' }}
                      className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                    >
                      {verification.gnCertificateImagePath.toLowerCase().endsWith('.pdf') ? (
                        <div className="text-center p-3">
                          <span style={{ fontSize: '36px' }}>📄</span>
                          <div className="text-danger fw-bold small">Official GN PDF</div>
                        </div>
                      ) : (
                        <img
                          src={`http://localhost:8081${verification.gnCertificateImagePath}`}
                          alt="GN Certificate"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openPreview('Grama Niladhari Certificate', verification.gnCertificateImagePath)}
                      className="btn btn-sm btn-outline-secondary w-100 py-1"
                      style={{ fontSize: '0.78rem' }}
                    >
                      🔍 View Document
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Documents */}
              {verification.additionalDocuments && verification.additionalDocuments.map((doc) => (
                <div key={doc.id} className="col-md-4 col-sm-6">
                  <div className="card h-100 border rounded-3 p-3 text-center shadow-sm position-relative">
                    <button
                      type="button"
                      onClick={() => handleDeleteAdditionalDoc(doc.id)}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '24px', height: '24px', fontSize: '11px' }}
                      title="Delete document"
                    >
                      ✕
                    </button>
                    <div className="fw-semibold text-dark small mb-1 text-truncate pe-3">
                      {doc.documentName || doc.documentType}
                    </div>
                    <span className="badge bg-light text-muted border mb-2 small" style={{ fontSize: '0.7rem' }}>
                      {doc.documentType}
                    </span>
                    <div
                      onClick={() => openPreview(doc.documentName, doc.documentImagePath)}
                      style={{ cursor: 'pointer', height: '120px', backgroundColor: '#F8FAFC' }}
                      className="rounded border d-flex align-items-center justify-content-center overflow-hidden mb-2"
                    >
                      {doc.documentImagePath.toLowerCase().endsWith('.pdf') ? (
                        <div className="text-center">
                          <span style={{ fontSize: '32px' }}>📄</span>
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
                      🔍 View Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Additional Document */}
      {showAddDocModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ backgroundColor: '#235665' }}>
                <h6 className="modal-title fw-bold mb-0">Upload Additional Supporting Document</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddDocModal(false)} />
              </div>
              <form onSubmit={handleUploadSingleAdditionalDoc}>
                <div className="modal-body p-4">
                  {addDocError && (
                    <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3">
                      {addDocError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Document Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                    >
                      {ADDITIONAL_DOC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Document Name / Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Colombo Club Membership Card"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description / Reference ID</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Membership ID #4928"
                      value={newDocDesc}
                      onChange={(e) => setNewDocDesc(e.target.value)}
                    />
                  </div>
                  <DocumentUpload
                    id="newDocFile"
                    label="Document File (JPG, PNG, PDF - Max 5MB)"
                    required
                    file={newDocFile}
                    onChange={(file) => setNewDocFile(file)}
                    onRemove={() => setNewDocFile(null)}
                  />
                </div>
                <div className="modal-footer bg-light p-3">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowAddDocModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white fw-bold px-3"
                    style={{ backgroundColor: '#235665' }}
                    disabled={uploadingDoc || !newDocFile}
                  >
                    {uploadingDoc ? 'Uploading…' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Document Full Preview Modal */}
      <DocumentPreview
        show={previewDoc.show}
        title={previewDoc.title}
        fileUrl={previewDoc.fileUrl}
        onClose={() => setPreviewDoc({ show: false, title: '', fileUrl: '' })}
      />
    </div>
  );
};

export default MemberVerification;
