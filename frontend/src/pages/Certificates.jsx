import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';
import Icon from '../components/Icons';

const Certificates = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueUserId, setIssueUserId] = useState('');
  const [issueGroupId, setIssueGroupId] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    fetchCertificates();
    if (isAdmin || isOrganizer) {
      fetchGroupsAndUsers();
    }
  }, [user]);

  const fetchGroupsAndUsers = async () => {
    try {
      const [gRes, mRes] = await Promise.all([
        groupApi.getAllGroups().catch(() => ({ data: [] })),
        groupApi.getAllMembers().catch(() => ({ data: [] }))
      ]);
      const gList = gRes?.data || gRes || [];
      const mList = mRes?.data || mRes || [];
      setAllGroups(Array.isArray(gList) ? gList : []);
      
      // Deduplicate members/users list
      const userMap = new Map();
      if (Array.isArray(mList)) {
        mList.forEach((m) => {
          const u = m.user || m;
          if (u && u.id) {
            userMap.set(u.id, u);
          }
        });
      }
      setAllUsers(Array.from(userMap.values()));
    } catch (err) {
      console.error('Error fetching groups and users for certificates', err);
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;
      const res = (isAdmin || isOrganizer)
        ? await api.get('/certificates')
        : await api.get(`/certificates/user/${uid}`);
      setCertificates(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error loading certificates', err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!issueUserId || !issueGroupId) {
      alert('Please select both a Member and a Seettu Group');
      return;
    }
    try {
      setIssuing(true);
      await api.post(`/certificates?userId=${issueUserId}&groupId=${issueGroupId}`);
      alert('Certificate generated successfully!');
      setShowIssueModal(false);
      setIssueUserId('');
      setIssueGroupId('');
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate.');
    } finally {
      setIssuing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="certificates" size={24} color="#235665" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('certificates_page.title')}</h2>
          </div>
          <p className="text-muted mb-0">{t('certificates_page.subtitle')}</p>
        </div>
        {(isAdmin || isOrganizer) && (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2" 
            onClick={() => setShowIssueModal(true)}
          >
            <span>+</span> {t('certificates_page.download_btn', 'Issue Certificate')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#235665' }} role="status"></div>
          <p className="mt-2 text-muted">Loading earned certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
            <Icon name="certificates" size={36} color="#235665" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>No Certificates Earned Yet</h5>
          <p className="text-muted small max-w-md mx-auto mb-0">
            {isAdmin || isOrganizer 
              ? 'No completion certificates have been issued yet. Click "+ Issue Certificate" above to generate one.'
              : 'Certificates are automatically awarded when you complete all payment cycles in an active Seettu contribution group.'}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {certificates.map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <div className="ui-card shadow-sm h-100 position-relative p-4 text-center">
                <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
                  <Icon name="certificates" size={36} color="#235665" />
                </div>
                <h5 className="fw-bold text-dark mb-1">{c.user?.fullName || c.user?.email || 'Completion Certificate'}</h5>
                <p className="fw-semibold small mb-1" style={{ color: '#235665' }}>Group: {c.group?.name || 'Seettu Group'}</p>
                <p className="text-muted small mb-3">Code: {c.certificateUuid ? `CERT-${c.certificateUuid.substring(0, 8).toUpperCase()}` : `CERT-${c.id}`}</p>
                <div className="p-2 bg-light rounded-3 mb-3">
                  <small className="text-muted d-block">Issued: {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}</small>
                </div>
                <button className="btn btn-teal w-100 fw-semibold" onClick={() => setPreviewCert(c)}>
                  {t('certificates_page.download_btn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#0C2340' }}>
                <h5 className="modal-title fw-bold">Certificate Preview</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewCert(null)}></button>
              </div>
              <div className="modal-body p-4 text-center overflow-auto" style={{ background: '#F1F5F9' }}>
                
                {/* Printable Certificate Template Container */}
                <div 
                  id="printableCertificate"
                  className="position-relative bg-white shadow-lg mx-auto p-5 text-start overflow-hidden" 
                  style={{ 
                    maxWidth: '1050px', 
                    minHeight: '720px', 
                    border: '3px solid #C5A059', 
                    borderRadius: '8px',
                    color: '#0C2340',
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}
                >
                  {/* Decorative Corner Swooshes */}
                  <svg className="position-absolute top-0 start-0" width="160" height="160" viewBox="0 0 160 160" fill="none" style={{ pointerEvents: 'none' }}>
                    <path d="M0 0 L160 0 Q80 80 0 160 Z" fill="#0C2340" />
                    <path d="M0 0 L130 0 Q65 65 0 130 Z" fill="#C5A059" />
                    <path d="M0 0 L100 0 Q50 50 0 100 Z" fill="#0C2340" />
                  </svg>

                  <svg className="position-absolute bottom-0 end-0" width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ pointerEvents: 'none' }}>
                    <path d="M180 180 L0 180 Q90 90 180 0 Z" fill="#0C2340" />
                    <path d="M180 180 L35 180 Q105 105 180 35 Z" fill="#C5A059" />
                    <path d="M180 180 L60 180 Q120 120 180 60 Z" fill="#0C2340" />
                  </svg>

                  {/* Top Header Row */}
                  <div className="d-flex justify-content-between align-items-center position-relative z-1 mb-4 pe-4 pt-3" style={{ paddingLeft: '85px' }}>
                    {/* Brand Logo & Name */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          border: '2.5px solid #C5A059',
                          boxShadow: '0 4px 14px rgba(12, 35, 64, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/logo.png"
                          alt="SeettuManager Logo"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <h2 className="fw-bold m-0" style={{ color: '#0C2340', fontSize: '1.95rem', letterSpacing: '-0.5px', fontFamily: "'Arial', sans-serif" }}>
                          Seettu<span style={{ color: '#0284C7' }}>Manager</span>
                        </h2>
                        <span className="text-muted small fw-medium" style={{ fontFamily: "'Arial', sans-serif", fontSize: '0.85rem' }}>Save Together. Manage Smarter.</span>
                      </div>
                    </div>

                    {/* Certificate ID & Ribbon Badge */}
                    <div className="text-end d-flex align-items-start gap-4">
                      <div className="pt-2">
                        <small className="text-muted fw-bold d-block" style={{ fontFamily: "'Arial', sans-serif", fontSize: '0.75rem' }}>
                          Certificate ID: <span style={{ color: '#0C2340' }}>{previewCert.certificateUuid ? `SM-2026-${previewCert.certificateUuid.substring(0, 4).toUpperCase()}` : `SM-2026-000${previewCert.id}`}</span>
                        </small>
                      </div>

                      {/* Dark Blue Ribbon Badge */}
                      <div className="position-relative text-center text-white" style={{ width: '85px', marginTop: '-24px', marginRight: '10px' }}>
                        <div className="p-3 pt-4 shadow-sm" style={{ background: '#0C2340', border: '2px solid #C5A059', borderRadius: '0 0 12px 12px' }}>
                          <svg className="mb-1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                          </svg>
                          <small className="d-block fw-bold text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.5px', color: '#D1D5DB' }}>
                            TOGETHER WE GROW
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Title Section */}
                  <div className="text-center my-4 position-relative z-1">
                    <h1 className="fw-bold tracking-widest text-uppercase m-0" style={{ color: '#0C2340', fontSize: '2.8rem', letterSpacing: '4px' }}>
                      CERTIFICATE
                    </h1>
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-1">
                      <div style={{ height: '1.5px', width: '90px', background: '#C5A059' }}></div>
                      <span className="fw-bold text-uppercase tracking-wider" style={{ color: '#0C2340', fontSize: '1.1rem', letterSpacing: '3px' }}>
                        OF PARTICIPATION
                      </span>
                      <div style={{ height: '1.5px', width: '90px', background: '#C5A059' }}></div>
                    </div>
                  </div>

                  {/* Recipient Name & Description */}
                  <div className="text-center position-relative z-1 my-4 px-4">
                    <p className="fst-italic text-secondary m-0" style={{ fontSize: '1.15rem' }}>This is to certify that</p>
                    
                    <div className="my-2 d-inline-block position-relative px-4">
                      <h2 className="fw-bold m-0" style={{ color: '#0C2340', fontSize: '2.5rem', fontFamily: "'Georgia', cursive, serif" }}>
                        {previewCert.user?.fullName || previewCert.user?.email || user?.fullName || 'Valued Member'}
                      </h2>
                      <div className="w-100 mt-1" style={{ height: '2px', background: '#C5A059' }}></div>
                    </div>

                    <p className="text-secondary mx-auto mt-3 mb-4" style={{ maxWidth: '720px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                      has successfully contributed to the Seettu group of <strong style={{ color: '#0C2340' }}>{previewCert.group?.name || 'SeettuManager'}</strong> and demonstrated financial discipline through timely payments and consistent participation.
                    </p>
                  </div>

                  {/* Details Summary Pill Box */}
                  <div className="mx-auto position-relative z-1 mb-4 p-3 px-4 shadow-sm" style={{ maxWidth: '820px', background: '#F0F6FC', border: '1px solid #D0E2F7', borderRadius: '14px' }}>
                    <div className="row text-center align-items-center">
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Group Name</small>
                        <strong className="text-dark d-block text-truncate" style={{ fontSize: '0.95rem' }}>{previewCert.group?.name || 'Friends Seettu'}</strong>
                      </div>
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Contribution Amount</small>
                        <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>LKR {(previewCert.group?.contributionAmount || 5000).toLocaleString()}</strong>
                      </div>
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Current Cycle</small>
                        <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>Completed</strong>
                      </div>
                      <div className="col-3">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Cycle Period</small>
                        <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>Jan 2026 – Dec 2026</strong>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Subtext */}
                  <div className="text-center position-relative z-1 mb-5">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div style={{ height: '1px', width: '50px', background: '#C5A059' }}></div>
                      <p className="fst-italic text-secondary small m-0" style={{ fontSize: '0.9rem' }}>
                        Your commitment builds a stronger community. Thank you for being a valued member!
                      </p>
                      <div style={{ height: '1px', width: '50px', background: '#C5A059' }}></div>
                    </div>
                  </div>

                  {/* Signatures & Golden Ribbon Seal Row */}
                  <div className="d-flex justify-content-between align-items-end position-relative z-1 px-5 pt-2 pb-3">
                    {/* Left: Signature Line */}
                    <div className="text-center" style={{ width: '220px' }}>
                      <div className="fst-italic fw-bold text-primary mb-1" style={{ fontFamily: "'Dancing Script', 'Georgia', cursive", fontSize: '1.4rem', color: '#0C2340' }}>
                        Janathan
                      </div>
                      <div style={{ height: '1px', background: '#0C2340', width: '100%' }}></div>
                      <strong className="d-block text-dark small mt-1" style={{ fontFamily: "'Arial', sans-serif" }}>System Administrator</strong>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem', fontFamily: "'Arial', sans-serif" }}>SeettuManager</small>
                    </div>

                    {/* Center: Gold Ribbon Medal Seal */}
                    <div className="text-center position-relative" style={{ marginBottom: '-10px' }}>
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', width: '75px', height: '75px', border: '4px solid #FEF3C7' }}>
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                      </div>
                    </div>

                    {/* Right: Date Line */}
                    <div className="text-center" style={{ width: '220px' }}>
                      <strong className="d-block text-dark small mb-1" style={{ fontSize: '0.95rem', fontFamily: "'Arial', sans-serif" }}>
                        {previewCert.issuedAt ? new Date(previewCert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </strong>
                      <div style={{ height: '1px', background: '#0C2340', width: '100%' }}></div>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Date</small>
                    </div>
                  </div>
                </div>

              </div>
              <div className="modal-footer py-3 px-4 bg-light">
                <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setPreviewCert(null)}>Close</button>
                <button type="button" className="btn btn-teal px-4" style={{ borderRadius: '8px' }} onClick={handlePrint}>Print Certificate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal for Admin / Organizer */}
      {showIssueModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">Issue Completion Certificate</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowIssueModal(false)}></button>
              </div>
              <form onSubmit={handleIssueCertificate}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Select Member / User</label>
                    <select
                      className="form-select"
                      value={issueUserId}
                      onChange={(e) => setIssueUserId(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    >
                      <option value="">-- Select Member --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email} (ID #{u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Select Seettu Group</label>
                    <select
                      className="form-select"
                      value={issueGroupId}
                      onChange={(e) => setIssueGroupId(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    >
                      <option value="">-- Select Seettu Group --</option>
                      {allGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (ID #{g.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowIssueModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }} disabled={issuing}>
                    {issuing ? 'Generating...' : 'Issue Certificate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
