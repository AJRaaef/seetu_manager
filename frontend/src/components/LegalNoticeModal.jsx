import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';
import { sendDirectNotification } from '../api/notificationApi';

const LegalNoticeModal = ({ show, onHide, payment, organizerName = 'Group Organizer' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!payment) return null;

  const memberName = payment.member || payment.memberName || 'Subscriber';
  const amount = payment.amount ? Number(payment.amount).toLocaleString() : '0';
  const cycleName = payment.cycle || 'Scheduled Cycle';
  const groupName = payment.group || payment.groupName || 'Seettu Circle';
  const dueDate = payment.date || new Date().toISOString().split('T')[0];
  const refNumber = `LOD/SL-SEETTU/${new Date().getFullYear()}/${payment.id || Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const cureDeadline = new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const legalNoticeText = `=====================================================
FORMAL STATUTORY NOTICE OF DEFAULT & DEMAND FOR IMMEDIATE PAYMENT
Issued under The Cheetus Ordinance No. 61 of 1935 (Chapter 190)
=====================================================
Notice Reference: ${refNumber}
Date of Issuance: ${issueDate}

TO:
Subscriber Name: ${memberName}
Contact / Phone: ${payment.memberPhone || 'On Platform Record'}
Circle Enrollment: ${groupName}

RE: FORMAL DEMAND TO CURE PAYMENT DEFAULT — ${cycleName}

1. TAKE NOTICE that pursuant to your binding Seettu Agreement and statutory duties under The Cheetus Ordinance No. 61 of 1935, you were obligated to remit the monthly contribution installment of LKR ${amount} on or before ${dueDate}.

2. TO DATE, our immutable platform ledger records confirm that despite previous administrative reminders, you have failed and neglected to tender the said installment of LKR ${amount}, thereby committing an actionable breach of mutual contract.

3. YOU ARE HEREBY GIVEN FORMAL NOTICE to cure this default within SEVEN (7) DAYS of this notice (on or before ${cureDeadline}) by depositing the full outstanding sum of LKR ${amount} and uploading verified bank evidence or securing an official receipt.

4. TAKE FURTHER NOTICE that in the event of your failure to cure this default on or before ${cureDeadline}:
   (a) Under Section 16 of The Cheetus Ordinance and the Civil Procedure Code of Sri Lanka, the organizer reserves the right to declare the entire remaining consolidated balance of all future installments immediately due and payable;
   (b) Summary legal debt recovery proceedings will be filed against you in the competent District Court or referred to the Divisional Mediation Board (Samatha Mandalaya) for recovery of principal, accrued statutory damages, and legal costs;
   (c) Your registered trusted guarantors will be held co-extensively liable for all defaulted sums;
   (d) Your SeettuManager platform access will be frozen and your profile reported to communal risk registries.

5. Pursuant to Section 4 of the Electronic Transactions Act No. 19 of 2006, all cryptographic audit trails, timestamped logs, and digital delivery confirmations maintained by SeettuManager are admissible as primary evidence in Sri Lankan courts.

ISSUED BY:
${organizerName}
Circle Organizer / Scheme Manager
SeettuManager Platform
=====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(legalNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDispatchInApp = async () => {
    if (!payment.memberId) {
      alert('Member ID is missing. Notice can be printed or copied.');
      return;
    }
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      await sendDirectNotification({
        userId: payment.memberId,
        message: `[LEGAL NOTICE OF DEFAULT] Ref: ${refNumber}. Demand to settle defaulted installment of LKR ${amount} for ${cycleName} within 7 days under The Cheetus Ordinance No. 61 of 1935.`,
        type: 'OVERDUE'
      });
      setSuccessMsg('Formal legal warning successfully dispatched to subscriber portal.');
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch (err) {
      console.error('Failed to dispatch legal notification:', err);
      alert('Failed to send in-app notification. Please use Print or Copy text.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 text-white d-flex justify-content-between align-items-start" style={{ backgroundColor: '#134A5A' }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger text-white border border-danger-subtle font-monospace px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                STATUTORY DEMAND
              </span>
              <span className="text-white-50 small">Chapter 190 • The Cheetus Ordinance</span>
            </div>
            <h4 className="fw-bold mb-0 text-white">Notice of Default & Demand for Payment</h4>
            <div className="text-white-50 small mt-1 font-monospace">Ref: {refNumber}</div>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-4 bg-light">
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-3 py-2 px-3 small border-0 rounded-3">
              <Icon name="check" size={16} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Printable Legal Document Sheet */}
          <div 
            className="p-4 p-md-5 bg-white border rounded-3 shadow-xs position-relative"
            id="printable-legal-notice"
            style={{ 
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: 1.6,
              color: '#111827'
            }}
          >
            {/* Document Header */}
            <div className="text-center border-bottom pb-4 mb-4">
              <h5 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
                DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
              </h5>
              <h4 className="fw-bold text-uppercase text-danger mb-1" style={{ letterSpacing: '1.5px' }}>
                FORMAL NOTICE OF DEFAULT & DEMAND FOR IMMEDIATE PAYMENT
              </h4>
              <p className="mb-0 small text-muted font-monospace">
                Pursuant to Section 16 of The Cheetus Ordinance No. 61 of 1935 (Chapter 190) & Electronic Transactions Act No. 19 of 2006
              </p>
              <div className="d-flex justify-content-between text-muted small mt-3 pt-2 border-top">
                <span><strong>Notice Ref:</strong> {refNumber}</span>
                <span><strong>Date of Service:</strong> {issueDate}</span>
              </div>
            </div>

            {/* Parties Particulars */}
            <div className="row g-3 mb-4 pb-3 border-bottom font-sans-serif" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="col-md-6 border-end">
                <small className="text-secondary fw-bold text-uppercase d-block" style={{ fontSize: '0.72rem' }}>To Defaulting Subscriber:</small>
                <h5 className="fw-bold text-dark mt-1 mb-0">{memberName}</h5>
                <div className="text-muted small mt-1">Telephone: {payment.memberPhone || 'Registered On-File'}</div>
                <div className="text-muted small">Registered Circle: <strong>{groupName}</strong></div>
              </div>
              <div className="col-md-6 ps-md-4">
                <small className="text-secondary fw-bold text-uppercase d-block" style={{ fontSize: '0.72rem' }}>Issued By / Organizer:</small>
                <h5 className="fw-bold text-dark mt-1 mb-0">{organizerName}</h5>
                <div className="text-muted small mt-1">Designation: <strong>Authorized Scheme Manager</strong></div>
                <div className="text-muted small">Digital Verification: <strong>SeettuManager Ledger Verified</strong></div>
              </div>
            </div>

            {/* Formal Demand Body */}
            <div className="mb-4 text-dark" style={{ fontSize: '0.95rem' }}>
              <p className="mb-3">
                <strong>1. RE: UNPAID SEETTU CONTRIBUTION FOR {cycleName.toUpperCase()}:</strong><br />
                WHEREAS by mutual agreement entered under Sri Lankan law and The Cheetus Ordinance, you are an enrolled subscriber in <strong>{groupName}</strong> obligated to contribute the sum of <strong>LKR {amount}</strong> on or before <strong>{dueDate}</strong>.
              </p>

              <p className="mb-3">
                <strong>2. RECORD OF DEFAULT:</strong><br />
                AND WHEREAS our immutable platform transaction records confirm that you have neglected and failed to tender the installment of <strong>LKR {amount}</strong>, despite automated cycle notifications and administrative payment reminders.
              </p>

              <div className="p-3 my-3 bg-light border-start border-4 border-danger rounded-2 font-sans-serif" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small text-uppercase fw-bold">Outstanding Installment Balance</span>
                    <h3 className="fw-bold text-danger mb-0">LKR {amount}</h3>
                  </div>
                  <div className="text-end">
                    <span className="text-secondary small text-uppercase fw-bold">Mandatory Cure Deadline</span>
                    <h5 className="fw-bold text-dark mb-0">{cureDeadline}</h5>
                    <small className="text-danger fw-semibold">(7 Days from Service)</small>
                  </div>
                </div>
              </div>

              <p className="mb-3">
                <strong>3. STATUTORY DEMAND TO CURE:</strong><br />
                YOU ARE HEREBY REQUIRED AND CALLED UPON to pay and discharge the aforesaid sum of <strong>LKR {amount}</strong> in full within <strong>SEVEN (7) DAYS</strong> from the date hereof, on or before <strong>{cureDeadline}</strong>, and to upload verified deposit evidence or secure an official organizer receipt.
              </p>

              <p className="mb-3">
                <strong>4. LEGAL CONSEQUENCES OF CONTINUED DEFAULT:</strong><br />
                TAKE NOTICE that should you fail, neglect, or refuse to settle the aforesaid sum on or before the said deadline:
              </p>
              <ul className="mb-3 ps-4">
                <li>
                  <strong>Consolidated Debt Acceleration:</strong> Under Section 16 of The Cheetus Ordinance, the scheme manager will accelerate and demand the immediate consolidated payment of all remaining cycle installments under the scheme.
                </li>
                <li>
                  <strong>Civil Summary Recovery:</strong> A summary plaint will be instituted against you in the competent District Court of Sri Lanka or lodged before the Divisional Mediation Board (Samatha Mandalaya) for recovery of the full claim, interest, and legal costs.
                </li>
                <li>
                  <strong>Guarantor Enforcement:</strong> Registered neighborhood co-signers and guarantors will be immediately notified and held co-extensively liable for debt recovery.
                </li>
                <li>
                  <strong>Platform Blacklisting:</strong> Your profile will be permanently flagged as default risk and restricted from rotating savings circles nationwide.
                </li>
              </ul>

              <p className="mb-0 text-muted small fst-italic">
                <strong>Legal Evidence Notice:</strong> Pursuant to Section 4 of the Electronic Transactions Act No. 19 of 2006, cryptographic audit trails, timestamped ledger records, and notification receipts generated by SeettuManager are admissible as primary evidence in judicial tribunals.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-top mt-4 font-sans-serif" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="text-muted small">Place: Sri Lanka</div>
                  <div className="text-muted small">Date: {issueDate}</div>
                </div>
                <div className="text-center" style={{ minWidth: '220px' }}>
                  <div className="border-bottom border-dark pb-1 mb-1 fw-bold text-dark">
                    {organizerName}
                  </div>
                  <small className="text-muted d-block">Authorized Circle Organizer</small>
                  <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>SEETTUMANAGER AUDIT CERTIFIED</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer border-top p-3 bg-white d-flex justify-content-between">
          <button type="button" className="btn btn-secondary px-3" onClick={onHide}>
            Close
          </button>

          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-outline-dark px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              onClick={handleCopy}
            >
              <Icon name="file-text" size={15} />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Legal Notice Text'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-outline-danger px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              onClick={handleDispatchInApp}
              disabled={isSubmitting}
            >
              <Icon name="bell" size={15} />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch In-App Notice'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-teal text-white px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#134A5A' }}
              onClick={handlePrint}
            >
              <Icon name="print" size={16} />
              <span>Print Legal Demand (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LegalNoticeModal;
