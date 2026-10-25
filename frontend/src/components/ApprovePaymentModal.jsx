import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';
import { getPaymentEvidences } from '../api/paymentApi';

const ApprovePaymentModal = ({ show, onHide, payment, onApprove, onReject }) => {
  const { t } = useTranslation();
  const [approvalNotes, setApprovalNotes] = useState('');
  const [existingEvidences, setExistingEvidences] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8081${cleanPath}`;
  };

  const isImageFile = (path) => {
    if (!path) return false;
    const clean = path.split('?')[0].toLowerCase();
    return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.gif');
  };

  useEffect(() => {
    if (payment && show) {
      setApprovalNotes('');
      setShowRejectInput(false);
      setRejectReason('');

      if (payment.id) {
        getPaymentEvidences(payment.id)
          .then((res) => {
            const list = res?.data || (Array.isArray(res) ? res : []);
            const files = list.map((item) => item.filePath || item);
            if (files.length > 0) {
              setExistingEvidences(files);
            } else if (payment.evidenceUrls && payment.evidenceUrls.length > 0) {
              setExistingEvidences(payment.evidenceUrls);
            } else {
              setExistingEvidences([]);
            }
          })
          .catch(() => {
            setExistingEvidences(payment.evidenceUrls || []);
          });
      } else {
        setExistingEvidences(payment.evidenceUrls || []);
      }
    } else {
      setExistingEvidences([]);
    }
  }, [payment, show]);

  if (!payment) return null;

  const handleConfirmApproval = async () => {
    setSubmitting(true);
    try {
      await onApprove(payment, approvalNotes);
      onHide();
    } catch (err) {
      console.error('Error confirming approval', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejecting this payment submission.');
      return;
    }
    setSubmitting(true);
    try {
      if (onReject) {
        await onReject(payment, rejectReason);
      }
      onHide();
    } catch (err) {
      console.error('Error rejecting payment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      {/* Header */}
      <div className="custom-modal-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ backgroundColor: '#0D9488', width: '34px', height: '34px' }}
          >
            <Icon name="check" size={18} color="#FFFFFF" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Review & Approve Member Payment
            </h5>
            <span className="text-muted small">
              Record ID: #PAY-{payment.id} • Awaiting Organizer Verification
            </span>
          </div>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="custom-modal-body p-4">
        {/* Large Amount Banner (Read-Only) */}
        <div
          className="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
          style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <div>
            <div className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              SUBMITTED PAYMENT AMOUNT
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">
              {Number(payment.amount || 0).toLocaleString()} LKR
            </div>
          </div>
          <div>
            <span className="badge bg-warning-subtle text-warning border border-warning px-2.5 py-1.5 rounded-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
              Awaiting Approval
            </span>
          </div>
        </div>

        {/* Member & Group Info Summary (Read-Only) */}
        <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div className="row g-3">
            <div className="col-6">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>
                MEMBER
              </span>
              <div className="fw-bold text-dark">{payment.member || 'Member'}</div>
              {payment.memberPhone && (
                <div className="small text-muted">{payment.memberPhone}</div>
              )}
            </div>
            <div className="col-6">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>
                GROUP & CYCLE
              </span>
              <div className="fw-bold text-dark">{payment.group}</div>
              <div className="small text-muted">{payment.cycle}</div>
            </div>
          </div>
        </div>

        {/* Submitted Transaction Details (Read-Only) */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="p-2.5 bg-light rounded-2 border">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem' }}>
                PAYMENT DATE
              </span>
              <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {payment.date || '—'}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2.5 bg-light rounded-2 border">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem' }}>
                PAYMENT METHOD
              </span>
              <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {payment.method || payment.paymentMethod || 'Bank Deposit / Transfer'}
              </div>
            </div>
          </div>
        </div>

        {/* Member Notes / Remarks (Read-Only) */}
        {payment.notes && (
          <div className="p-2.5 bg-light rounded-2 border mb-3">
            <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem' }}>
              MEMBER NOTES / REFERENCE
            </span>
            <div className="small text-dark mt-0.5">{payment.notes}</div>
          </div>
        )}

        {/* Member Attached Deposit Slip / Evidence (Read-Only Review) */}
        <div className="mb-3 p-3 bg-white rounded-3 border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase text-muted small fw-bold" style={{ fontSize: '0.72rem' }}>
              ATTACHED PAYMENT EVIDENCE / BANK SLIP
            </span>
            <span className={`badge ${existingEvidences.length > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border'} px-2 py-0.5 rounded-pill`} style={{ fontSize: '0.7rem' }}>
              {existingEvidences.length > 0 ? `${existingEvidences.length} Slip Attached` : 'No Slip Attached'}
            </span>
          </div>

          {existingEvidences.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {existingEvidences.map((fn, idx) => {
                const fileUrl = getFileUrl(fn);
                const isImg = isImageFile(fn);
                const fileName = typeof fn === 'string' ? fn.split('/').pop() : 'Deposit Slip';
                return (
                  <div key={idx} className="bg-light p-2.5 rounded-2 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <Icon name={isImg ? 'image' : 'file-text'} size={16} className="text-primary flex-shrink-0" />
                        <span className="small text-truncate font-monospace fw-semibold" style={{ fontSize: '0.8rem' }} title={fileName}>
                          {fileName}
                        </span>
                      </div>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-outline-primary py-0.5 px-2 small text-decoration-none"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Open Full Slip ↗
                        </a>
                      )}
                    </div>
                    {isImg && fileUrl && (
                      <div className="text-center bg-white p-2 rounded-2 border">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={fileUrl}
                            alt="Payment Slip Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted small py-2 px-3 bg-light rounded-2 border fst-italic">
              {(payment.method || '').toLowerCase().includes('cash')
                ? 'Offline cash payment reported by member. Official electronic receipt will be generated upon approval.'
                : 'No digital bank deposit slip was attached with this submission.'}
            </div>
          )}
        </div>

        {/* Optional Organizer Verification Notes */}
        {!showRejectInput ? (
          <div className="mb-2">
            <label className="form-label text-dark fw-semibold small mb-1">
              Organizer Verification Note (Optional)
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Verified with bank statement #REF-1234"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
            />
          </div>
        ) : (
          <div className="mb-2 p-3 bg-danger-subtle rounded-2 border border-danger-subtle">
            <label className="form-label text-danger fw-bold small mb-1">
              Reason for Rejecting Payment <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control form-control-sm"
              rows="2"
              placeholder="e.g. Deposit slip unreadable or transaction reference does not match bank statement."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="custom-modal-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center border-top">
        <div>
          {!showRejectInput ? (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-3"
              onClick={() => setShowRejectInput(true)}
              disabled={submitting}
            >
              Reject Submission
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm px-2.5"
              onClick={() => setShowRejectInput(false)}
              disabled={submitting}
            >
              Back to Approval
            </button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary px-3" onClick={onHide} disabled={submitting}>
            Cancel
          </button>

          {!showRejectInput ? (
            <button
              type="button"
              className="btn btn-teal px-4 d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={handleConfirmApproval}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={16} />
                  <span>Approve Payment</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger px-3 d-inline-flex align-items-center gap-2"
              onClick={handleConfirmReject}
              disabled={submitting || !rejectReason.trim()}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Rejecting...</span>
                </>
              ) : (
                <span>Confirm Rejection</span>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ApprovePaymentModal;
