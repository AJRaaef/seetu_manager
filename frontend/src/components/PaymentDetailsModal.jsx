import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import Icon from './Icons';
import { uploadPaymentEvidence, getPaymentEvidences } from '../api/paymentApi';

const PaymentDetailsModal = ({ show, onHide, payment }) => {
  const { t } = useTranslation();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8081${cleanPath}`;
  };

  const getPaymentMethodLabel = (method) => (
    method === 'Cash (Offline)'
      ? t('payments_page.cash_offline')
      : method === 'Bank Deposit / Transfer'
        ? t('payments_page.bank_deposit_transfer')
        : method || t('payments_page.cash_offline')
  );

  const isImageFile = (path) => {
    if (!path) return false;
    const clean = path.split('?')[0].toLowerCase();
    return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.gif');
  };

  useEffect(() => {
    if (payment?.id && show) {
      getPaymentEvidences(payment.id)
        .then((res) => {
          const list = res?.data || (Array.isArray(res) ? res : []);
          const files = list.map((item) => item.filePath || item);
          if (files.length > 0) {
            setAttachedFiles(files);
          } else if (payment.evidenceUrls && payment.evidenceUrls.length > 0) {
            setAttachedFiles(payment.evidenceUrls);
          } else {
            setAttachedFiles([]);
          }
        })
        .catch(() => {
          if (payment.evidenceUrls && payment.evidenceUrls.length > 0) {
            setAttachedFiles(payment.evidenceUrls);
          } else {
            setAttachedFiles([]);
          }
        });
    } else if (payment?.evidenceUrls && payment.evidenceUrls.length > 0) {
      setAttachedFiles(payment.evidenceUrls);
    } else {
      setAttachedFiles([]);
    }
  }, [payment?.id, payment?.evidenceUrls, show]);

  if (!payment) return null;

  const handleFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (payment.id) {
        const uploadRes = await uploadPaymentEvidence(payment.id, file);
        const savedPath = uploadRes?.data?.filePath || uploadRes?.filePath || file.name;
        setAttachedFiles((prev) => [...prev, savedPath]);
      } else {
        setAttachedFiles((prev) => [...prev, file.name]);
      }
      alert(t('payments_page.evidence_attached_success', { name: file.name }));
    } catch (err) {
      console.error('Evidence upload failed', err);
      alert(t('payments_page.evidence_attach_failed', { message: err?.response?.data?.message || err?.message || t('payments_page.error_uploading_file') }));
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <span className="badge-paid">{t('payments_page.paid')}</span>;
      case 'LATE':
        return <span className="badge bg-warning text-dark px-2 py-1 rounded-2 fw-semibold" style={{ fontSize: '0.75rem' }}>{t('payments_page.paid_late')}</span>;
      case 'PENDING':
        return <span className="badge-pending">{t('payments_page.pending')}</span>;
      case 'OVERDUE':
        return <span className="badge-overdue">{t('payments_page.overdue')}</span>;
      case 'PARTIAL':
        return <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-2" style={{ fontSize: '0.75rem' }}>{t('payments_page.partial')}</span>;
      default:
        return <span className="badge-paid">{t(`payments_page.status_${status?.toLowerCase()}`, t('payments_page.status_unknown'))}</span>;
    }
  };

  const isPaid = payment.status?.toUpperCase() === 'PAID' || payment.status?.toUpperCase() === 'LATE';
  const cycleNumber =
    payment.cycleNumber
    ?? (typeof payment.cycle === 'number' ? payment.cycle : payment.cycle?.match(/^Cycle\s+#?(\d+)$/i)?.[1]);
  const cycleLabel =
    cycleNumber != null
      ? t('payments_page.cycle_value', { number: cycleNumber })
      : payment.cycle || t('payments_page.not_available');
  const notesText =
    payment.notes === 'Recorded via Payment Management portal'
      ? t('payments_page.recorded_via_portal')
      : payment.notes ===
          'Submitted by member with payment slip (Awaiting Approval)'
        ? t('payments_page.submitted_by_member_pending')
        : payment.notes ||
          t('payments_page.no_transaction_notes');

  const handleDownloadReceipt = () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const receiptNumber = payment.id ? `PAY-${payment.id}` : 'PAY-101';
      const safeText = (value, fallback = t('payments_page.not_available')) => String(value || fallback);
      const addField = (label, value, x, y, width) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(31, 41, 55);
        const lines = pdf.splitTextToSize(safeText(value), width);
        pdf.text(lines, x, y + 6);
        return y + 6 + lines.length * 5;
      };

      pdf.setProperties({
        title: t('payments_page.receipt_title', { number: receiptNumber }),
        subject: t('payments_page.receipt_subject')
      });
      pdf.setFillColor(19, 74, 90);
      pdf.rect(0, 0, pageWidth, 42, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('SeettuManager', margin, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(t('payments_page.official_contribution_receipt'), margin, 26);
      pdf.setFontSize(9);
      pdf.text(`${t('payments_page.receipt_ref')}: #${receiptNumber}`, margin, 34);
      pdf.text(`${t('payments_page.generated')}: ${new Date().toLocaleDateString()}`, pageWidth - margin, 34, { align: 'right' });

      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 222, 197);
      pdf.roundedRect(margin, 54, contentWidth, 30, 3, 3, 'FD');
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(t('payments_page.amount').toUpperCase(), margin + 7, 63);
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      pdf.text(`${Number(payment.amount || 0).toLocaleString()} ${t('payments_page.currency')}`, margin + 7, 75);
      pdf.setFillColor(isPaid ? 22 : 245, isPaid ? 163 : 158, isPaid ? 74 : 11);
      pdf.roundedRect(pageWidth - margin - 31, 63, 24, 9, 4, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(t(`payments_page.status_${payment.status?.toLowerCase()}`, t('payments_page.status_unknown')).toUpperCase(), pageWidth - margin - 19, 69, { align: 'center' });

      pdf.setTextColor(19, 74, 90);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(t('payments_page.payment_details'), margin, 99);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, 103, pageWidth - margin, 103);

      const columnGap = 12;
      const columnWidth = (contentWidth - columnGap) / 2;
      let y = 113;
      const fields = [
        [t('payments_page.member'), payment.member || payment.memberName || t('payments_page.not_available'), t('payments_page.group'), payment.group || payment.groupName || t('payments_page.not_available')],
        [t('payments_page.cycle'), cycleLabel, t('payments_page.date'), payment.date || t('payments_page.not_available')],
        [t('payments_page.recorded_by'), payment.recordedBy === 'Organizer' ? t('payments_page.organizer') : payment.recordedBy || (isPaid ? t('payments_page.organizer') : t('payments_page.not_available')), t('payments_page.payment_method'), getPaymentMethodLabel(payment.method)]
      ];
      if (payment.status?.toUpperCase() === 'PARTIAL') {
        const balDue = (payment.expectedAmount || 0) > payment.amount ? (payment.expectedAmount - payment.amount) : 0;
        fields.push([t('payments_page.full_required_installment'), `${Number(payment.expectedAmount || 0).toLocaleString()} ${t('payments_page.currency')}`, t('payments_page.outstanding_balance_due'), `${Number(balDue).toLocaleString()} ${t('payments_page.currency')}`]);
      }

      fields.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
        const leftHeight = addField(leftLabel, leftValue, margin, y, columnWidth);
        const rightHeight = addField(rightLabel, rightValue, margin + columnWidth + columnGap, y, columnWidth);
        y = Math.max(leftHeight, rightHeight) + 8;
      });

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      const notes = safeText(
        notesText,
        t('payments_page.no_transaction_notes'),
      );
      const noteLines = pdf.splitTextToSize(notes, contentWidth - 14);
      const notesHeight = Math.max(25, 18 + noteLines.length * 5);
      pdf.roundedRect(margin, y, contentWidth, notesHeight, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(t('payments_page.notes_remarks').toUpperCase(), margin + 7, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(noteLines, margin + 7, y + 15);

      const footerY = Math.min(y + notesHeight + 22, 275);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(t('payments_page.digital_receipt_footer'), pageWidth / 2, footerY, { align: 'center' });
      pdf.text(t('payments_page.verified_receipt_footer'), pageWidth / 2, footerY + 5, { align: 'center' });

      const fileName = `Payment_Receipt_${receiptNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to download payment receipt PDF', error);
      alert(t('payments_page.download_receipt_failed'));
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="receipt-print-modal"
      contentClassName="custom-modal-content printable-receipt"
    >
      {/* Official Print-Only Header */}
      <div className="print-only text-center p-3 mb-2 border-bottom">
        <div className="fs-3 fw-bold mb-0">
          <span style={{ color: '#033B4A' }}>Seettu</span>
          <span style={{ color: '#008CA7' }}>Manager</span>
        </div>
        <div className="small fw-semibold text-secondary">{t('payments_page.official_contribution_receipt')}</div>
        <div className="small text-muted mt-1">
          {t('payments_page.receipt_ref')}: {payment.id ? `#PAY-${payment.id}` : '#PAY-101'} • {t('payments_page.generated')}: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="custom-modal-header no-print">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">{t('payments_page.payment_details')}</h5>
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
        {payment.status?.toUpperCase() === 'PARTIAL' ? (
          <div className="p-3 rounded-3 mb-3 border shadow-xs" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div className="d-flex justify-content-between align-items-center mb-2.5">
              <span className="fw-bold text-warning-emphasis small text-uppercase letter-spacing-1">
                {t('payments_page.partial_receipt_breakdown')}
              </span>
              {getStatusBadge(payment.status)}
            </div>
            <div className="row g-2 text-center mb-2">
              <div className="col-4">
                <div className="p-2 bg-white rounded border">
                  <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>{t('payments_page.full_required')}</div>
                  <div className="fw-bold text-dark fs-6 mt-1">
                    {Number(payment.expectedAmount || 0).toLocaleString()} {t('payments_page.currency')}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-white rounded border border-success border-opacity-25">
                  <div className="text-success text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>{t('payments_page.amount_paid')}</div>
                  <div className="fw-bold text-success fs-6 mt-1">
                    {Number(payment.amount || 0).toLocaleString()} {t('payments_page.currency')}
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-white rounded border border-danger border-opacity-50">
                  <div className="text-danger text-uppercase fw-semibold" style={{ fontSize: '0.68rem' }}>{t('payments_page.balance_remaining')}</div>
                  <div className="fw-bold text-danger fs-6 mt-1">
                    {Number((payment.expectedAmount || 0) > payment.amount ? (payment.expectedAmount - payment.amount) : 0).toLocaleString()} {t('payments_page.currency')}
                  </div>
                </div>
              </div>
            </div>
            <div className="small text-muted fst-italic p-2 bg-white bg-opacity-60 rounded border border-warning border-opacity-25" style={{ fontSize: '0.74rem' }}>
              ℹ️ {t('payments_page.partial_payment_explanation', { amount: Number(payment.amount || 0).toLocaleString(), expected: Number(payment.expectedAmount || 0).toLocaleString(), balance: Number((payment.expectedAmount || 0) > payment.amount ? (payment.expectedAmount - payment.amount) : 0).toLocaleString(), currency: t('payments_page.currency') })}
            </div>
          </div>
        ) : (
          <div
            className="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
            style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
          >
            <div>
              <div className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.725rem', letterSpacing: '0.5px' }}>
                {t('payments_page.amount').toUpperCase()}
              </div>
              <div className="fs-3 fw-bold text-dark mt-1">
                {payment.amount ? `${Number(payment.amount).toLocaleString()} ${t('payments_page.currency')}` : t('payments_page.default_amount', { currency: t('payments_page.currency') })}
              </div>
            </div>
            <div>
              {getStatusBadge(payment.status)}
            </div>
          </div>
        )}

        {/* 2-Column Info Grid */}
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.member').toUpperCase()}</div>
            <div className="fw-bold text-dark">{payment.member || payment.memberName || t('payments_page.member')}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.group').toUpperCase()}</div>
            <div className="fw-bold text-dark">{payment.group || payment.groupName || '—'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.cycle').toUpperCase()}</div>
            <div className="fw-semibold text-dark">{cycleLabel}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.date').toUpperCase()}</div>
            <div className="fw-semibold text-dark">{payment.date || t('payments_page.not_available')}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.recorded_by').toUpperCase()}</div>
            <div className="fw-semibold text-dark">{payment.recordedBy === 'Organizer' ? t('payments_page.organizer') : payment.recordedBy || (isPaid ? t('payments_page.organizer') : '—')}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('payments_page.payment_method').toUpperCase()}</div>
            <div className="fw-semibold text-dark">{getPaymentMethodLabel(payment.method)}</div>
          </div>
        </div>

        {/* Notes / Remarks Box */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="text-uppercase text-muted small fw-bold mb-1" style={{ fontSize: '0.725rem' }}>
            {t('payments_page.notes_remarks').toUpperCase()}
          </div>
          <div className="small text-muted">
            {notesText}
          </div>
        </div>

        {/* Digital Payment Evidence / Bank Slip Box */}
        <div className="bg-white p-3 rounded-3 border mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase text-muted small fw-bold" style={{ fontSize: '0.725rem' }}>
              {t('payments_page.payment_evidence_bank_slip').toUpperCase()}
            </span>
            <span className={`badge ${attachedFiles.length > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border'} px-2 py-0.5 rounded-pill`} style={{ fontSize: '0.7rem' }}>
              {attachedFiles.length > 0 ? t('payments_page.slip_attached_count', { count: attachedFiles.length }) : t('payments_page.no_slip_attached')}
            </span>
          </div>

          {attachedFiles.length > 0 ? (
            <div className="d-flex flex-column gap-3 mb-2">
              {attachedFiles.map((fn, idx) => {
                const fileUrl = getFileUrl(fn);
                const isImg = isImageFile(fn);
                const fileName = typeof fn === 'string' ? fn.split('/').pop() : t('payments_page.evidence_slip');
                return (
                  <div key={idx} className="bg-light p-2.5 rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <Icon name={isImg ? 'image' : 'file-text'} size={18} className="text-primary flex-shrink-0" />
                        <span className="small text-truncate font-monospace fw-semibold" style={{ fontSize: '0.8rem' }} title={fileName}>
                          {fileName}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success-subtle text-success small">{t('payments_page.attached_slip')}</span>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline-primary py-0.5 px-2 small text-decoration-none"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {t('payments_page.open_full_slip')} ↗
                          </a>
                        )}
                      </div>
                    </div>
                    {isImg && fileUrl && (
                      <div className="text-center bg-white p-2 rounded-2 border">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={fileUrl}
                            alt={t('payments_page.payment_slip')}
                            className="img-fluid rounded"
                            style={{ maxHeight: '220px', objectFit: 'contain' }}
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
              {(payment.method || '').toLowerCase().includes('cash') && isPaid
                ? t('payments_page.cash_payment_note')
                : t('payments_page.no_slip_yet')}
            </div>
          )}

          {!((payment.method || '').toLowerCase().includes('cash') && isPaid) && (
            <div className="mt-2 text-end">
              <label className="btn btn-sm btn-outline-primary py-1 px-3 no-print cursor-pointer mb-0">
                <Icon name="paperclip" size={14} className="me-1" />
                <span>{uploading ? t('payments_page.uploading') : t('payments_page.attach_payment_slip')}</span>
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
            {t('payments_page.financial_discipline_impact')}
          </div>
          <div className="small text-primary" style={{ fontSize: '0.8rem' }}>
            {isPaid
              ? t('payments_page.on_time_impact')
              : t('payments_page.pending_impact')}
          </div>
        </div>

        {/* Official Print-Only Receipt Footer */}
        <div className="print-only text-center mt-4 pt-3 border-top text-muted small" style={{ fontSize: '0.75rem' }}>
          <div>{t('payments_page.digital_receipt_footer')}</div>
          <div>{t('payments_page.verified_receipt_footer')}</div>
        </div>
      </div>

      <div className="custom-modal-footer no-print">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          {t('payments_page.close')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary px-4 d-inline-flex align-items-center gap-2"
          onClick={handleDownloadReceipt}
        >
          <Icon name="download" size={16} />
          {t('payments_page.download_receipt')}
        </button>
        <button
          type="button"
          className="btn btn-teal px-4"
          onClick={() => window.print()}
        >
          {t('payments_page.print_receipt')}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;
