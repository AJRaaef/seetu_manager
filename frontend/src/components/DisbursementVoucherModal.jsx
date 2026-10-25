import React from 'react';
import { Modal } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import Icon from './Icons';

const DisbursementVoucherModal = ({ show, onHide, cycle, group, organizerName }) => {
  if (!cycle || !group) return null;

  const memberCount = group.memberCount || group.members?.length || 1;
  const contributionAmount = group.contributionAmount || 0;
  const totalPot = contributionAmount * memberCount;
  const voucherRef = `VCH-${group.id || 1}-C${cycle.cycleNumber || 1}-${Date.now().toString().slice(-4)}`;
  const beneficiaryName = cycle.payoutMember?.fullName || cycle.payoutMemberName || 'Designated Beneficiary';
  const beneficiaryNic = cycle.payoutMember?.nicNumber || 'Verified on file';
  const beneficiaryPhone = cycle.payoutMember?.phone || '—';
  const isCompleted = cycle.status === 'COMPLETED';

  const handleDownloadPdf = () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Header Banner
      pdf.setFillColor(19, 74, 90);
      pdf.rect(0, 0, pageWidth, 42, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('SeettuManager', margin, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Official Rotational Payout & Disbursement Voucher', margin, 26);
      pdf.setFontSize(8.5);
      pdf.text(`Voucher Ref: #${voucherRef}`, margin, 34);
      pdf.text(`Issued: ${new Date().toLocaleDateString()}`, pageWidth - margin, 34, { align: 'right' });

      // Pot Amount Box
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 222, 197);
      pdf.roundedRect(margin, 52, contentWidth, 30, 3, 3, 'FD');
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('AUTHORIZED ROTATIONAL PAYOUT POT', margin + 8, 61);
      pdf.setTextColor(22, 101, 52);
      pdf.setFontSize(20);
      pdf.text(`${totalPot.toLocaleString()} LKR`, margin + 8, 73);

      // Status Badge in Pot Box
      pdf.setFillColor(22, 163, 74);
      pdf.roundedRect(pageWidth - margin - 42, 61, 34, 9, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(isCompleted ? 'DISBURSED' : 'ALLOCATED', pageWidth - margin - 25, 67, { align: 'center' });

      // Section: Beneficiary & Circle Details
      let y = 96;
      pdf.setTextColor(19, 74, 90);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Disbursement & Beneficiary Details', margin, y);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y + 4, pageWidth - margin, y + 4);

      y += 14;
      const colWidth = (contentWidth - 10) / 2;

      const addField = (lbl, val, x, curY) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(lbl.toUpperCase(), x, curY);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(31, 41, 55);
        pdf.text(String(val || '—'), x, curY + 6);
      };

      // Row 1
      addField('Beneficiary Subscriber', beneficiaryName, margin, y);
      addField('Seettu Circle', group.name || 'Seettu Circle', margin + colWidth + 10, y);
      y += 18;

      // Row 2
      addField('National Identity Card (NIC)', beneficiaryNic, margin, y);
      addField('Cycle Turn', `Cycle #${cycle.cycleNumber} of ${memberCount}`, margin + colWidth + 10, y);
      y += 18;

      // Row 3
      addField('Contact Phone', beneficiaryPhone, margin, y);
      addField('Cycle Validity Period', `${cycle.startDate || '—'} to ${cycle.endDate || '—'}`, margin + colWidth + 10, y);
      y += 18;

      // Row 4
      addField('Total Circle Subscribers', `${memberCount} Registered Members`, margin, y);
      addField('Individual Contribution', `${contributionAmount.toLocaleString()} LKR / cycle`, margin + colWidth + 10, y);
      y += 24;

      // Legal & Transparency Certification Box
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(19, 74, 90);
      pdf.text('LEGAL COMPLIANCE & TRANSPARENCY AUDIT DECLARATION', margin + 7, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      const declaration = `This electronic voucher certifies that the total rotational pool for Cycle #${cycle.cycleNumber} was fully settled and officially disbursed to the beneficiary subscriber in accordance with the registered bylaws of this Seettu circle and in alignment with the principles of The Cheetus Ordinance No. 61 of 1935 (Sri Lanka).`;
      const splitDec = pdf.splitTextToSize(declaration, contentWidth - 14);
      pdf.text(splitDec, margin + 7, y + 15);

      // Signatures
      y += 48;
      pdf.setDrawColor(148, 163, 184);
      pdf.line(margin + 10, y, margin + 60, y);
      pdf.line(pageWidth - margin - 60, y, pageWidth - margin - 10, y);
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Authorized Circle Organizer', margin + 35, y + 5, { align: 'center' });
      pdf.text('Beneficiary Subscriber Signature', pageWidth - margin - 35, y + 5, { align: 'center' });

      // Footer
      const footerY = 280;
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Generated electronically via SeettuManager Digital Discipline System • Valid for audit and member inspection.', pageWidth / 2, footerY, { align: 'center' });

      pdf.save(`Payout_Voucher_Cycle_${cycle.cycleNumber}_${group.name?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to download voucher PDF', err);
      alert('Failed to generate PDF voucher. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="custom-modal-content border-0 shadow-lg">
      <div className="custom-modal-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ backgroundColor: '#134A5A', width: '36px', height: '36px' }}
          >
            <Icon name="award" size={18} color="#FFFFFF" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>
              Rotational Payout & Disbursement Voucher
            </h5>
            <span className="text-muted small">
              Ref: #{voucherRef} • {group.name} (Cycle #{cycle.cycleNumber})
            </span>
          </div>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="custom-modal-body p-4">
        {/* Pot Amount Banner */}
        <div
          className="p-3.5 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
          style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <div>
            <div className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              AUTHORIZED ROTATIONAL PAYOUT POT
            </div>
            <div className="fs-2 fw-bold text-success mt-0.5">
              {totalPot.toLocaleString()} LKR
            </div>
          </div>
          <div className="text-end">
            <span className={`badge ${isCompleted ? 'bg-success' : 'bg-warning text-dark'} px-3 py-1.5 rounded-pill fw-semibold`} style={{ fontSize: '0.8rem' }}>
              {isCompleted ? 'Disbursed & Completed' : 'Allocated Payout Turn'}
            </span>
            <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              Cycle #{cycle.cycleNumber} of {memberCount}
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="row g-3 mb-3">
          {/* Beneficiary Card */}
          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="text-uppercase text-muted fw-bold small d-block mb-2" style={{ fontSize: '0.72rem' }}>
                BENEFICIARY SUBSCRIBER (RECIPIENT)
              </span>
              <h5 className="fw-bold text-dark mb-1">{beneficiaryName}</h5>
              <div className="small text-muted mb-1">
                NIC: <strong className="text-dark font-monospace">{beneficiaryNic}</strong>
              </div>
              <div className="small text-muted">
                Phone: <span className="text-dark">{beneficiaryPhone}</span>
              </div>
              <div className="mt-2 pt-2 border-top small text-success fw-semibold">
                ✓ Payout turn verified and registered in rotation schedule
              </div>
            </div>
          </div>

          {/* Circle Metadata Card */}
          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="text-uppercase text-muted fw-bold small d-block mb-2" style={{ fontSize: '0.72rem' }}>
                CIRCLE & DISBURSEMENT TERMS
              </span>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Circle Name:</span>
                <span className="fw-semibold text-dark">{group.name}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Circle Organizer:</span>
                <span className="fw-semibold text-dark">{organizerName || group.organizerName || 'Circle Organizer'}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom small">
                <span className="text-muted">Subscribers:</span>
                <span className="fw-semibold text-dark">{memberCount} Members</span>
              </div>
              <div className="d-flex justify-content-between py-1 small">
                <span className="text-muted">Cycle Dates:</span>
                <span className="fw-semibold text-dark">{cycle.startDate} to {cycle.endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Transparency Audit Notice */}
        <div className="p-3 rounded-3 border mb-2" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="shield" size={16} color="#134A5A" />
            <span className="fw-bold small text-dark" style={{ fontSize: '0.8rem' }}>
              Transparency & Circle-Wide Verification Guarantee
            </span>
          </div>
          <p className="small text-muted mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
            This electronic verification document certifies that the total rotational fund for Cycle #{cycle.cycleNumber} was collected and disbursed in full compliance with registered group rules and The Cheetus Ordinance No. 61 of 1935. All members of this Seettu circle have mutual transparency to audit this transaction.
          </p>
        </div>
      </div>

      <div className="custom-modal-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center border-top">
        <button type="button" className="btn btn-outline-secondary px-3" onClick={onHide}>
          Close
        </button>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-primary px-3 d-inline-flex align-items-center gap-1.5"
            onClick={handleDownloadPdf}
          >
            <Icon name="download" size={15} />
            <span>Download PDF Voucher</span>
          </button>
          <button
            type="button"
            className="btn btn-teal px-4 d-inline-flex align-items-center gap-1.5 shadow-sm"
            onClick={() => window.print()}
          >
            <Icon name="printer" size={15} />
            <span>Print Voucher</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DisbursementVoucherModal;
