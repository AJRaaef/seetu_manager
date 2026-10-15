import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

const ChitLaw = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapter, setActiveChapter] = useState('ch1');

  const chapters = [
    {
      id: 'ch1',
      title: 'CHAPTER I — PRELIMINARY & STATUTORY DEFINITIONS',
      sections: [
        {
          num: 'Section 1',
          title: 'Short Title, Extent & Commencement',
          content: 'This regulatory enactment shall be cited as the Cheetus Governance Framework (incorporating the Cheetus Ordinance, Chapter 190 of the Legislative Enactments of Sri Lanka). It extends across the entirety of the Democratic Socialist Republic of Sri Lanka and applies to all rotating savings, mutual credit circles, and digital Seettu schemes commenced or managed within its jurisdiction.'
        },
        {
          num: 'Section 2',
          title: 'Statutory Definitions',
          content: `In this legal framework, unless the context otherwise specifies:
(a) "Cheetu" or "Seettu" (සීට්ටු / சீட்டு) means a transaction or mutual self-help arrangement (Rotating Savings and Credit Association - ROSCA) whereby a specified number of subscribers enter into an agreement that every one of them shall contribute an equal or agreed portion of money or recognized valuable goods periodically over a definite period, and that each subscriber shall in turn, as determined by rotation schedule, lot, or auction, receive the gross pooled sum.
(b) "Manager" or "Organizer" means the person or registered entity that promotes, organizes, registers, and undertakes fiduciary responsibility for the administration of the Seettu group and the maintenance of the digital ledger.
(c) "Subscriber" or "Member" means any verified individual who has subscribed to a share in a Seettu circle and executed the Seettu agreement.
(d) "Prized Subscriber" means any member who has received or has become entitled to receive the gross pooled payout in any given cycle.
(e) "Non-Prized Subscriber" means a participating member who has not yet received their turn of the pooled lump-sum.
(f) "Registrar" means the Registrar of Companies of Sri Lanka (DRC) or authorized regional regulatory administrative officers.`
        },
        {
          num: 'Section 3',
          title: 'Essential Statutory Terms of a Valid Scheme',
          content: 'No scheme shall be recognized as a valid Seettu unless it specifies at inception: (i) the total aggregate lump-sum, (ii) a fixed number of participating members, (iii) equal contribution installments payable at regular intervals (daily, weekly, bi-weekly, or monthly), and (iv) a predetermined rotation or auction schedule.'
        }
      ]
    },
    {
      id: 'ch2',
      title: 'CHAPTER II — FORMATION & REGISTRATION OF SEETTU AGREEMENTS',
      sections: [
        {
          num: 'Section 4',
          title: 'Non-Custodial Architecture & Prohibition of Unauthorized Deposit-Taking',
          content: 'SeettuManager operates strictly as a non-custodial technological platform and transparent digital record-keeper. Under the Banking Act No. 30 of 1988 and Finance Business Act No. 42 of 2011, SeettuManager does not solicit, hold, or accept customer deposits. All funds remain directly peer-to-peer or between members and their designated community organizer via verified bank accounts or documented cash handovers.'
        },
        {
          num: 'Section 5',
          title: 'Mandatory Form of the Seettu Agreement',
          content: 'Every circle shall be governed by a digital or written Seettu Agreement signed or verified by electronic acknowledgment (under the Electronic Transactions Act No. 19 of 2006) by each participating subscriber. The agreement must explicitly specify the organizer’s details, total cycle duration, contribution installment amount, payment deadlines, and default penalty calculation formulas.'
        },
        {
          num: 'Section 6',
          title: 'Filing & Member Copy Delivery',
          content: 'Within 24 hours of circle initiation, the manager must generate a verifiable digital copy of the agreement and rotation calendar, accessible to every enrolled member via the secure member dashboard and printable PDF format.'
        }
      ]
    },
    {
      id: 'ch3',
      title: 'CHAPTER III — RIGHTS, FIDUCIARY DUTIES & LIABILITIES OF THE MANAGER',
      sections: [
        {
          num: 'Section 7',
          title: 'Fiduciary Accountability of the Organizer',
          content: 'Every organizer acts as a trusted community fiduciary and is legally accountable to all subscribers for the accurate recording of contributions, the verification of bank transfer deposit slips, and the prompt disbursement of pooled payouts.'
        },
        {
          num: 'Section 8',
          title: 'Mandatory Digital Ledger & Record Preservation',
          content: 'The manager must maintain an immutable digital ledger detailing: (a) member names, phone numbers, and National Identity Card (NIC) numbers; (b) dates and amounts of all contributions received; (c) photographic or PDF bank deposit slips; (d) payout timestamps and recipient confirmations. All records must be preserved for at least five years from circle completion.'
        },
        {
          num: 'Section 9',
          title: 'Punctual Disbursement of Payouts',
          content: 'Upon the successful completion of contributions for a given cycle, the manager is bound to disburse the full prize amount to the entitled prized subscriber within seven (7) days or before the next succeeding installment date, whichever occurs earlier.'
        },
        {
          num: 'Section 10',
          title: 'Organizer Commission & Statutory Limits',
          content: 'The organizer may deduct an agreed administrative commission (not exceeding 5% of the gross pooled amount) only if explicitly disclosed and consented to in the Seettu Agreement at circle creation.'
        }
      ]
    },
    {
      id: 'ch4',
      title: 'CHAPTER IV — RIGHTS AND DUTIES OF NON-PRIZED SUBSCRIBERS',
      sections: [
        {
          num: 'Section 11',
          title: 'Timely Contributions & Instant Receipt Rights',
          content: 'Every non-prized subscriber must pay their contribution installment on or before the due date. Upon recording payment, the subscriber is entitled to an immediate digital receipt and real-time ledger update.'
        },
        {
          num: 'Section 12',
          title: 'Defaulting Subscribers & Financial Discipline Scoring',
          content: 'Subscribers who fail to pay within the scheduled cycle window incur automated algorithmic Financial Discipline penalties: Score = max(0, 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)]). Chronic defaulters with a score under 50 are designated high-risk and restricted from early cycle rotations.'
        },
        {
          num: 'Section 13',
          title: 'Substitution of Defaulting Members',
          content: 'If a non-prized subscriber defaults on two consecutive cycles, the manager, with the consent of the group, may substitute an approved replacement member. Past contributions of the removed member will be refunded at circle conclusion after deducting verified administrative costs.'
        }
      ]
    },
    {
      id: 'ch5',
      title: 'CHAPTER V — RIGHTS, DUTIES & CONTINUOUS OBLIGATION OF PRIZED SUBSCRIBERS',
      sections: [
        {
          num: 'Section 14',
          title: 'Security and Guarantor Requirements',
          content: 'Before collecting their pooled lump-sum payout, the prized subscriber must furnish adequate security or verify trusted neighborhood co-signers as required by the organizer for high-value monetary or gold seettu groups.'
        },
        {
          num: 'Section 15',
          title: 'Strict Continuous Obligation to Complete Remaining Cycles',
          content: 'Receiving an earlier pooled payout does NOT terminate or diminish the prized subscriber’s mutual duty. The prized subscriber remains strictly obligated under Sri Lankan civil law to pay all remaining future installments on schedule until the circle formally terminates.'
        },
        {
          num: 'Section 16',
          title: 'Summary Legal Recovery against Defaulters',
          content: 'In the event of default by a prized subscriber, the organizer and fellow circle members possess full legal rights under the Civil Procedure Code of Sri Lanka to demand immediate consolidated payment of all remaining cycle installments and enforce recovery through arbitration awards.'
        }
      ]
    },
    {
      id: 'ch6',
      title: 'CHAPTER VI — DISPUTES, ARBITRATION & COMPLAINT SETTLEMENT',
      sections: [
        {
          num: 'Section 17',
          title: 'Mandatory 3-Stage Dispute Resolution Framework',
          content: 'All disputes touching the administration, slip validation, or payout allocations must be processed via the SeettuManager Dispute Resolution Portal (SRS REQ-DSP-01): Stage 1: Submission with unique DSP Reference ID; Stage 2: 48-hour Organizer Review; Stage 3: Administrative Ledger Audit and Mediation.'
        },
        {
          num: 'Section 18',
          title: 'Enforceability of Digital Ledgers',
          content: 'Pursuant to the Electronic Transactions Act No. 19 of 2006, cryptographic audit logs, bank slip uploads, and digital transaction timestamps generated by SeettuManager are admissible as primary evidence in civil courts and arbitration tribunals.'
        }
      ]
    },
    {
      id: 'ch7',
      title: 'CHAPTER VII — DATA PRIVACY & STATUTORY COMPLIANCE',
      sections: [
        {
          num: 'Section 19',
          title: 'Personal Data Protection Act (PDPA) No. 9 of 2022',
          content: 'All member records, National Identity Card numbers, phone credentials, and transaction histories are safeguarded under Sri Lanka’s Personal Data Protection Act No. 9 of 2022. Commercial sale or unauthorized external dissemination of member financial data is strictly prohibited.'
        },
        {
          num: 'Section 20',
          title: 'Trilingual Accessibility Mandate',
          content: 'All statutory rules, dispute documentation, and payment schedules must be accessible across the three national languages of Sri Lanka: English, Sinhala (සිංහල), and Tamil (தமிழ்).'
        }
      ]
    }
  ];

  const filteredChapters = chapters.map(chap => ({
    ...chap,
    sections: chap.sections.filter(sec => 
      sec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.num.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(chap => chap.sections.length > 0);

  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* Top Banner Header */}
      <div className="text-white py-5" style={{ backgroundColor: '#0F2F3D', borderBottom: '4px solid #0097B2' }}>
        <div className="container py-2">
          
          {/* Breadcrumb Navigation */}
          <div className="d-flex align-items-center gap-2 small text-white-50 mb-3">
            <Link to="/" className="text-white-50 text-decoration-none hover-white">Home</Link>
            <span>/</span>
            <span className="text-white fw-semibold">Sri Lanka Seettu Law & Statutory Governance</span>
          </div>

          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-8">
              <span className="badge px-3 py-1.5 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-1.5" style={{ backgroundColor: '#0097B2', fontSize: '0.78rem' }}>
                <Icon name="scale" size={14} />
                STATUTORY COMPLIANCE • CHAPTER 190
              </span>
              <h1 className="fw-black display-6 text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Sri Lanka Seettu Law & Regulatory Framework
              </h1>
              <p className="text-white-50 lead mb-0" style={{ fontSize: '1rem', maxWidth: '720px' }}>
                Governing traditional Rotating Savings and Credit Associations (ROSCAs / Cheetus) under the <strong>Cheetus Ordinance (Chapter 190)</strong>, <strong>Electronic Transactions Act No. 19 of 2006</strong>, and <strong>Personal Data Protection Act No. 9 of 2022</strong>.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <div className="p-3 rounded-3 text-start d-inline-block text-white border" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <div className="fw-bold small mb-1" style={{ color: '#00E5FF' }}>Regulatory Oversight</div>
                <div className="small text-white-50">Dept. of Registrar of Companies (DRC)</div>
                <div className="small text-white-50">Colombo, Sri Lanka</div>
                <div className="small fw-semibold text-white mt-1">Non-Custodial Digital Ledger Model</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        
        {/* Search & Actions Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center justify-content-between">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Icon name="search" size={16} color="#64748B" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-light"
                  placeholder="Search sections, definitions, or legal terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end d-flex gap-2 justify-content-md-end">
              <button 
                onClick={() => window.print()} 
                className="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-1.5"
              >
                <Icon name="download" size={15} />
                <span>Print / Save PDF</span>
              </button>
              <Link 
                to="/register" 
                className="btn btn-sm fw-bold text-white px-3"
                style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
              >
                Join Verified Group →
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Statutory Content */}
        <div className="row g-4">
          
          {/* Left Column: Chapters Navigation Index */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-3 p-3 sticky-top" style={{ top: '90px' }}>
              <h6 className="fw-bold text-uppercase small text-dark mb-3 pb-2 border-bottom" style={{ color: '#0F2F3D', letterSpacing: '0.8px' }}>
                Statutory Chapters
              </h6>
              <div className="nav flex-column gap-1">
                {chapters.map((chap) => (
                  <a 
                    key={chap.id}
                    href={`#${chap.id}`}
                    onClick={() => setActiveChapter(chap.id)}
                    className={`btn btn-sm text-start py-2 px-2.5 rounded-2 border-0 text-decoration-none ${
                      activeChapter === chap.id ? 'fw-bold' : 'text-secondary'
                    }`}
                    style={{
                      backgroundColor: activeChapter === chap.id ? '#E6F7F9' : 'transparent',
                      color: activeChapter === chap.id ? '#003847' : '#475569',
                      fontSize: '0.78rem'
                    }}
                  >
                    {chap.title}
                  </a>
                ))}
              </div>

              <div className="mt-4 pt-3 border-top small text-muted">
                <div className="fw-bold text-dark mb-1">Legal Help Desk</div>
                <div>+94 75 297 5632 / 4040</div>
                <div>seetumanager@gmail.com</div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Statutory Sections */}
          <div className="col-lg-9">
            {filteredChapters.length === 0 ? (
              <div className="card p-5 text-center text-muted">
                <Icon name="alert-circle" size={40} className="mx-auto mb-2 text-warning" />
                <h5>No matching statutory sections found</h5>
                <p className="small mb-0">Try searching for keywords like "Manager", "Discipline", "Subscriber", or "Deposit".</p>
              </div>
            ) : (
              filteredChapters.map((chap) => (
                <div key={chap.id} id={chap.id} className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
                  
                  {/* Chapter Header */}
                  <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
                    <h5 className="fw-black mb-0" style={{ color: '#0F2F3D', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                      {chap.title}
                    </h5>
                    <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(0, 151, 178, 0.1)', color: '#0097B2', fontSize: '0.7rem' }}>
                      {chap.sections.length} Sections
                    </span>
                  </div>

                  {/* Chapter Sections */}
                  <div className="d-flex flex-column gap-4">
                    {chap.sections.map((sec, idx) => (
                      <div key={idx} className="section-item">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-secondary bg-opacity-10 text-dark fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                            {sec.num}
                          </span>
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.98rem' }}>
                            {sec.title}
                          </h6>
                        </div>
                        <p className="text-secondary small leading-relaxed mb-0 ps-3 border-start border-2 border-info border-opacity-50 mt-2" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ChitLaw;
