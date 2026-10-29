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
      alert(`Digital payment evidence "${file.name}" attached successfully!`);
    } catch (err) {
      console.error('Evidence upload failed', err);
      alert(`Failed to attach slip: ${err?.response?.data?.message || err?.message || 'Error uploading file'}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <span className="badge-paid">{t('status.PAID', 'Paid')}</span>;
      case 'LATE':
        return <span className="badge bg-warning text-dark px-2 py-1 rounded-2 fw-semibold" style={{ fontSize: '0.75rem' }}>{t('status.LATE', 'Paid (Late)')}</span>;
      case 'PENDING':
        return <span className="badge-pending">{t('status.PENDING', 'Pending')}</span>;
      case 'OVERDUE':
        return <span className="badge-overdue">{t('status.OVERDUE', 'Overdue')}</span>;
      case 'PARTIAL':
        return <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1 rounded-2" style={{ fontSize: '0.75rem' }}>{t('status.PARTIAL', 'Partial')}</span>;
      default:
        return <span className="badge-paid">{t(`status.${status}`, status || 'Paid')}</span>;
    }
  };

  const isPaid = payment.status?.toUpperCase() === 'PAID' || payment.status?.toUpperCase() === 'LATE';

  const handleDownloadReceipt = () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const receiptNumber = payment.id ? `PAY-${payment.id}` : 'PAY-101';
      const safeText = (value, fallback = 'N/A') => String(value || fallback);
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

      pdf.setProperties({ title: `Payment Receipt ${receiptNumber}`, subject: 'SeettuManager payment receipt' });
      pdf.setFillColor(19, 74, 90);
      pdf.rect(0, 0, pageWidth, 42, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('SeettuManager', margin, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Official Contribution Payment Receipt', margin, 26);
      pdf.setFontSize(9);
      pdf.text(`Receipt Ref: #${receiptNumber}`, margin, 34);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 34, { align: 'right' });

      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 222, 197);
      pdf.roundedRect(margin, 54, contentWidth, 30, 3, 3, 'FD');
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('AMOUNT', margin + 7, 63);
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      pdf.text(`${Number(payment.amount || 0).toLocaleString()} LKR`, margin + 7, 75);
      pdf.setFillColor(isPaid ? 22 : 245, isPaid ? 163 : 158, isPaid ? 74 : 11);
      pdf.roundedRect(pageWidth - margin - 31, 63, 24, 9, 4, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(safeText(payment.status, 'PAID').toUpperCase(), pageWidth - margin - 19, 69, { align: 'center' });

      pdf.setTextColor(19, 74, 90);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Payment Details', margin, 99);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, 103, pageWidth - margin, 103);

      const columnGap = 12;
      const columnWidth = (contentWidth - columnGap) / 2;
      let y = 113;
      const fields = [
        ['Member', payment.member || payment.memberName || 'N/A', 'Group', payment.group || payment.groupName || 'N/A'],
        ['Cycle', payment.cycle || 'N/A', 'Date', payment.date || 'N/A'],
        ['Recorded By', payment.recordedBy || (isPaid ? 'Organizer' : 'N/A'), 'Payment Method', payment.method || 'Cash (Offline)']
      ];

      fields.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
        const leftHeight = addField(leftLabel, leftValue, margin, y, columnWidth);
        const rightHeight = addField(rightLabel, rightValue, margin + columnWidth + columnGap, y, columnWidth);
        y = Math.max(leftHeight, rightHeight) + 8;
      });

      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      const notes = safeText(payment.notes, 'No extra notes recorded for this transaction.');
      const noteLines = pdf.splitTextToSize(notes, contentWidth - 14);
      const notesHeight = Math.max(25, 18 + noteLines.length * 5);
      pdf.roundedRect(margin, y, contentWidth, notesHeight, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('NOTES / REMARKS', margin + 7, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(noteLines, margin + 7, y + 15);

      const footerY = Math.min(y + notesHeight + 22, 275);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Generated electronically via SeettuManager Digital Discipline System', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('Verified by Group Organizer - Thank you for your contribution!', pageWidth / 2, footerY + 5, { align: 'center' });

      const fileName = `Payment_Receipt_${receiptNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to download payment receipt PDF', error);
      alert('Unable to download the payment receipt. Please try again.');
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
        <div className="small fw-semibold text-secondary">Official Contribution Payment Receipt</div>
        <div className="small text-muted mt-1">
          Receipt Ref: {payment.id ? `#PAY-${payment.id}` : '#PAY-101'} • Generated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="custom-modal-header no-print">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">{t('modals.payment_details.title', 'Payment Details')}</h5>
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
          style={{ backgroundColor: payment.status?.toUpperCase() === 'PARTIAL' ? '#FFFBEB' : '#F0FDF4', borderColor: payment.status?.toUpperCase() === 'PARTIAL' ? '#FDE68A' : '#BBF7D0' }}
        >
          <div>
            <div className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.725rem', letterSpacing: '0.5px' }}>
              {payment.status?.toUpperCase() === 'PARTIAL' ? 'AMOUNT PAID (PARTIAL)' : t('modals.payment_details.amount', 'AMOUNT')}
            </div>
            <div className="fs-3 fw-bold text-dark mt-1">
              {payment.amount ? `${Number(payment.amount).toLocaleString()} LKR` : '1,000 LKR'}
            </div>
            {payment.status?.toUpperCase() === 'PARTIAL' && payment.expectedAmount > payment.amount && (
              <div className="text-danger small fw-semibold mt-1">
                Expected: {Number(payment.expectedAmount).toLocaleString()} LKR &bull; Remaining Due: {Number(payment.expectedAmount - payment.amount).toLocaleString()} LKR
              </div>
            )}
          </div>
          <div>
            {getStatusBadge(payment.status)}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.member', 'MEMBER')}</div>
            <div className="fw-bold text-dark">{payment.member || payment.memberName || 'Kamala'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.group', 'GROUP')}</div>
            <div className="fw-bold text-dark">{payment.group || payment.groupName || '—'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.cycle', 'CYCLE')}</div>
            <div className="fw-semibold text-dark">{payment.cycle || 'Cycle 3'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.date', 'DATE')}</div>
            <div className="fw-semibold text-dark">{payment.date || '2026-03-15'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.recorded_by', 'RECORDED BY')}</div>
            <div className="fw-semibold text-dark">{payment.recordedBy || (isPaid ? 'Organizer' : '—')}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>{t('modals.payment_details.payment_method', 'PAYMENT METHOD')}</div>
            <div className="fw-semibold text-dark">{payment.method || 'Cash (Offline)'}</div>
          </div>
        </div>

        {/* Notes / Remarks Box */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="text-uppercase text-muted small fw-bold mb-1" style={{ fontSize: '0.725rem' }}>
            {t('modals.payment_details.notes', 'NOTES / REMARKS')}
          </div>
          <div className="small text-muted">
            {payment.notes || t('modals.payment_details.no_notes', 'No extra notes recorded for this transaction.')}
          </div>
        </div>

        {/* Digital Payment Evidence / Bank Slip Box */}
        <div className="bg-white p-3 rounded-3 border mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase text-muted small fw-bold" style={{ fontSize: '0.725rem' }}>
              {t('modals.payment_details.evidence', 'PAYMENT EVIDENCE / BANK SLIP')}
            </span>
            <span className={`badge ${attachedFiles.length > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border'} px-2 py-0.5 rounded-pill`} style={{ fontSize: '0.7rem' }}>
              {attachedFiles.length > 0 ? t('modals.payment_details.slips_attached', { count: attachedFiles.length, defaultValue: `${attachedFiles.length} Slip(s) Attached` }) : t('modals.payment_details.no_slip_attached', 'No Slip Attached')}
            </span>
          </div>

          {attachedFiles.length > 0 ? (
            <div className="d-flex flex-column gap-3 mb-2">
              {attachedFiles.map((fn, idx) => {
                const fileUrl = getFileUrl(fn);
                const isImg = isImageFile(fn);
                const fileName = typeof fn === 'string' ? fn.split('/').pop() : 'Evidence Slip';
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
                        <span className="badge bg-success-subtle text-success small">{t('modals.payment_details.verified', 'Attached Slip')}</span>
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
                    </div>
                    {isImg && fileUrl && (
                      <div className="text-center bg-white p-2 rounded-2 border">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={fileUrl}
                            alt="Payment Slip"
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
                ? t('modals.payment_details.cash_note', 'Handled via offline cash payment. Official electronic receipt is issued through the system (available for PDF download and printing below).')
                : t('modals.payment_details.no_slip_yet', 'No digital payment slip attached yet.')}
            </div>
          )}

          {!((payment.method || '').toLowerCase().includes('cash') && isPaid) && (
            <div className="mt-2 text-end">
              <label className="btn btn-sm btn-outline-primary py-1 px-3 no-print cursor-pointer mb-0">
                <Icon name="paperclip" size={14} className="me-1" />
                <span>{uploading ? t('modals.payment_details.uploading', 'Uploading...') : t('modals.payment_details.attach_slip', 'Attach Payment Slip')}</span>
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
            {t('modals.payment_details.discipline_impact', 'Financial Discipline Impact')}
          </div>
          <div className="small text-primary" style={{ fontSize: '0.8rem' }}>
            {isPaid
              ? t('modals.payment_details.on_time_impact', 'On-time payment recorded. Maintains member discipline score in EXCELLENT tier.')
              : t('modals.payment_details.pending_impact', 'Pending / Overdue contribution. Reminders can be issued by group organizer.')}
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
          {t('modals.payment_details.close', 'Close')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary px-4 d-inline-flex align-items-center gap-2"
          onClick={handleDownloadReceipt}
        >
          <Icon name="download" size={16} />
          {t('modals.payment_details.download_receipt', 'Download Receipt')}
        </button>
        <button
          type="button"
          className="btn btn-teal px-4"
          onClick={() => window.print()}
        >
          {t('modals.payment_details.print_receipt', 'Print Receipt')}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;
