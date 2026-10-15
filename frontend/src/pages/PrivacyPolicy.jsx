import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('all');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <span className="text-white fw-semibold">Privacy & Policy</span>
          </div>

          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-8">
              {/* Cyan Accent Bar */}
              <div style={{ width: '42px', height: '4px', backgroundColor: '#00E5FF', marginBottom: '14px', borderRadius: '2px' }} />
              
              <h1 className="fw-black display-6 text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
                Privacy & Policy
              </h1>
              
              <p className="text-white-50 lead mb-0" style={{ fontSize: '1.05rem', maxWidth: '720px' }}>
                Official privacy governance, data protection disclosures, and user rights for <strong>SeettuManager</strong>, compliant with Sri Lanka's <strong>Personal Data Protection Act (PDPA) No. 9 of 2022</strong>.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <div 
                className="p-3 rounded-3 text-start d-inline-block text-white border"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="fw-bold small mb-1" style={{ color: '#00E5FF' }}>Statutory Authority</div>
                <div className="small text-white-50">Data Protection Authority of Sri Lanka</div>
                <div className="small text-white-50">PDPA Enactment No. 9 of 2022</div>
                <div className="small fw-semibold text-white mt-1">Non-Custodial Architecture Certified</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Privacy Policy Content */}
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Left Column: Quick Navigation Index */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '85px', zIndex: 10 }}>
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <h6 className="fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: '0.8px', color: '#003847' }}>
                  Policy Sections
                </h6>
                <div className="nav flex-column gap-1 small">
                  <a href="#intro" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">1. Introduction & Scope</a>
                  <a href="#consent" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">2. Member Consent</a>
                  <a href="#collect" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">3. Information We Collect</a>
                  <a href="#use" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">4. How We Use Information</a>
                  <a href="#logs" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">5. Log Files & Analytics</a>
                  <a href="#cookies" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">6. Cookies & Web Beacons</a>
                  <a href="#advertising" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">7. Third-Party Partners</a>
                  <a href="#no-sell" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">8. Do Not Sell Rights</a>
                  <a href="#pdpa" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">9. PDPA Data Rights</a>
                  <a href="#children" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">10. Protection of Minors</a>
                  <a href="#updates" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">11. Policy Changes</a>
                  <a href="#contact-dpo" className="text-secondary text-decoration-none py-1.5 px-2 rounded-2 hover-bg">12. Data Protection Officer</a>
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
              </div>
            </div>
          </div>

          {/* Right Column: Policy Document */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-3 p-4 p-md-5 bg-white">
              
              {/* Document Header */}
              <div className="border-bottom pb-4 mb-4">
                <span className="badge px-3 py-1.5 rounded-pill fw-bold text-white mb-2" style={{ backgroundColor: '#0097B2', fontSize: '0.75rem' }}>
                  OFFICIAL STATUTORY POLICY
                </span>
                <h2 className="fw-black text-dark mb-2" style={{ color: '#003847', letterSpacing: '-0.4px' }}>
                  Privacy Policy for SeettuManager
                </h2>
                <div className="text-muted small d-flex flex-wrap gap-3">
                  <span><strong>Effective Date:</strong> January 1, 2026</span>
                  <span>•</span>
                  <span><strong>Jurisdiction:</strong> Democratic Socialist Republic of Sri Lanka</span>
                  <span>•</span>
                  <span><strong>Status:</strong> Active & Enforceable</span>
                </div>
              </div>

              {/* 1. Introduction */}
              <section id="intro" className="mb-5">
                <div className="alert alert-info border-0 p-3 rounded-3 mb-3 small d-flex align-items-start gap-2.5" style={{ backgroundColor: '#E6F7F9', color: '#003847' }}>
                  <Icon name="shield" size={20} className="flex-shrink-0 mt-0.5 text-info" />
                  <div>
                    At <strong>SeettuManager</strong>, accessible from <strong>https://seetumanager.com</strong>, one of our main priorities is the privacy, financial confidentiality, and data protection of our visitors, community organizers, and enrolled rotating savings circle members.
                  </div>
                </div>
                <p className="text-secondary leading-relaxed small">
                  This Privacy Policy document outlines the types of personal, operational, and transaction verification data that is collected and recorded by SeettuManager and how we handle it in accordance with Sri Lanka's statutory enactments. If you have additional questions or require further information regarding our data governance, do not hesitate to reach our Data Protection Officer at <strong>seetumanager@gmail.com</strong>.
                </p>
                <p className="text-secondary leading-relaxed small">
                  This Privacy Policy applies strictly to our digital activities and is valid for visitors to our website, progressive web app, and mobile application with regards to the information that they share or record in SeettuManager. This policy is not applicable to any information collected offline without verifiable digital receipt generation or via third-party communication channels independent of this platform.
                </p>
              </section>

              {/* 2. Consent */}
              <section id="consent" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>2</span>
                  Consent
                </h5>
                <div className="p-3.5 rounded-3 bg-light border leading-relaxed small text-dark">
                  By using our website, accessing the Seettu dashboard, or registering for an account, you hereby consent to our Privacy Policy and unconditionally agree to its statutory terms and algorithmic record-keeping principles.
                </div>
              </section>

              {/* 3. Information We Collect */}
              <section id="collect" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>3</span>
                  Information We Collect
                </h5>
                <p className="text-secondary leading-relaxed small">
                  The personal information that you are requested to provide, and the operational reasons why you are asked to provide it, are made transparently clear to you at the point of collection:
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border h-100">
                      <strong className="text-dark d-block mb-1 small fw-bold">Account & Identity Information:</strong>
                      <p className="text-secondary small mb-0">
                        When you register for an Account, we collect your full legal name, mobile phone number, email address, physical district/province of residence, preferred language (Sinhala, Tamil, or English), and National Identity Card (NIC) number for organizer identity verification.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3 bg-light border h-100">
                      <strong className="text-dark d-block mb-1 small fw-bold">Transaction & Payment Evidence:</strong>
                      <p className="text-secondary small mb-0">
                        When participating in a Seettu circle, members upload bank deposit slip images, transaction reference codes, and timestamps. Organizers record cash receipt confirmations to ensure accurate ledger balancing.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-secondary leading-relaxed small">
                  If you contact us directly via our support helplines, WhatsApp desk, or email, we may receive additional communications including the contents of your message, attached bank statements, and relevant community dispute documentation.
                </p>
              </section>

              {/* 4. How We Use Your Information */}
              <section id="use" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>4</span>
                  How We Use Your Information
                </h5>
                <p className="text-secondary leading-relaxed small">
                  We use the information we collect across our software architecture for legitimate community and operational purposes, including to:
                </p>
                <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                  <ul className="text-secondary small mb-0 ps-3 d-flex flex-column gap-2">
                    <li><strong>Provide, operate, and maintain</strong> our digital Seettu ledger, rotation schedules, and payout lotteries.</li>
                    <li><strong>Improve, personalize, and expand</strong> our platform features, multi-currency support (LKR / Gold sovereigns), and trilingual translations.</li>
                    <li><strong>Calculate Algorithmic Financial Discipline Scores (0–100)</strong> based strictly on contribution punctuality (Late, Missed, Delay Days).</li>
                    <li><strong>Develop new savings products</strong>, specialized gold Seettu workflows, and group settlement tools.</li>
                    <li><strong>Communicate with you</strong>, directly or via SMS/WhatsApp alerts, for payment due notifications, cycle winner declarations, and customer service.</li>
                    <li><strong>Generate verified audit certificates</strong> (PDF reports) upon circle completion for member credit history portfolios.</li>
                    <li><strong>Find, prevent, and prosecute fraud</strong>, forged bank deposit slips, and unauthorized duplicate payout claims.</li>
                  </ul>
                </div>
              </section>

              {/* 5. Log Files */}
              <section id="logs" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>5</span>
                  Log Files & Security Auditing
                </h5>
                <p className="text-secondary leading-relaxed small">
                  SeettuManager follows industry-standard procedures of maintaining cryptographic system log files. These files log access events when members interact with our services. All cloud hosting infrastructures conduct this logging as an essential component of financial dispute arbitration and security telemetry.
                </p>
                <p className="text-secondary leading-relaxed small">
                  Information collected by log files includes Internet Protocol (IP) addresses, browser types, Internet Service Providers (ISP e.g., Dialog, SLT Mobitel, Airtel), date and time stamps, referring/exit pages, and transaction confirmation clickstreams. These technical logs are stored with tamper-proof hashing and are used strictly for dispute resolution, forensic fraud investigation, and infrastructure reliability.
                </p>
              </section>

              {/* 6. Cookies and Web Beacons */}
              <section id="cookies" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>6</span>
                  Cookies & Local Session Storage
                </h5>
                <p className="text-secondary leading-relaxed small">
                  Like any modern web application, SeettuManager uses local cookies and HTML5 local storage. These tokens are used exclusively to persist authenticated user sessions, language preferences (Sinhala, Tamil, English), dark/light display settings, and active circle filters. This information optimizes user experience without re-prompting for credentials on each cycle review.
                </p>
              </section>

              {/* 7. Advertising & Third-Party Analytics */}
              <section id="advertising" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>7</span>
                  Third-Party Partners & Ad Networks
                </h5>
                <div className="card border-0 bg-light rounded-3 p-3.5 mb-3" style={{ borderLeft: '4px solid #0097B2' }}>
                  <p className="text-dark small mb-0 fw-semibold">
                    SeettuManager operates as a community savings tool and does not serve intrusive behavioral advertisements or track members across external commercial websites.
                  </p>
                </div>
                <p className="text-secondary leading-relaxed small">
                  You may consult this policy regarding external infrastructure partners (e.g. AWS Cloud, MongoDB Atlas, Twilio/SMS gateways). We mandate that all third-party service providers implement strict technical safeguards, comply with ISO 27001 / SOC2 security standards, and process member metadata solely under our direct contractual instructions.
                </p>
              </section>

              {/* 8. Do Not Sell My Information */}
              <section id="no-sell" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>8</span>
                  Privacy Rights (Do Not Sell My Personal Information)
                </h5>
                <div className="alert alert-success border-0 p-3 rounded-3 mb-3 small d-flex align-items-center gap-2" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20' }}>
                  <Icon name="check" size={18} />
                  <strong>Zero Commercial Sale Guarantee:</strong> SeettuManager has never sold, and will never sell, member personal data or transaction histories for financial compensation.
                </div>
                <p className="text-secondary leading-relaxed small mb-2">
                  Every user possesses the statutory right to:
                </p>
                <ul className="text-secondary small mb-0 ps-3 d-flex flex-column gap-1.5">
                  <li>Request that the platform disclose the specific categories and pieces of personal data collected about them.</li>
                  <li>Request that the platform delete any personal data collected, subject to statutory 5-year ledger retention under Chapter 190.</li>
                  <li>Instruct the platform never to transfer their contact information to external parties.</li>
                </ul>
              </section>

              {/* 9. PDPA Data Protection Rights */}
              <section id="pdpa" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#0097B2', fontSize: '0.75rem' }}>9</span>
                  Data Protection Rights under Sri Lanka PDPA No. 9 of 2022
                </h5>
                <p className="text-secondary leading-relaxed small">
                  We want to ensure you are fully aware of all of your data protection rights under Part II of the <strong>Personal Data Protection Act No. 9 of 2022</strong>. Every registered SeettuManager user is entitled to:
                </p>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right of Access:</strong> You have the right to request full digital copies of your personal data, transaction records, and Financial Discipline logs.
                  </div>
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right to Rectification:</strong> You have the right to request the correction of any information you believe is inaccurate or the completion of incomplete profile records.
                  </div>
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right to Erasure:</strong> You have the right to request the erasure of your personal data once all enrolled Seettu circles have reached final statutory settlement.
                  </div>
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right to Restrict Processing:</strong> You have the right to request that we restrict the automated processing of your personal data under specific contestation conditions.
                  </div>
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right to Object to Processing:</strong> You have the right to object to processing your data for non-essential administrative notifications.
                  </div>
                  <div className="p-2.5 rounded-2 bg-light border small">
                    <strong className="text-dark">● The Right to Data Portability:</strong> You have the right to request that we transfer your certified contribution history to another registered organizer or directly to you in structured JSON/PDF formats.
                  </div>
                </div>

                <p className="text-secondary small mb-0">
                  If you make a formal statutory request, our Data Protection Officer is mandated to respond within <strong>twenty-one (21) working days</strong>.
                </p>
              </section>

              {/* 10. Children's Information */}
              <section id="children" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>10</span>
                  Protection of Minors (Children's Information)
                </h5>
                <p className="text-secondary leading-relaxed small">
                  Protecting children when using digital financial utilities is an utmost priority. Use of SeettuManager is available strictly to individuals who can form legally binding contracts under the Roman-Dutch Common Law and the Age of Majority Ordinance of Sri Lanka (minimum age 18 years).
                </p>
                <p className="text-secondary leading-relaxed small">
                  SeettuManager does not knowingly solicit or collect Personal Identifiable Information from minors under the age of 18. If a parent or guardian discovers that a minor has created an account, please notify us immediately at <strong>seetumanager@gmail.com</strong>, and we will take prompt corrective measures to suspend the account and remove unauthorized data from our active registers.
                </p>
              </section>

              {/* 11. Changes to This Privacy Policy */}
              <section id="updates" className="mb-5">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span className="badge rounded-pill text-white" style={{ backgroundColor: '#003847', fontSize: '0.75rem' }}>11</span>
                  Changes to This Privacy Policy
                </h5>
                <p className="text-secondary leading-relaxed small">
                  We may periodically update our Privacy Policy to reflect statutory directives issued by the Data Protection Authority of Sri Lanka or improvements to our ledger technology. We advise members to review this page periodically. Any modifications become effective immediately upon public posting on this URL with an updated timestamp.
                </p>
              </section>

              {/* 12. Contact Us */}
              <section id="contact-dpo">
                <div className="card border-0 rounded-3 p-4 text-white" style={{ backgroundColor: '#003847' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Icon name="mail" size={20} color="#00E5FF" />
                    <h5 className="fw-bold mb-0 text-white">Contact Our Data Protection Officer</h5>
                  </div>
                  <p className="text-white-50 small mb-3 leading-relaxed">
                    If you have questions, regulatory inquiries, or wish to exercise your data subject rights under PDPA No. 9 of 2022, please contact our dedicated compliance desk:
                  </p>
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 rounded-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <strong className="text-white d-block small mb-1">Platform Headquarters</strong>
                        <div className="text-white-50 small">SeettuManager</div>
                        <div className="text-white-50 small">Colombo, Western Province, Sri Lanka</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <strong className="text-white d-block small mb-1">Direct Helplines</strong>
                        <div className="text-white-50 small">+94 75 297 5632</div>
                        <div className="text-white-50 small">+94 75 297 4040</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <strong className="text-white d-block small mb-1">Compliance Desk</strong>
                        <div className="text-white-50 small">seetumanager@gmail.com</div>
                        <div className="text-white-50 small">Mon – Sat (8:30 AM – 6:00 PM IST)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

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

export default PrivacyPolicy;
