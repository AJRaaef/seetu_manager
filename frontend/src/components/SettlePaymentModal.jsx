import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';

const SettlePaymentModal = ({ show, onHide, payment, onSettle }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Cash (Offline)');
  const [status, setStatus] = useState('LATE');
  const [notes, setNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount || 0);
      setDate(new Date().toISOString().split('T')[0]);
      setMethod('Cash (Offline)');
      // If payment is overdue, default to LATE (Paid Late), otherwise PAID
      const isPastDue = payment.status === 'OVERDUE' || payment.status === 'LATE';
      setStatus(isPastDue ? 'LATE' : 'PAID');
      setNotes(
        isPastDue
          ? `Settled overdue contribution on ${new Date().toLocaleDateString()}`
          : `Settled contribution on ${new Date().toLocaleDateString()}`
      );
      setEvidenceFile(null);
    }
  }, [payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSettle || !payment) return;
    if (method !== 'Cash (Offline)' && !evidenceFile) {
      alert('Bank deposit slip / payment proof is mandatory for Bank Deposit / Transfer. Please attach the slip.');
      return;
    }
    setSubmitting(true);
    try {
      await onSettle({
        ...payment,
        amount: parseFloat(amount) || payment.amount,
        date,
        method,
        status,
        notes,
        evidenceFile
      });
      onHide();
    } catch (err) {
      console.error('Error settling payment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!payment) return null;

  const isOverdue = payment.status === 'OVERDUE' || payment.status === 'LATE';

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ backgroundColor: '#134A5A', width: '32px', height: '32px' }}
          >
            <Icon name="check" size={16} color="#FFFFFF" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              {t('modals.settle_payment.title', 'Confirm Payment Settlement')}
            </h5>
            <span className="text-muted small">{t('modals.settle_payment.record_id', 'Record ID')}: #PAY-{payment.id}</span>
          </div>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="custom-modal-body p-4">
          {/* Member & Group Info Summary Box */}
          <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: '#F1F5F7', border: '1px solid #DCE7EB' }}>
            <div className="row g-2">
              <div className="col-6">
                <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>{t('modals.settle_payment.member', 'MEMBER')}</span>
                <div className="fw-bold text-dark">{payment.member || 'Member'}</div>
              </div>
              <div className="col-6">
                <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>{t('modals.settle_payment.group', 'GROUP')} & {t('modals.settle_payment.cycle', 'CYCLE')}</span>
                <div className="fw-bold text-dark">{payment.group} ({payment.cycle})</div>
              </div>
            </div>
          </div>

          {/* Overdue Advisory Notice */}
          {isOverdue && (
            <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <Icon name="bell" size={16} color="#856404" />
              <div>
                <strong>Overdue Settlement:</strong> Recording as <strong>Paid (Late)</strong> marks the payment received while keeping an accurate audit trail for discipline scores.
              </div>
            </div>
          )}

          <div className="row g-3 mb-3">
            {/* Amount Received */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-dark fw-semibold small mb-1">
                {t('modals.settle_payment.amount', 'Amount to Settle (LKR)')} <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>

            {/* Settlement Date */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-dark fw-semibold small mb-1">
                {t('modals.settle_payment.date', 'Settlement Date')} <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            {/* Settlement Method */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-dark fw-semibold small mb-1">
                {t('modals.settle_payment.method', 'Payment Method')} <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-white"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
              >
                <option value="Cash (Offline)">Cash (Offline)</option>
                <option value="Bank Deposit / Transfer">Bank Deposit / Transfer</option>
              </select>
            </div>

            {/* Record Status */}
            <div className="col-12 col-sm-6">
              <label className="form-label text-dark fw-semibold small mb-1">
                {t('modals.settle_payment.status', 'Payment Status')} <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="LATE">Paid (Late) — Received after due date</option>
                <option value="PAID">Paid (On Time)</option>
                <option value="PARTIAL">Partial Payment</option>
              </select>
            </div>
          </div>

          {/* Deposit Slip Upload or Offline Cash Notice */}
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">
              {method === 'Cash (Offline)' ? (
                <span>{t('modals.settle_payment.evidence_cash', 'Official Electronic Receipt')}</span>
              ) : (
                <span>
                  {t('modals.settle_payment.evidence_bank', 'Bank Transfer Slip / Deposit Receipt')} <span className="text-danger">*</span>
                </span>
              )}
            </label>
            {method === 'Cash (Offline)' ? (
              <div className="p-2.5 bg-light rounded-2 border text-muted small" style={{ fontSize: '0.82rem' }}>
                Handled via offline cash. The system will automatically generate an official electronic receipt upon settlement.
              </div>
            ) : (
              <input
                type="file"
                accept="image/*,.pdf"
                className="form-control bg-white"
                required
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              />
            )}
          </div>

          {/* Notes / Reference */}
          <div className="mb-2">
            <label className="form-label text-dark fw-semibold small mb-1">{t('modals.settle_payment.notes', 'Notes / Remarks')}</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="e.g. Paid in cash directly to organizer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="custom-modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2 border-top">
          <button type="button" className="btn btn-outline-secondary px-3" onClick={onHide} disabled={submitting}>
            {t('modals.settle_payment.cancel', 'Cancel')}
          </button>
          <button type="submit" className="btn btn-teal px-4 d-inline-flex align-items-center gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>{t('modals.settle_payment.submitting', 'Settling...')}</span>
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                <span>{t('modals.settle_payment.confirm_btn', 'Confirm Settlement')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettlePaymentModal;
