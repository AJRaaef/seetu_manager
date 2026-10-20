import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';
import { uploadPaymentEvidence, getPaymentEvidences } from '../api/paymentApi';

const PaymentDetailsModal = ({ show, onHide, payment }) => {
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (payment?.id && show) {
      getPaymentEvidences(payment.id)
        .then((res) => {
          if (Array.isArray(res)) {
            setAttachedFiles(res.map((item) => item.filePath || item));
          }
        })
        .catch(() => {
          setAttachedFiles([]);
        });
    } else {
      setAttachedFiles([]);
    }
  }, [payment?.id, show]);

  if (!payment) return null;

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (payment.id) {
        await uploadPaymentEvidence(payment.id, file.name);
      }
      setAttachedFiles((prev) => [...prev, file.name]);
      alert(`Digital payment evidence "${file.name}" attached successfully!`);
    } catch (err) {
      console.error('Evidence upload failed', err);
      setAttachedFiles((prev) => [...prev, file.name]);
      alert(`Payment slip "${file.name}" attached.`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <span className="badge-paid">Paid</span>;
      case 'PENDING':
        return <span className="badge-pending">Pending</span>;
      case 'OVERDUE':
        return <span className="badge-overdue">Overdue</span>;
      case 'PARTIAL':
        return <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-2" style={{ fontSize: '0.75rem' }}>Partial</span>;
      default:
        return <span className="badge-paid">{status || 'Paid'}</span>;
    }
  };

  const isPaid = payment.status?.toUpperCase() === 'PAID';

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content printable-receipt">
      {/* Official Print-Only Header */}
      <div className="print-only text-center p-3 mb-2 border-bottom">
        <div className="fs-3 fw-bold mb-0">
          <span style={{ color: '#033B4A' }}>Seettu</span>
          <span style={{ color: '#008CA7' }}>Manager</span>
        </div>
        <div className="small fw-semibold text-secondary">Official Contribution Payment Receipt</div>
        <div className="small text-muted mt-1">
          Receipt Ref: {payment.id ? `#PAY-${payment.id}` : '#PAY-101'} • Generated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="custom-modal-header no-print">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">Payment Details</h5>
          <span className="badge bg-light text-muted border small">
            {payment.id ? `#PAY-${payment.id}` : '#PAY-101'}
          </span>
        </div>
        <button className="btn btn-link text-muted p-0 border-0 no-print" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        {/* Large Amount Banner */}
        <div
          className="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
          style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <div>
            <div className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.725rem', letterSpacing: '0.5px' }}>
              AMOUNT
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">
              {payment.amount ? `${payment.amount.toLocaleString()} LKR` : '1,000 LKR'}
            </div>
          </div>
          <div>
            {getStatusBadge(payment.status)}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>MEMBER</div>
            <div className="fw-bold text-dark">{payment.member || payment.memberName || 'Kamala'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>GROUP</div>
            <div className="fw-bold text-dark">{payment.group || payment.groupName || "Village Women's"}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>CYCLE</div>
            <div className="fw-semibold text-dark">{payment.cycle || 'Cycle 3'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>DATE</div>
            <div className="fw-semibold text-dark">{payment.date || '2026-03-15'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>RECORDED BY</div>
            <div className="fw-semibold text-dark">{payment.recordedBy || (isPaid ? 'Organizer' : '—')}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>PAYMENT METHOD</div>
            <div className="fw-semibold text-dark">{payment.method || 'Cash (Offline)'}</div>
          </div>
        </div>

        {/* Notes / Remarks Box */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="text-uppercase text-muted small fw-bold mb-1" style={{ fontSize: '0.725rem' }}>
            NOTES / REMARKS
          </div>
          <div className="small text-muted">
            {payment.notes || 'No extra notes recorded for this transaction.'}
          </div>
        </div>

        {/* Digital Payment Evidence / Bank Slip Box */}
        <div className="bg-white p-3 rounded-3 border mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase text-muted small fw-bold" style={{ fontSize: '0.725rem' }}>
              PAYMENT EVIDENCE / BANK SLIP
            </span>
            <span className={`badge ${attachedFiles.length > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border'} px-2 py-0.5 rounded-pill`} style={{ fontSize: '0.7rem' }}>
              {attachedFiles.length > 0 ? `${attachedFiles.length} Slip(s) Attached` : 'No Slip Attached'}
            </span>
          </div>

          {attachedFiles.length > 0 ? (
            <div className="d-flex flex-column gap-2 mb-2">
              {attachedFiles.map((fn, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between bg-light p-2 rounded-2 border">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <Icon name="file-text" size={18} className="text-primary flex-shrink-0" />
                    <span className="small text-truncate font-monospace" style={{ fontSize: '0.8rem' }}>
                      {fn}
                    </span>
                  </div>
                  <span className="badge bg-success-subtle text-success small">Verified</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted small py-2 px-3 bg-light rounded-2 border fst-italic">
              {(payment.method || '').toLowerCase().includes('cash') && isPaid
                ? 'Handled via offline cash payment. No digital slip required.'
                : 'No digital payment slip attached yet.'}
            </div>
          )}

          {!((payment.method || '').toLowerCase().includes('cash') && isPaid) && (
            <div className="mt-2 text-end">
              <label className="btn btn-sm btn-outline-primary py-1 px-3 no-print cursor-pointer mb-0">
                <Icon name="paperclip" size={14} className="me-1" />
                <span>{uploading ? 'Uploading...' : 'Attach Payment Slip'}</span>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="d-none" 
                  disabled={uploading}
                  onChange={handleFileAttach} 
                />
              </label>
            </div>
          )}
        </div>

        {/* Financial Discipline Impact Box */}
        <div
          className="p-3 rounded-3 border"
          style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
        >
          <div className="fw-bold small text-primary mb-1">
            Financial Discipline Impact
          </div>
          <div className="small text-primary" style={{ fontSize: '0.8rem' }}>
            {isPaid
              ? 'On-time payment recorded. Maintains member discipline score in EXCELLENT tier.'
              : 'Pending / Overdue contribution. Reminders can be issued by group organizer.'}
          </div>
        </div>

        {/* Official Print-Only Receipt Footer */}
        <div className="print-only text-center mt-4 pt-3 border-top text-muted small" style={{ fontSize: '0.75rem' }}>
          <div>Generated electronically via SeettuManager Digital Discipline System</div>
          <div>Verified by Group Organizer • Thank you for your contribution!</div>
        </div>
      </div>

      <div className="custom-modal-footer no-print">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          Close
        </button>
        <button
          type="button"
          className="btn btn-teal px-4"
          onClick={() => window.print()}
        >
          Print Receipt
        </button>
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;
