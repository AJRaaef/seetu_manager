import React, { useState, useEffect } from 'react';
import Icon from './Icons';

export const LegalPoliciesModal = ({ isOpen, onClose, onAccept, initialTab = 'rules' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasAgreed, setHasAgreed] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'rules', label: 'Member Enrollment Rules', icon: 'user-check', badge: 'Mandatory' },
    { id: 'chit-law', label: 'Seettu Law & Governance', icon: 'scale', badge: 'Sri Lanka' },
    { id: 'privacy', label: 'Privacy & Policy', icon: 'shield', badge: 'Data Protection' },
    { id: 'terms', label: 'Terms & Conditions', icon: 'file-text', badge: 'Agreement' },
    { id: 'cancellation', label: 'Cancellation Policy', icon: 'x', badge: 'Exit Rules' },
    { id: 'refund', label: 'Refund Policy', icon: 'refresh', badge: 'Settlement' },
    { id: 'complaints', label: 'Complaints & Disputes', icon: 'alert-circle', badge: 'Resolution' },
    { id: 'disclaimer', label: 'Disclaimer', icon: 'info', badge: 'Non-Custodial' }
  ];

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(15, 47, 61, 0.75)', zIndex: 1060, backdropFilter: 'blur(3px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* Modal Header */}
          <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#0F2F3D' }}>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: '#0097B2', width: '40px', height: '40px' }}
              >
                <Icon name="shield" size={22} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '1.2rem' }}>
                  SeettuManager Legal, Compliance & Community Rules
                </h5>
                <small className="text-white-50" style={{ fontSize: '0.8rem' }}>
                  Sri Lanka Traditional Rotating Savings System Governance & Member Agreements
                </small>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white shadow-none" 
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Modal Body with 2-Column Tab Layout */}
          <div className="modal-body p-0">
            <div className="row g-0 h-100">
              
              {/* Sidebar Nav */}
              <div className="col-md-4 col-lg-3 bg-light border-end p-3">
                <div className="nav flex-column gap-1.5" role="tablist">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn text-start d-flex align-items-center justify-content-between p-2.5 rounded-2 border-0 w-100 transition-all ${
                          isActive ? 'bg-white shadow-xs fw-bold' : 'text-secondary hover-bg'
                        }`}
                        style={{
                          backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                          color: isActive ? '#003847' : '#475569',
                          borderLeft: isActive ? '3.5px solid #0097B2' : '3.5px solid transparent'
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Icon name={tab.icon} size={16} color={isActive ? '#0097B2' : '#64748B'} />
                          <span style={{ fontSize: '0.85rem' }}>{tab.label}</span>
                        </div>
                        <span 
                          className={`badge rounded-pill ${isActive ? 'text-white' : 'text-muted bg-white'}`}
                          style={{ 
                            fontSize: '0.65rem', 
                            backgroundColor: isActive ? '#0097B2' : '#E2E8F0',
                            fontWeight: 600
                          }}
                        >
                          {tab.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 rounded-3 border bg-white small text-muted">
                  <div className="fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                    <Icon name="phone" size={14} color="#0097B2" />
                    Legal Helpline
                  </div>
                  <div>Colombo, Sri Lanka</div>
                  <div className="fw-semibold text-primary" style={{ color: '#0097B2' }}>+94 75 297 5632</div>
                  <div className="text-muted small">seetumanager@gmail.com</div>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="col-md-8 col-lg-9 p-4 p-md-5 overflow-y-auto" style={{ maxHeight: '68vh' }}>
                
                {/* 1. Member Enrollment Rules */}
                {activeTab === 'rules' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0097B2', width: '44px', height: '44px' }}>
                        <Icon name="user-check" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Member Enrollment Agreement & Rules</h4>
                        <small className="text-muted">Mandatory commitments required before joining or organizing any Seettu group</small>
                      </div>
                    </div>

                    <div className="alert alert-warning border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#FFF8E1', color: '#7A5A00', borderLeft: '4px solid #FFB020' }}>
                      <Icon name="alert-circle" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Important Legal Commitment:</strong> By enrolling in a Seettu group, you enter into a legally binding communal mutual contract with the group organizer and fellow circle members governed by Sri Lankan common law and the Cheetus Ordinance.
                      </div>
                    </div>

                    {/* Section 1 */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                        Punctuality of Contributions & Slip Upload SLA
                      </h6>
                      <p className="text-secondary small mb-2 leading-relaxed">
                        Every member agrees to deposit their agreed installment amount on or before the cycle due date (weekly, bi-weekly, or monthly). Proof of payment (bank slip upload or organizer cash receipt) must be recorded in the system within <strong>24 hours</strong> of payment.
                      </p>
                      <div className="d-flex flex-wrap gap-2 pt-1">
                        <span className="badge bg-white text-dark border px-2 py-1 small">● Weekly Cycles: Due every Sunday</span>
                        <span className="badge bg-white text-dark border px-2 py-1 small">● Monthly Cycles: Due by 5th of Month</span>
                        <span className="badge bg-white text-dark border px-2 py-1 small">● Slip Verification: Max 24h SLA</span>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                        Algorithmic Financial Discipline Score Impact
                      </h6>
                      <p className="text-secondary small mb-2 leading-relaxed">
                        Every member's payment reliability is continuously evaluated on an objective 0–100 scale:
                      </p>
                      <div className="p-3 bg-white rounded-3 border font-monospace small mb-3 text-dark fw-semibold shadow-xs">
                        Score = max(0, 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)])
                      </div>
                      
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <div className="p-2.5 rounded-2 bg-white border small">
                            <span className="badge bg-success text-white mb-1">90–100: Platinum Trust</span>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Eligible for early cycle rotation draws & premium pools.</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="p-2.5 rounded-2 bg-white border small">
                            <span className="badge bg-info text-white mb-1">75–89: Reliable</span>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Standard rotation eligibility with zero deposit holds.</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="p-2.5 rounded-2 bg-white border small">
                            <span className="badge bg-warning text-dark mb-1">50–74: Monitored</span>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Requires co-guarantor confirmation for high-value pools.</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="p-2.5 rounded-2 bg-white border small">
                            <span className="badge bg-danger text-white mb-1">&lt; 50: High-Risk Default</span>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>Restricted from early payouts & future circle enrollment.</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                        Continuous Legal Obligation After Receiving Payout
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Receiving a pooled lump-sum payout in an earlier cycle <strong>does not</strong> release the member from their obligation. The member remains strictly bound under civil contract to pay all subsequent cycle installments until the full circle completes. Defaulters will be reported to the platform dispute register and subject to community legal recovery.
                      </p>
                    </div>

                    {/* Section 4 */}
                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                        Identity Verification & Trusted Guarantors
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Organizers hold statutory authority to verify valid National Identity Card (NIC) credentials and require trusted neighborhood guarantors prior to confirming enrollment in high-value monetary or gold seettu groups.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Seettu Law & Governance */}
                {activeTab === 'chit-law' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#003847', width: '44px', height: '44px' }}>
                          <Icon name="scale" size={22} />
                        </div>
                        <div>
                          <h4 className="fw-bold mb-0 text-dark">Sri Lanka Seettu Law & Statutory Governance</h4>
                          <small className="text-muted">The Cheetus Ordinance No. 61 of 1935 (Chapter 190)</small>
                        </div>
                      </div>
                      <a 
                        href="/law" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm px-3 fw-bold text-white d-inline-flex align-items-center gap-1.5 shadow-sm"
                        style={{ backgroundColor: '#0097B2' }}
                      >
                        Open Full Law Page ↗
                      </a>
                    </div>

                    <div className="alert alert-info border-0 p-3 rounded-3 mb-4 small" style={{ backgroundColor: '#E6F7F9', color: '#003847', borderLeft: '4px solid #0097B2' }}>
                      <strong>Statutory Framework:</strong> Governed by <strong>Chapter 190 (The Cheetus Ordinance)</strong> under the oversight of the <strong>Department of the Registrar of Companies (DRC), Sri Lanka</strong>, with digital electronic enforceability under the <strong>Electronic Transactions Act No. 19 of 2006</strong>.
                    </div>

                    {/* Chapter I */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white px-2.5 py-1" style={{ backgroundColor: '#003847', fontSize: '0.72rem' }}>CHAPTER I</span>
                        <span className="text-muted small">Sections 1–3</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">Preliminary & Statutory Definitions</h6>
                      <ul className="text-secondary small mb-0 ps-3">
                        <li className="mb-1"><strong>Section 1 (Jurisdiction):</strong> Extends across all 9 Provinces of Sri Lanka to all Rotating Savings and Credit Associations (ROSCAs).</li>
                        <li className="mb-1"><strong>Section 2 (Cheetu / Seettu):</strong> An arrangement where members contribute equal periodic installments to a designated manager for rotational distribution.</li>
                        <li><strong>Section 3 (Essential Terms):</strong> Fixed member count, fixed installment amount, regular intervals, and predetermined rotation order.</li>
                      </ul>
                    </div>

                    {/* Chapter II */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white px-2.5 py-1" style={{ backgroundColor: '#003847', fontSize: '0.72rem' }}>CHAPTER II</span>
                        <span className="text-muted small">Sections 4–6</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">Formation, Registration & Digital Enforceability</h6>
                      <ul className="text-secondary small mb-0 ps-3">
                        <li className="mb-1"><strong>Section 4 (Non-Custodial Principle):</strong> Under Banking Act No. 30 of 1988, SeettuManager operates as an impartial digital record-keeper and does not hold member funds in custody.</li>
                        <li><strong>Section 5 (Digital Contracts):</strong> Pursuant to Electronic Transactions Act No. 19 of 2006, digital Seettu agreements, bank slip uploads, and electronic consents hold full legal validity in Sri Lankan tribunals.</li>
                      </ul>
                    </div>

                    {/* Chapter III */}
                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white px-2.5 py-1" style={{ backgroundColor: '#003847', fontSize: '0.72rem' }}>CHAPTER III</span>
                        <span className="text-muted small">Sections 7–10</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">Rights & Fiduciary Duties of the Manager</h6>
                      <ul className="text-secondary small mb-0 ps-3">
                        <li className="mb-1"><strong>Section 7 (Accountability):</strong> The organizer acts as a fiduciary and is legally accountable to every subscriber for ledger accuracy.</li>
                        <li className="mb-1"><strong>Section 8 (5-Year Ledger Retention):</strong> Digital ledgers, deposit slip photos, and payout records must be maintained with tamper-proof timestamps for at least five (5) years.</li>
                        <li><strong>Section 9 (Prompt Payout Duty):</strong> Upon collection of cycle installments, the pooled payout must be disbursed to the prized member within 7 days.</li>
                      </ul>
                    </div>

                    {/* Chapter IV & V */}
                    <div className="card border-0 bg-light rounded-3 p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white px-2.5 py-1" style={{ backgroundColor: '#003847', fontSize: '0.72rem' }}>CHAPTER IV & V</span>
                        <span className="text-muted small">Sections 11–19</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">Subscriber Rights & Summary Legal Recovery</h6>
                      <ul className="text-secondary small mb-0 ps-3">
                        <li className="mb-1"><strong>Continuous Debt Obligation:</strong> Prized subscribers remain civilly liable for all remaining installments until circle conclusion.</li>
                        <li><strong>Summary Legal Recovery:</strong> Defaulters are subject to expedited summary recovery under the Civil Procedure Code of Sri Lanka based on immutable digital ledger audit logs.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. Privacy & Policy */}
                {activeTab === 'privacy' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0097B2', width: '44px', height: '44px' }}>
                        <Icon name="shield" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Privacy & Personal Data Protection Policy</h4>
                        <small className="text-muted">Compliant with the Personal Data Protection Act (PDPA) No. 9 of 2022 of Sri Lanka</small>
                      </div>
                    </div>

                    <div className="alert alert-success border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', borderLeft: '4px solid #2E7D32' }}>
                      <Icon name="shield" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>PDPA Statutory Compliance:</strong> SeettuManager adheres strictly to Sri Lanka's <strong>Personal Data Protection Act No. 9 of 2022</strong>. We implement end-to-end data encryption, strict purpose limitation, and role-based access control.
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="card border-0 bg-light rounded-3 p-3 h-100">
                          <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                            <Icon name="user-check" size={16} color="#0097B2" />
                            1. Data Categories Collected
                          </h6>
                          <ul className="text-secondary small mb-0 ps-3">
                            <li className="mb-1"><strong>Account Profile:</strong> Legal name, mobile phone number, email address, language preferences.</li>
                            <li className="mb-1"><strong>Verification:</strong> National Identity Card (NIC) number and proof of residency.</li>
                            <li><strong>Financial Slips:</strong> Bank deposit receipts, transfer transaction IDs, and cycle contribution timestamps.</li>
                          </ul>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 bg-light rounded-3 p-3 h-100">
                          <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                            <Icon name="lock" size={16} color="#0097B2" />
                            2. Strict Purpose Limitation
                          </h6>
                          <p className="text-secondary small mb-0 leading-relaxed">
                            Your data is used <strong>solely</strong> for calculating Financial Discipline Scores, sending automated WhatsApp/SMS payment reminders, generating verified group balance sheets, and resolving dispute claims.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <Icon name="shield" size={16} color="#0097B2" />
                        3. Zero Third-Party Commercial Monetization
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        We never sell, rent, license, or monetize member personal information, phone numbers, or transaction histories to third-party advertisers, credit scoring agencies, or commercial telemarketers. Your records are visible only to verified participants within your specific Seettu circle.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <Icon name="file-text" size={16} color="#0097B2" />
                        4. Retention & Account Erasure Rights
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        In accordance with Sri Lankan financial record-keeping standards, circle ledgers and bank slip archives are preserved for <strong>5 years</strong>. Members possess the statutory right to request full account data deletion once all enrolled circles have successfully concluded with zero outstanding debts.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Terms & Conditions */}
                {activeTab === 'terms' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0F2F3D', width: '44px', height: '44px' }}>
                        <Icon name="file-text" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Platform Terms & Conditions</h4>
                        <small className="text-muted">User agreement governing access to SeettuManager web and mobile services</small>
                      </div>
                    </div>

                    <div className="alert alert-secondary border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#F1F5F9', color: '#1E293B', borderLeft: '4px solid #0F2F3D' }}>
                      <Icon name="file-text" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>User Agreement:</strong> By registering or accessing SeettuManager, you agree to comply with all platform operational guidelines, statutory rules, and community conduct standards.
                      </div>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                        User Eligibility & Account Security
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Users must be at least 18 years of age and legally competent to enter into contracts under the Law of Sri Lanka. Users are exclusively responsible for maintaining the confidentiality of their passwords and two-factor authentication tokens.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                        Truthful Documentation & Fraud Zero-Tolerance
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Uploading forged deposit slips, manipulated transaction screenshots, or fictitious bank references constitutes criminal fraud under the Penal Code of Sri Lanka. Any member submitting fraudulent records will face immediate account termination, forfeiture of platform standing, and referral to law enforcement authorities.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                        Non-Custodial Architecture Declaration
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        SeettuManager provides cloud-based administrative software for record-keeping and cycle coordination. The platform never pools, touches, manages, or holds member funds in custody. All financial transactions occur directly between member and organizer bank accounts.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                        Trilingual Availability & Language Precedence
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        To serve all Sri Lankan communities, SeettuManager provides full trilingual interfaces in English, Sinhala (සිංහල), and Tamil (தமிழ்). In the event of any interpretive dispute regarding statutory terminology, the English legal text shall prevail.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Cancellation Policy */}
                {activeTab === 'cancellation' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#DC2626', width: '44px', height: '44px' }}>
                        <Icon name="x" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Cancellation & Member Exit Policy</h4>
                        <small className="text-muted">Procedures and conditions for withdrawing from an active Seettu circle</small>
                      </div>
                    </div>

                    <div className="alert alert-danger border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderLeft: '4px solid #DC2626' }}>
                      <Icon name="alert-circle" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Critical Protection Notice:</strong> In a rotating savings circle, each member's payment directly funds another member's lump-sum payout. Unauthorized withdrawal disrupts the entire pool and is subject to strict community exit protocols.
                      </div>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-primary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 1</span>
                        Pre-Prized Exit (Before Receiving Any Payout)
                      </h6>
                      <p className="text-secondary small mb-2 leading-relaxed">
                        If a non-prized member who has not yet received a payout experiences genuine personal hardship and must exit, they must:
                      </p>
                      <ul className="text-secondary small mb-0 ps-3">
                        <li className="mb-1">Provide formal written exit notice to the organizer at least <strong>7 days</strong> before the next cycle due date.</li>
                        <li className="mb-1">Assist the organizer in identifying an approved replacement member to assume remaining cycle installments.</li>
                        <li>Past contributed funds are settled in accordance with the Refund & Settlement Policy upon substitute onboarding.</li>
                      </ul>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3" style={{ borderLeft: '4px solid #DC2626' }}>
                      <h6 className="fw-bold text-danger d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-danger text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 2</span>
                        Post-Prized Exit Prohibition (Strict Absolute Bar)
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Any member who has <strong>already received their pooled lump-sum payout CANNOT cancel or exit under any circumstances</strong>. The payout represents an advance on future community contributions, forming an enforceable civil debt under Chapter 190. Any attempt to abandon the circle after receiving funds is treated as actionable civil default.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 3</span>
                        Involuntary Expulsion & Defaulter Substitution
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        If a member misses <strong>two (2) consecutive payment cycles</strong> without valid medical or emergency grounds, the organizer holds the legal right to substitute that member with an approved guarantor or replacement to protect circle continuity.
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. Refund Policy */}
                {activeTab === 'refund' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0097B2', width: '44px', height: '44px' }}>
                        <Icon name="refresh" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Refund & Financial Settlement Policy</h4>
                        <small className="text-muted">Handling contribution settlements, refunds, and circle reconciliations</small>
                      </div>
                    </div>

                    <div className="alert alert-info border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#E0F7FA', color: '#006064', borderLeft: '4px solid #0097B2' }}>
                      <Icon name="info" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Settlement Protocol:</strong> All refunds and reconciliations are calculated strictly based on verified digital ledger audit records and bank transfer timestamps.
                      </div>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                        Authorized Pre-Prized Exiting Member Settlement
                      </h6>
                      <p className="text-secondary small mb-2 leading-relaxed">
                        When an authorized non-prized member exits and is replaced by an approved incoming subscriber:
                      </p>
                      <div className="p-2.5 bg-white rounded-2 border font-monospace small mb-2 text-dark">
                        Refund Amount = Total Verified Contributed Principal - Administrative Transfer Fee (Max 2%)
                      </div>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        The incoming substitute member pays the accrued contribution sum directly to the outgoing member upon formal transfer confirmation by the organizer.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                        Duplicate Payment & Overpayment Reversal SLA
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        In the event of duplicate bank slip submissions or erroneous excess transfers, the organizer must reconcile bank records within <strong>48 hours</strong> and issue either a direct refund transfer or apply the excess amount as an advance credit toward the next cycle.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                        Unforeseen Early Circle Termination
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        If a circle is prematurely wound up due to mutual member agreement or force majeure, all net contributed funds are audited and returned proportionally to unprized members on an equitable pro-rata basis under Section 19 of Chapter 190.
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. Complaints & Disputes */}
                {activeTab === 'complaints' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F59E0B', width: '44px', height: '44px' }}>
                        <Icon name="alert-circle" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Complaints & Dispute Resolution Procedure</h4>
                        <small className="text-muted">Transparent 3-stage dispute escalation framework (SRS REQ-DSP-01)</small>
                      </div>
                    </div>

                    <div className="alert alert-warning border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#FFFBEB', color: '#92400E', borderLeft: '4px solid #F59E0B' }}>
                      <Icon name="alert-circle" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Immutable Digital Evidence:</strong> Every payment slip, organizer verification, and dispute message is cryptographically logged with tamper-proof timestamps to guarantee impartial resolution.
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-3 mb-3">
                      {/* Step 1 */}
                      <div className="card border-0 bg-light rounded-3 p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 1 • HOUR 0–24</span>
                          <span className="text-muted small">In-App Ticket Submission</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Direct System Dispute Ticket</h6>
                        <p className="text-secondary small mb-0 leading-relaxed">
                          Members raise a dispute directly in the Dispute Portal with slip uploads, bank transaction numbers, and an explanation. A unique tracking reference code (e.g. <code>DSP-2026-0042</code>) is immediately issued.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="card border-0 bg-light rounded-3 p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 2 • HOUR 24–72</span>
                          <span className="text-muted small">48-Hour Resolution Window</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Mandatory Organizer Review</h6>
                        <p className="text-secondary small mb-0 leading-relaxed">
                          The circle organizer must review the attached payment records and bank statements to confirm receipt, correct bookkeeping errors, or provide counter-evidence within 48 hours.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="card border-0 bg-light rounded-3 p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 3 • DAY 3–7</span>
                          <span className="text-muted small">Platform Administrative Audit</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Administrative Mediation & Audit Certificate</h6>
                        <p className="text-secondary small mb-0 leading-relaxed">
                          Unresolved disputes or allegations of organizer misconduct are escalated to Platform Administrators, who issue an official, tamper-proof <strong>Dispute Audit Certificate</strong> summarizing verified transactions.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="card border-0 bg-light rounded-3 p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge text-white px-2.5 py-1 fw-bold" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>STAGE 4 • DAY 7+</span>
                          <span className="text-muted small">Statutory Legal Redress</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Legal Arbitration & DRC Conciliation</h6>
                        <p className="text-secondary small mb-0 leading-relaxed">
                          If mediation fails, either party may submit the Dispute Audit Certificate to the <strong>Arbitration Council under Arbitration Act No. 11 of 1995</strong> or to the Registrar of Companies for summary recovery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Disclaimer */}
                {activeTab === 'disclaimer' && (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                      <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#64748B', width: '44px', height: '44px' }}>
                        <Icon name="info" size={22} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">Legal & Non-Custodial Disclaimer</h4>
                        <small className="text-muted">Regulatory disclosure under Banking Act No. 30 of 1988 & Central Bank of Sri Lanka (CBSL)</small>
                      </div>
                    </div>

                    <div className="alert alert-secondary border-0 p-3 rounded-3 mb-4 small d-flex align-items-start gap-2" style={{ backgroundColor: '#F8FAFC', color: '#334155', borderLeft: '4px solid #64748B' }}>
                      <Icon name="info" size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Software Service Architecture:</strong> SeettuManager is an impartial digital software utility engineered exclusively for record-keeping, cycle scheduling, and discipline score calculations.
                      </div>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                        Non-Custodial & Non-Banking Operations
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        SeettuManager does not function as a bank, credit union, microfinance institution, deposit-taking financial institution, or shadow lender. The platform does not hold, pool, or custody member funds, nor does it intermediate cash flows. All financial transactions occur directly between members and organizers.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                        No Investment Advice or Return Guarantees
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Traditional rotating savings circles are cooperative peer saving mechanisms and do not generate interest, capital returns, or investment yields. SeettuManager does not provide financial advisory services or guarantee financial returns.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                        Independent Circle Decision-Making
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Circle membership admissions, monthly contribution amounts, rotation frequency, bidding rules, and organizer appointments are determined exclusively by independent community organizers and their enrolled members.
                      </p>
                    </div>

                    <div className="card border-0 bg-light rounded-3 p-3">
                      <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                        Limitation of Software Liability
                      </h6>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        While SeettuManager guarantees the cryptographic accuracy of mathematical calculations and tamper-proof ledger audit logs, the platform assumes no liability for offline, unverified cash handovers or civil payment defaults between private participants. Members are strongly advised to always upload verified bank transfer slips.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Modal Footer with Professional Consent Checkbox */}
          <div className="modal-footer py-3 px-4 bg-light d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 border-top">
            {/* Consent Checkbox */}
            <div className="d-flex align-items-center gap-2.5 flex-grow-1">
              <input 
                type="checkbox" 
                id="legalModalConsentCheckbox"
                className="form-check-input mt-0 shadow-none cursor-pointer flex-shrink-0"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                style={{ 
                  width: '19px', 
                  height: '19px', 
                  cursor: 'pointer', 
                  accentColor: '#0097B2',
                  borderColor: '#94A3B8'
                }}
              />
              <label 
                htmlFor="legalModalConsentCheckbox" 
                className="form-check-label mb-0 cursor-pointer user-select-none"
                style={{ 
                  fontSize: '0.84rem', 
                  color: hasAgreed ? '#003847' : '#475569', 
                  fontWeight: hasAgreed ? 600 : 500,
                  lineHeight: '1.4'
                }}
              >
                I confirm I have read, understood, and agree to abide by the statutory Seettu rules, member obligations, and platform governance policies.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="d-flex align-items-center justify-content-end gap-2 flex-shrink-0">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm px-3 py-1.5 fw-semibold" 
                onClick={onClose}
              >
                Close
              </button>
              <button 
                type="button" 
                disabled={!hasAgreed}
                className={`btn btn-sm px-4 py-1.5 fw-bold text-white d-inline-flex align-items-center gap-1.5 transition-all ${
                  hasAgreed ? 'shadow-sm' : 'opacity-50'
                }`} 
                style={{ 
                  backgroundColor: hasAgreed ? '#0097B2' : '#94A3B8', 
                  borderColor: hasAgreed ? '#0097B2' : '#94A3B8',
                  cursor: hasAgreed ? 'pointer' : 'not-allowed',
                  fontSize: '0.86rem'
                }}
                onClick={() => {
                  if (hasAgreed) {
                    if (onAccept) onAccept();
                    onClose();
                  }
                }}
              >
                <Icon name="check" size={15} />
                I Understand & Accept
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LegalPoliciesModal;
