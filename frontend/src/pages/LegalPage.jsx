import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';

export const LegalPage = ({ defaultTab = 'rules' }) => {
  const { policyKey } = useParams();
  const navigate = useNavigate();
  const activeKey = policyKey || defaultTab;
  const [searchTerm, setSearchTerm] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  // All 9 quicklinks with statutory badges & icons
  const legalDocs = [
    { id: 'law', path: '/law', label: 'Chit Law & Governance', icon: 'scale', badge: 'Chapter 190', external: true },
    { id: 'rules', path: '/rules', label: 'Member Enrollment Rules', icon: 'user-check', badge: 'Mandatory' },
    { id: 'complaints', path: '/complaints', label: 'Complaints & Disputes', icon: 'alert-circle', badge: 'Resolution' },
    { id: 'privacy', path: '/privacy', label: 'Privacy & Policy', icon: 'shield', badge: 'PDPA 2022' },
    { id: 'terms', path: '/terms', label: 'Terms & Conditions', icon: 'file-text', badge: 'Agreement' },
    { id: 'cancellation', path: '/cancellation', label: 'Cancellation Policy', icon: 'x', badge: 'Exit Rules' },
    { id: 'refund', path: '/refund', label: 'Refund Policy', icon: 'refresh', badge: 'Settlement' },
    { id: 'disclaimer', path: '/disclaimer', label: 'Disclaimer', icon: 'info', badge: 'Non-Custodial' },
    { id: 'contact', path: '/contact', label: 'Contact Us', icon: 'phone', badge: 'Helpline' }
  ];

  // Document metadata for top banner
  const docMeta = {
    rules: {
      title: 'Member Enrollment Agreement & Rules',
      subtitle: 'Mandatory contractual commitments, punctuality standards, and algorithmic scoring obligations required before joining or organizing any Seettu group in Sri Lanka.',
      badge: 'MANDATORY ENROLLMENT CHARTER',
      authority: 'Sri Lanka Common Law & Chapter 190'
    },
    terms: {
      title: 'Platform Terms & Conditions',
      subtitle: 'Comprehensive user agreement governing member, organizer, and administrator conduct on SeettuManager digital web and mobile services.',
      badge: 'USER AGREEMENT & SERVICE TERMS',
      authority: 'Electronic Transactions Act No. 19 of 2006'
    },
    cancellation: {
      title: 'Cancellation & Member Exit Policy',
      subtitle: 'Procedures, notice periods, and mandatory substitution conditions for exiting an active rotating savings circle.',
      badge: 'CIRCLE EXIT & WITHDRAWAL PROTOCOL',
      authority: 'Mutual ROSCA Contract Standards'
    },
    refund: {
      title: 'Refund & Financial Settlement Policy',
      subtitle: 'Reconciliation formulas, overpayment reversal SLAs, and equitable distribution guidelines for community contributions.',
      badge: 'FINANCIAL RECONCILIATION SLA',
      authority: 'Digital Ledger Audit Protocol'
    },
    complaints: {
      title: 'Complaints & Dispute Resolution Procedure',
      subtitle: 'Transparent 4-stage dispute escalation framework, immutable audit logs, and formal arbitration protocols (SRS REQ-DSP-01).',
      badge: 'DISPUTE RESOLUTION FRAMEWORK',
      authority: 'Arbitration Act No. 11 of 1995'
    },
    disclaimer: {
      title: 'Legal & Non-Custodial Disclaimer',
      subtitle: 'Statutory disclosure under Banking Act No. 30 of 1988 regarding software technology architecture and peer-to-peer savings.',
      badge: 'REGULATORY COMPLIANCE NOTICE',
      authority: 'Central Bank of Sri Lanka (CBSL)'
    }
  };

  const currentMeta = docMeta[activeKey] || docMeta.rules;

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Top Header Banner with Project Theme (Deep Teal, Cyan Accent & Breadcrumb) */}
      <div 
        className="text-white py-5 position-relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, #0F2F3D 0%, #003847 60%, #00222B 100%)',
          borderBottom: '4px solid #0097B2' 
        }}
      >
        <div className="container py-3 position-relative" style={{ zIndex: 2 }}>
          
          {/* Breadcrumb Navigation */}
          <div className="d-flex align-items-center gap-2 small text-white-50 mb-3">
            <Link to="/" className="text-white-50 text-decoration-none hover-white">Home</Link>
            <span>/</span>
            <span className="text-white fw-semibold">{currentMeta.title}</span>
          </div>

          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-8">
              {/* Cyan Accent Bar */}
              <div style={{ width: '42px', height: '4px', backgroundColor: '#00E5FF', marginBottom: '14px', borderRadius: '2px' }} />
              
              <span className="badge px-3 py-1.5 rounded-pill fw-bold text-white mb-2" style={{ backgroundColor: '#0097B2', fontSize: '0.75rem' }}>
                {currentMeta.badge}
              </span>

              <h1 className="fw-black display-6 text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
                {currentMeta.title}
              </h1>
              
              <p className="text-white-50 lead mb-0" style={{ fontSize: '1.05rem', maxWidth: '720px' }}>
                {currentMeta.subtitle}
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <div 
                className="p-3 rounded-3 text-start d-inline-block text-white border"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="fw-bold small mb-1" style={{ color: '#00E5FF' }}>Statutory Authority</div>
                <div className="small text-white-50">{currentMeta.authority}</div>
                <div className="small text-white-50">Democratic Socialist Republic of Sri Lanka</div>
                <div className="small fw-semibold text-white mt-1">Non-Custodial Architecture Certified</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Left Column: Quick Navigation Index */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '85px', zIndex: 10 }}>
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <h6 className="fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: '0.8px', color: '#003847' }}>
                  Statutory Navigation
                </h6>
                <div className="nav flex-column gap-1.5">
                  {legalDocs.map((doc) => {
                    const isActive = activeKey === doc.id;
                    return (
                      <Link
                        key={doc.id}
                        to={doc.path}
                        className={`text-decoration-none py-2 px-2.5 rounded-2 d-flex align-items-center justify-content-between transition-all ${
                          isActive ? 'bg-light fw-bold text-dark' : 'text-secondary hover-bg'
                        }`}
                        style={{
                          fontSize: '0.84rem',
                          borderLeft: isActive ? '3.5px solid #0097B2' : '3.5px solid transparent',
                          color: isActive ? '#003847' : '#475569'
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Icon name={doc.icon} size={15} color={isActive ? '#0097B2' : '#64748B'} />
                          <span>{doc.label}</span>
                        </div>
                        <span 
                          className="badge rounded-pill text-muted bg-white border"
                          style={{ fontSize: '0.62rem', fontWeight: 600 }}
                        >
                          {doc.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-top">
                  <button 
                    onClick={() => window.print()}
                    className="btn btn-outline-secondary btn-sm w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-1.5"
                  >
                    <Icon name="download" size={14} />
                    Print / Save PDF
                  </button>
                </div>

                {/* Legal Helpline Card */}
                <div className="mt-3 p-3 rounded-2 bg-light border small text-muted">
                  <div className="fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                    <Icon name="phone" size={13} color="#0097B2" />
                    Legal Helpline
                  </div>
                  <div>Colombo, Sri Lanka</div>
                  <div className="fw-semibold" style={{ color: '#0097B2' }}>+94 75 297 5632</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>seetumanager@gmail.com</div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Policy Document */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-3 p-4 p-md-5 bg-white">
              
              {/* Document Sub-Header */}
              <div className="border-bottom pb-4 mb-4">
                <span className="badge px-3 py-1.5 rounded-pill fw-bold text-white mb-2" style={{ backgroundColor: '#0097B2', fontSize: '0.75rem' }}>
                  OFFICIAL STATUTORY POLICY
                </span>
                <h2 className="fw-black text-dark mb-2" style={{ color: '#003847', letterSpacing: '-0.4px' }}>
                  {currentMeta.title}
                </h2>
                <div className="text-muted small d-flex flex-wrap gap-3">
                  <span><strong>Effective Date:</strong> January 1, 2026</span>
                  <span>•</span>
                  <span><strong>Platform:</strong> SeettuManager</span>
                  <span>•</span>
                  <span><strong>Jurisdiction:</strong> Democratic Socialist Republic of Sri Lanka</span>
                </div>
              </div>

              {/* SECTION: Member Enrollment Rules */}
              {activeKey === 'rules' && (
                <div>
                  <div className="alert alert-warning border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#FFF8E1', color: '#7A5A00', borderLeft: '4px solid #FFB020' }}>
                    <Icon name="alert-circle" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Important Legal Notice:</strong> By enrolling in a Seettu group, you enter into a legally binding communal mutual contract with the group organizer and fellow circle members governed by Sri Lankan common law and the Cheetus Ordinance.
                    </div>
                  </div>

                  {/* Clause 1 */}
                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                      Punctuality of Contributions & Verification SLA
                    </h5>
                    <p className="text-secondary small mb-2 leading-relaxed">
                      Every member agrees to deposit their agreed installment amount on or before the cycle due date (weekly, bi-weekly, or monthly). Proof of payment (bank slip upload or organizer cash receipt) must be recorded in the system within <strong>24 hours</strong> of payment.
                    </p>
                    <div className="d-flex flex-wrap gap-2 pt-1">
                      <span className="badge bg-white text-dark border px-2.5 py-1.5 small">● Weekly Cycles: Due every Sunday</span>
                      <span className="badge bg-white text-dark border px-2.5 py-1.5 small">● Monthly Cycles: Due by 5th of Month</span>
                      <span className="badge bg-white text-dark border px-2.5 py-1.5 small">● Slip Verification: Max 24h SLA</span>
                    </div>
                  </div>

                  {/* Clause 2 */}
                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                      Algorithmic Financial Discipline Score Impact
                    </h5>
                    <p className="text-secondary small mb-2 leading-relaxed">
                      Every member's payment reliability is continuously evaluated on an objective 0–100 scale:
                    </p>
                    <div className="p-3 bg-white rounded-3 border font-monospace small mb-3 text-dark fw-semibold shadow-xs">
                      Score = max(0, 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)])
                    </div>
                    
                    <div className="row g-2.5">
                      <div className="col-sm-6">
                        <div className="p-3 rounded-2 bg-white border small">
                          <span className="badge bg-success text-white mb-1">90–100: Platinum Trust</span>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>Eligible for early cycle rotation draws & premium pools.</div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="p-3 rounded-2 bg-white border small">
                          <span className="badge bg-info text-white mb-1">75–89: Reliable</span>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>Standard rotation eligibility with zero deposit holds.</div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="p-3 rounded-2 bg-white border small">
                          <span className="badge bg-warning text-dark mb-1">50–74: Monitored</span>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>Requires co-guarantor confirmation for high-value pools.</div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="p-3 rounded-2 bg-white border small">
                          <span className="badge bg-danger text-white mb-1">&lt; 50: High-Risk Default</span>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>Restricted from early payouts & future circle enrollment.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clause 3 */}
                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                      Continuous Legal Obligation After Receiving Payout
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Receiving a pooled lump-sum payout in an earlier cycle <strong>does not</strong> release the member from their obligation. The member remains strictly bound under civil contract to pay all subsequent cycle installments until the full circle completes. Defaulters will be reported to the platform dispute register and subject to community legal recovery.
                    </p>
                  </div>

                  {/* Clause 4 */}
                  <div className="card border-0 bg-light rounded-3 p-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                      Identity Verification & Trusted Guarantors
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Organizers hold statutory authority to verify valid National Identity Card (NIC) credentials and require trusted neighborhood guarantors prior to confirming enrollment in high-value monetary or gold seettu groups.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: Terms & Conditions */}
              {activeKey === 'terms' && (
                <div>
                  <div className="alert alert-secondary border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#F1F5F9', color: '#1E293B', borderLeft: '4px solid #0F2F3D' }}>
                    <Icon name="file-text" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>User Agreement:</strong> By registering or accessing SeettuManager, you agree to comply with all platform operational guidelines, statutory rules, and community conduct standards.
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                      User Eligibility & Account Security
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Users must be at least 18 years of age and legally competent to enter into contracts under the Law of Sri Lanka. Users are exclusively responsible for maintaining the confidentiality of their passwords and two-factor authentication tokens.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                      Truthful Documentation & Fraud Zero-Tolerance
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Uploading forged deposit slips, manipulated transaction screenshots, or fictitious bank references constitutes criminal fraud under the Penal Code of Sri Lanka. Any member submitting fraudulent records will face immediate account termination, forfeiture of platform standing, and referral to law enforcement authorities.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                      Non-Custodial Architecture Declaration
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      SeettuManager provides cloud-based administrative software for record-keeping and cycle coordination. The platform never pools, touches, manages, or holds member funds in custody. All financial transactions occur directly between member and organizer bank accounts.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                      Trilingual Availability & Language Precedence
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      To serve all Sri Lankan communities, SeettuManager provides full trilingual interfaces in English, Sinhala (සිංහල), and Tamil (தமிழ்). In the event of any interpretive dispute regarding statutory terminology, the English legal text shall prevail.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: Cancellation Policy */}
              {activeKey === 'cancellation' && (
                <div>
                  <div className="alert alert-danger border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderLeft: '4px solid #DC2626' }}>
                    <Icon name="alert-circle" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Critical Protection Notice:</strong> In a rotating savings circle, each member's payment directly funds another member's lump-sum payout. Unauthorized withdrawal disrupts the entire pool and is subject to strict community exit protocols.
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-primary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 1</span>
                      Pre-Prized Exit (Before Receiving Any Payout)
                    </h5>
                    <p className="text-secondary small mb-2 leading-relaxed">
                      If a non-prized member who has not yet received a payout experiences genuine personal hardship and must exit, they must:
                    </p>
                    <ul className="text-secondary small mb-0 ps-3">
                      <li className="mb-1">Provide formal written exit notice to the organizer at least <strong>7 days</strong> before the next cycle due date.</li>
                      <li className="mb-1">Assist the organizer in identifying an approved replacement member to assume remaining cycle installments.</li>
                      <li>Past contributed funds are settled in accordance with the Refund & Settlement Policy upon substitute onboarding.</li>
                    </ul>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5" style={{ borderLeft: '4px solid #DC2626' }}>
                    <h5 className="fw-bold text-danger d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-danger text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 2</span>
                      Post-Prized Exit Prohibition (Strict Absolute Bar)
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Any member who has <strong>already received their pooled lump-sum payout CANNOT cancel or exit under any circumstances</strong>. The payout represents an advance on future community contributions, forming an enforceable civil debt under Chapter 190. Any attempt to abandon the circle after receiving funds is treated as actionable civil default.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>Rule 3</span>
                      Involuntary Expulsion & Defaulter Substitution
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      If a member misses <strong>two (2) consecutive payment cycles</strong> without valid medical or emergency grounds, the organizer holds the legal right to substitute that member with an approved guarantor or replacement to protect circle continuity.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: Refund Policy */}
              {activeKey === 'refund' && (
                <div>
                  <div className="alert alert-info border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#E0F7FA', color: '#006064', borderLeft: '4px solid #0097B2' }}>
                    <Icon name="info" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Settlement Protocol:</strong> All refunds and reconciliations are calculated strictly based on verified digital ledger audit records and bank transfer timestamps.
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                      Authorized Pre-Prized Exiting Member Settlement
                    </h5>
                    <p className="text-secondary small mb-2 leading-relaxed">
                      When an authorized non-prized member exits and is replaced by an approved incoming subscriber:
                    </p>
                    <div className="p-3 bg-white rounded-2 border font-monospace small mb-2 text-dark fw-semibold">
                      Refund Amount = Total Verified Contributed Principal - Administrative Transfer Fee (Max 2%)
                    </div>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      The incoming substitute member pays the accrued contribution sum directly to the outgoing member upon formal transfer confirmation by the organizer.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                      Duplicate Payment & Overpayment Reversal SLA
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      In the event of duplicate bank slip submissions or erroneous excess transfers, the organizer must reconcile bank records within <strong>48 hours</strong> and issue either a direct refund transfer or apply the excess amount as an advance credit toward the next cycle.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-info text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                      Unforeseen Early Circle Termination
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      If a circle is prematurely wound up due to mutual member agreement or force majeure, all net contributed funds are audited and returned proportionally to unprized members on an equitable pro-rata basis under Section 19 of Chapter 190.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: Complaints & Disputes */}
              {activeKey === 'complaints' && (
                <div>
                  <div className="alert alert-warning border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#FFFBEB', color: '#92400E', borderLeft: '4px solid #F59E0B' }}>
                    <Icon name="alert-circle" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Immutable Digital Evidence:</strong> Every payment slip, organizer verification, and dispute message is cryptographically logged with tamper-proof timestamps to guarantee impartial resolution.
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-3 mb-3">
                    {/* Step 1 */}
                    <div className="card border-0 bg-light rounded-3 p-3.5">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 1 • HOUR 0–24</span>
                        <span className="text-muted small">In-App Ticket Submission</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>Direct System Dispute Ticket</h5>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Members raise a dispute directly in the Dispute Portal with slip uploads, bank transaction numbers, and an explanation. A unique tracking reference code (e.g. <code>DSP-2026-0042</code>) is immediately issued.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="card border-0 bg-light rounded-3 p-3.5">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 2 • HOUR 24–72</span>
                        <span className="text-muted small">48-Hour Resolution Window</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>Mandatory Organizer Review</h5>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        The circle organizer must review the attached payment records and bank statements to confirm receipt, correct bookkeeping errors, or provide counter-evidence within 48 hours.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="card border-0 bg-light rounded-3 p-3.5">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-warning text-dark px-2.5 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>STAGE 3 • DAY 3–7</span>
                        <span className="text-muted small">Platform Administrative Audit</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>Administrative Mediation & Audit Certificate</h5>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        Unresolved disputes or allegations of organizer misconduct are escalated to Platform Administrators, who issue an official, tamper-proof <strong>Dispute Audit Certificate</strong> summarizing verified transactions.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="card border-0 bg-light rounded-3 p-3.5">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge text-white px-2.5 py-1 fw-bold" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>STAGE 4 • DAY 7+</span>
                        <span className="text-muted small">Statutory Legal Redress</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>Legal Arbitration & DRC Conciliation</h5>
                      <p className="text-secondary small mb-0 leading-relaxed">
                        If mediation fails, either party may submit the Dispute Audit Certificate to the <strong>Arbitration Council under Arbitration Act No. 11 of 1995</strong> or to the Registrar of Companies for summary recovery.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Disclaimer */}
              {activeKey === 'disclaimer' && (
                <div>
                  <div className="alert alert-secondary border-0 p-3.5 rounded-3 mb-4 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#F8FAFC', color: '#334155', borderLeft: '4px solid #64748B' }}>
                    <Icon name="info" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Software Service Architecture:</strong> SeettuManager is an impartial digital software utility engineered exclusively for record-keeping, cycle scheduling, and discipline score calculations.
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>1</span>
                      Non-Custodial & Non-Banking Operations
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      SeettuManager does not function as a bank, credit union, microfinance institution, deposit-taking financial institution, or shadow lender. The platform does not hold, pool, or custody member funds, nor does it intermediate cash flows. All financial transactions occur directly between members and organizers.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>2</span>
                      No Investment Advice or Return Guarantees
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Traditional rotating savings circles are cooperative peer saving mechanisms and do not generate interest, capital returns, or investment yields. SeettuManager does not provide financial advisory services or guarantee financial returns.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5 mb-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>3</span>
                      Independent Circle Decision-Making
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      Circle membership admissions, monthly contribution amounts, rotation frequency, bidding rules, and organizer appointments are determined exclusively by independent community organizers and their enrolled members.
                    </p>
                  </div>

                  <div className="card border-0 bg-light rounded-3 p-3.5">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '1rem' }}>
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>4</span>
                      Limitation of Software Liability
                    </h5>
                    <p className="text-secondary small mb-0 leading-relaxed">
                      While SeettuManager guarantees the cryptographic accuracy of mathematical calculations and tamper-proof ledger audit logs, the platform assumes no liability for offline, unverified cash handovers or civil payment defaults between private participants. Members are strongly advised to always upload verified bank transfer slips.
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Card at Bottom of Every Policy Document */}
              <div className="mt-5 pt-4 border-top">
                <div className="card border-0 rounded-3 p-4 text-white" style={{ backgroundColor: '#003847' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon name="mail" size={20} color="#00E5FF" />
                    <h5 className="fw-bold mb-0 text-white">Compliance & Member Legal Desk</h5>
                  </div>
                  <p className="text-white-50 small mb-3">
                    Have questions regarding this statutory policy or your rights as a circle member? Reach our Colombo legal desk:
                  </p>
                  <div className="row g-2">
                    <div className="col-sm-4">
                      <div className="small text-white-50">Direct Helpline:</div>
                      <div className="fw-bold text-white small">+94 75 297 5632 / 4040</div>
                    </div>
                    <div className="col-sm-4">
                      <div className="small text-white-50">Email Support:</div>
                      <div className="fw-bold text-white small">seetumanager@gmail.com</div>
                    </div>
                    <div className="col-sm-4">
                      <div className="small text-white-50">Jurisdiction:</div>
                      <div className="fw-bold text-white small">Colombo, Sri Lanka</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 pt-5 pb-4 text-white" style={{ backgroundColor: '#0B232E' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-white-50 small mb-0">
              © 2026 SeettuManager. All rights reserved. • Sri Lanka Digital Rotating Savings Platform
            </p>
            <button 
              onClick={scrollToTop} 
              className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
              title="Back to Top"
            >
              <Icon name="chevron-up" size={16} />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LegalPage;
