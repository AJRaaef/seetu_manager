import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import * as groupApi from '../api/groupApi';
import { getAllMembersWithKyc } from '../api/userApi';
import Icon from '../components/Icons';

const Certificates = () => {
  const { t } = useTranslation();
  const { user, isAdmin, isOrganizer } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  // Issue modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueUserId, setIssueUserId] = useState('');
  const [issueGroupId, setIssueGroupId] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Edit / Modify modal state
  const [editCert, setEditCert] = useState(null);
  const [editUserId, setEditUserId] = useState('');
  const [editGroupId, setEditGroupId] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deleteCert, setDeleteCert] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  const [allGroups, setAllGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchCertificates();
    if (isAdmin || isOrganizer) {
      fetchGroupsAndUsers();
    }
  }, [user]);

  const fetchGroupsAndUsers = async () => {
    try {
      const [gRes, mRes, kycRes] = await Promise.all([
        groupApi.getAllGroups().catch(() => ({ data: [] })),
        groupApi.getAllMembers().catch(() => ({ data: [] })),
        getAllMembersWithKyc().catch(() => ({ data: [] }))
      ]);

      const gList = gRes?.data || gRes || [];
      const mList = mRes?.data || mRes || [];
      const kycList = kycRes?.data || kycRes || [];

      setAllGroups(Array.isArray(gList) ? gList : []);

      // Deduplicate members/users and strictly EXCLUDE System Admins
      // (System Admin does not receive or participate in savings certificates)
      const userMap = new Map();

      const addUserIfEligible = (u) => {
        if (!u || !u.id) return;
        const role = (u.role || '').toUpperCase();
        // Skip System Administrators
        if (role.includes('ADMIN')) return;
        userMap.set(u.id, u);
      };

      if (Array.isArray(mList)) {
        mList.forEach((m) => {
          const u = m.user || m;
          addUserIfEligible(u);
        });
      }

      if (Array.isArray(kycList)) {
        kycList.forEach((k) => {
          const u = k.user || k;
          addUserIfEligible(u);
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

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  // Issue Certificate
  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!issueUserId || !issueGroupId) {
      alert('Please select both a Member and a Seettu Group');
      return;
    }
    try {
      setIssuing(true);
      await api.post(`/certificates?userId=${issueUserId}&groupId=${issueGroupId}`);
      showNotification('success', 'Completion certificate generated and issued successfully!');
      setShowIssueModal(false);
      setIssueUserId('');
      setIssueGroupId('');
      fetchCertificates();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Failed to generate certificate.');
    } finally {
      setIssuing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setEditCert(c);
    setEditUserId(c.user?.id || '');
    setEditGroupId(c.group?.id || '');
  };

  // Submit Edit / Modify
  const handleUpdateCertificate = async (e) => {
    e.preventDefault();
    if (!editCert || !editUserId || !editGroupId) {
      alert('Please specify both Member and Seettu Group.');
      return;
    }
    try {
      setUpdating(true);
      await api.put(`/certificates/${editCert.id}?userId=${editUserId}&groupId=${editGroupId}`);
      showNotification('success', `Certificate #${editCert.id} modified successfully!`);
      setEditCert(null);
      fetchCertificates();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Failed to update certificate.');
    } finally {
      setUpdating(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deleteCert) return;
    try {
      setDeleting(true);
      await api.delete(`/certificates/${deleteCert.id}`);
      showNotification('success', `Certificate #${deleteCert.id} permanently deleted.`);
      setDeleteCert(null);
      fetchCertificates();
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Failed to delete certificate.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!previewCert) return;

    try {
      setDownloadingCertificate(true);
      const response = await api.get(`/certificates/${previewCert.id}/download`, {
        responseType: 'blob'
      });
      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `CERT_${previewCert.certificateUuid || previewCert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (err) {
      console.error('Error downloading certificate', err);
      showNotification('danger', err.response?.data?.message || 'Failed to download certificate.');
    } finally {
      setDownloadingCertificate(false);
    }
  };

  // Filtered Certificates
  const filteredCertificates = certificates.filter((c) => {
    if (selectedGroupFilter !== 'ALL' && String(c.group?.id) !== String(selectedGroupFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const memberName = (c.user?.fullName || c.user?.email || '').toLowerCase();
      const groupName = (c.group?.name || '').toLowerCase();
      const uuid = (c.certificateUuid || '').toLowerCase();
      return memberName.includes(q) || groupName.includes(q) || uuid.includes(q);
    }
    return true;
  });

  return (
    <div className="py-2">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="certificates" size={26} color="#0097B2" />
            <h2 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>
              {isAdmin
                ? t('certificates_page.admin_title', 'Certificates Oversight')
                : isOrganizer
                ? t('certificates_page.organizer_title', 'Circle Completion Certificates')
                : t('certificates_page.title', 'My Completion Certificates')}
            </h2>
            {isAdmin ? (
              <span className="badge bg-light text-secondary border px-2.5 py-1 small fw-bold">
                PLATFORM OVERSIGHT
              </span>
            ) : isOrganizer ? (
              <span className="badge bg-teal-subtle text-teal border border-teal-subtle px-2.5 py-1 small fw-bold">
                ORGANIZER DESK
              </span>
            ) : null}
          </div>
          <p className="text-muted mb-0">
            {isAdmin
              ? 'Oversee all statutory completion certificates across circles, verify credentials, and audit compliance.'
              : isOrganizer
              ? 'Issue and manage verified completion certificates for members who completed all cycle contributions in your circles.'
              : t('certificates_page.subtitle', 'Official recognized certificates verifying your successful contributions.')}
          </p>
        </div>

        {isAdmin ? (
          <span className="badge bg-light text-secondary border px-3 py-2 small fw-semibold d-inline-flex align-items-center gap-1.5">
            <Icon name="shield" size={15} />
            <span>Platform Oversight Mode</span>
          </span>
        ) : isOrganizer ? (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold text-white" 
            onClick={() => setShowIssueModal(true)}
          >
            <Icon name="plus" size={16} />
            <span>{t('certificates_page.issue_btn', 'Issue Certificate')}</span>
          </button>
        ) : null}
      </div>

      {/* Feedback Toast */}
      {feedback.message && (
        <div className={`alert alert-${feedback.type} shadow-sm d-flex align-items-center gap-2 mb-4 py-2.5 px-3 rounded-3`}>
          <Icon name={feedback.type === 'success' ? 'check' : 'alert-circle'} size={18} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search and Filter Toolbar (For Admin / Organizer) */}
      {(isAdmin || isOrganizer) && certificates.length > 0 && (
        <div className="card shadow-sm border-0 rounded-3 p-3 mb-4 bg-white">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <Icon name="search" size={15} color="#64748B" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by member name, group, or certificate code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
              >
                <option value="ALL">All Seettu Circles ({certificates.length})</option>
                {allGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2 text-md-end text-muted small">
              <strong>{filteredCertificates.length}</strong> certificates found
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#0097B2' }} role="status"></div>
          <p className="mt-2 text-muted">Loading certificates ledger...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0 rounded-4 bg-white">
          <div className="d-inline-flex p-3 rounded-circle mb-3 mx-auto" style={{ backgroundColor: '#E8F6F8' }}>
            <Icon name="certificates" size={40} color="#0097B2" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#0F2F3D' }}>
            {isAdmin || isOrganizer ? 'No Certificates Found' : 'No Certificates Earned Yet'}
          </h5>
          <p className="text-muted small max-w-md mx-auto mb-3">
            {isAdmin || isOrganizer 
              ? 'No member certificates match your search criteria. Click "+ Issue Certificate" above to generate one.'
              : 'Completion certificates are awarded when you fulfill all monthly contribution cycles in an active Seettu group.'}
          </p>
          {(isAdmin || isOrganizer) && (
            <div>
              <button 
                className="btn btn-teal btn-sm fw-bold px-3 py-1.5 text-white"
                onClick={() => setShowIssueModal(true)}
              >
                + Issue Certificate Now
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredCertificates.map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 position-relative p-4 text-center border-0 rounded-4 bg-white hover-shadow transition-all">
                {/* Top Badge */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-secondary-subtle text-secondary small px-2 py-0.5 font-monospace">
                    {c.certificateUuid ? `CERT-${c.certificateUuid.substring(0, 8).toUpperCase()}` : `CERT-${c.id}`}
                  </span>
                  <span className="badge bg-success-subtle text-success small px-2 py-0.5">
                    ● Verified Active
                  </span>
                </div>

                {/* Ribbon Icon */}
                <div className="d-inline-flex p-3 rounded-circle mb-3 mx-auto" style={{ backgroundColor: '#E8F6F8' }}>
                  <Icon name="certificates" size={32} color="#0097B2" />
                </div>

                {/* Recipient Details */}
                <h5 className="fw-bold text-dark mb-1 text-truncate" title={c.user?.fullName || c.user?.email}>
                  {c.user?.fullName || c.user?.email || 'Member Certificate'}
                </h5>
                <p className="text-muted small mb-2 text-truncate">{c.user?.email || ''}</p>

                {/* Group Box */}
                <div className="p-2.5 rounded-3 mb-3 text-start" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">Circle:</span>
                    <strong className="small text-dark text-truncate" style={{ maxWidth: '170px' }}>
                      {c.group?.name || 'Seettu Circle'}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Contribution:</span>
                    <span className="small fw-semibold text-dark">
                      LKR {(c.group?.contributionAmount || 5000).toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1 pt-1 border-top border-light-subtle">
                    <span className="text-muted" style={{ fontSize: '11px' }}>Issued:</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>
                      {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-2 mt-auto">
                  <button 
                    className="btn btn-teal w-100 fw-bold text-white d-flex align-items-center justify-content-center gap-2 py-2"
                    onClick={() => setPreviewCert(c)}
                  >
                    <Icon name="eye" size={15} />
                    <span>View Certificate</span>
                  </button>

                  {(isAdmin || isOrganizer) && (
                    <div className="d-flex gap-2 w-100" role="group" aria-label="Certificate actions">
                      <button 
                        type="button"
                        className="btn btn-light border btn-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-2 py-2 flex-fill"
                        onClick={() => handleOpenEdit(c)}
                        title="Modify / Edit Certificate Details"
                      >
                        <Icon name="pencil" size={14} color="#235665" />
                        <span>Modify</span>
                      </button>
                      <button 
                        type="button"
                        className="btn btn-outline-danger btn-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-2 py-2 flex-fill"
                        onClick={() => setDeleteCert(c)}
                        title="Delete Certificate Record"
                      >
                        <Icon name="trash" size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== MODAL: CERTIFICATE PREVIEW / PRINT ===================== */}
      {previewCert && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 47, 61, 0.75)', zIndex: 1060 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Icon name="certificates" size={20} color="#00E5FF" />
                  <span>Certificate Preview & Print</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewCert(null)}></button>
              </div>

              <div className="modal-body p-4 text-center overflow-auto" style={{ background: '#F1F5F9' }}>
                {/* Printable Certificate Template */}
                <div 
                  id="printableCertificate"
                  className="position-relative bg-white shadow-lg mx-auto p-5 text-start overflow-hidden" 
                  style={{ 
                    maxWidth: '1050px', 
                    minHeight: '720px', 
                    border: '3px solid #C5A059', 
                    borderRadius: '8px',
                    color: '#0F2F3D',
                    fontFamily: "'Georgia', 'Times New Roman', serif"
                  }}
                >
                  {/* Decorative Corner Swooshes */}
                  <svg className="position-absolute top-0 start-0" width="160" height="160" viewBox="0 0 160 160" fill="none" style={{ pointerEvents: 'none' }}>
                    <path d="M0 0 L160 0 Q80 80 0 160 Z" fill="#0F2F3D" />
                    <path d="M0 0 L130 0 Q65 65 0 130 Z" fill="#C5A059" />
                    <path d="M0 0 L100 0 Q50 50 0 100 Z" fill="#0F2F3D" />
                  </svg>

                  <svg className="position-absolute bottom-0 end-0" width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ pointerEvents: 'none' }}>
                    <path d="M180 180 L0 180 Q90 90 180 0 Z" fill="#0F2F3D" />
                    <path d="M180 180 L35 180 Q105 105 180 35 Z" fill="#C5A059" />
                    <path d="M180 180 L60 180 Q120 120 180 60 Z" fill="#0F2F3D" />
                  </svg>

                  {/* Header Row */}
                  <div className="d-flex justify-content-between align-items-center position-relative z-1 mb-4 pe-4 pt-3" style={{ paddingLeft: '85px' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          border: '2.5px solid #C5A059',
                          boxShadow: '0 4px 14px rgba(15, 47, 61, 0.15)',
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
                        <h2 className="fw-bold m-0" style={{ color: '#0F2F3D', fontSize: '1.95rem', letterSpacing: '-0.5px', fontFamily: "'Arial', sans-serif" }}>
                          Seettu<span style={{ color: '#0097B2' }}>Manager</span>
                        </h2>
                        <span className="text-muted small fw-medium" style={{ fontFamily: "'Arial', sans-serif", fontSize: '0.85rem' }}>Save Together. Manage Smarter. • Sri Lanka</span>
                      </div>
                    </div>

                    <div className="text-end d-flex align-items-start gap-4">
                      <div className="pt-2">
                        <small className="text-muted fw-bold d-block" style={{ fontFamily: "'Arial', sans-serif", fontSize: '0.75rem' }}>
                          Certificate ID: <span style={{ color: '#0F2F3D' }}>{previewCert.certificateUuid ? `SM-2026-${previewCert.certificateUuid.substring(0, 8).toUpperCase()}` : `SM-2026-000${previewCert.id}`}</span>
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>The Cheetus Ordinance No. 61 of 1935</small>
                      </div>

                      <div className="position-relative text-center text-white" style={{ width: '85px', marginTop: '-24px', marginRight: '10px' }}>
                        <div className="p-3 pt-4 shadow-sm" style={{ background: '#0F2F3D', border: '2px solid #C5A059', borderRadius: '0 0 12px 12px' }}>
                          <Icon name="award" size={26} color="#C5A059" className="mb-1" />
                          <small className="d-block fw-bold text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.5px', color: '#D1D5DB' }}>
                            OFFICIAL AUDIT
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Title Section */}
                  <div className="text-center my-4 position-relative z-1">
                    <h1 className="fw-bold tracking-widest text-uppercase m-0" style={{ color: '#0F2F3D', fontSize: '2.8rem', letterSpacing: '4px' }}>
                      CERTIFICATE
                    </h1>
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-1">
                      <div style={{ height: '1.5px', width: '90px', background: '#C5A059' }}></div>
                      <span className="fw-bold text-uppercase tracking-wider" style={{ color: '#0F2F3D', fontSize: '1.1rem', letterSpacing: '3px' }}>
                        OF COMPLETION
                      </span>
                      <div style={{ height: '1.5px', width: '90px', background: '#C5A059' }}></div>
                    </div>
                  </div>

                  {/* Recipient Name */}
                  <div className="text-center position-relative z-1 my-4 px-4">
                    <p className="fst-italic text-secondary m-0" style={{ fontSize: '1.15rem' }}>This is to certify that</p>
                    
                    <div className="my-2 d-inline-block position-relative px-4">
                      <h2 className="fw-bold m-0" style={{ color: '#0F2F3D', fontSize: '2.5rem', fontFamily: "'Georgia', cursive, serif" }}>
                        {previewCert.user?.fullName || previewCert.user?.email || 'Valued Member'}
                      </h2>
                      <div className="w-100 mt-1" style={{ height: '2px', background: '#C5A059' }}></div>
                    </div>

                    <p className="text-secondary mx-auto mt-3 mb-4" style={{ maxWidth: '720px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                      has successfully satisfied all statutory monthly contributions to the Seettu group <strong style={{ color: '#0F2F3D' }}>{previewCert.group?.name || 'SeettuManager Circle'}</strong> and demonstrated verified financial integrity through timely rotational cycle payments.
                    </p>
                  </div>

                  {/* Details Summary Pill */}
                  <div className="mx-auto position-relative z-1 mb-4 p-3 px-4 shadow-sm" style={{ maxWidth: '820px', background: '#F0F6FC', border: '1px solid #D0E2F7', borderRadius: '14px' }}>
                    <div className="row text-center align-items-center">
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Group Name</small>
                        <strong className="text-dark d-block text-truncate" style={{ fontSize: '0.95rem' }}>{previewCert.group?.name || 'Seettu Circle'}</strong>
                      </div>
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Contribution Amount</small>
                        <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>LKR {(previewCert.group?.contributionAmount || 5000).toLocaleString()}</strong>
                      </div>
                      <div className="col-3 border-end border-secondary-subtle">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Financial Discipline</small>
                        <strong className="text-success d-block" style={{ fontSize: '0.95rem' }}>100 / 100 Rating</strong>
                      </div>
                      <div className="col-3">
                        <small className="text-muted d-block fw-medium" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Legal Status</small>
                        <strong className="text-dark d-block" style={{ fontSize: '0.95rem' }}>Satisfied & Settled</strong>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="d-flex justify-content-between align-items-end position-relative z-1 px-5 pt-3 pb-2">
                    <div className="text-center" style={{ width: '220px' }}>
                      <div className="fst-italic fw-bold mb-1" style={{ fontFamily: "'Dancing Script', 'Georgia', cursive", fontSize: '1.4rem', color: '#0F2F3D' }}>
                        SeettuManager Core
                      </div>
                      <div style={{ height: '1px', background: '#0F2F3D', width: '100%' }}></div>
                      <strong className="d-block text-dark small mt-1" style={{ fontFamily: "'Arial', sans-serif" }}>Chief Administrator</strong>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem', fontFamily: "'Arial', sans-serif" }}>Audit Verification Engine</small>
                    </div>

                    <div className="text-center position-relative" style={{ marginBottom: '-10px' }}>
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', width: '75px', height: '75px', border: '4px solid #FEF3C7' }}>
                        <Icon name="award" size={38} color="#FFFFFF" />
                      </div>
                    </div>

                    <div className="text-center" style={{ width: '220px' }}>
                      <strong className="d-block text-dark small mb-1" style={{ fontSize: '0.95rem', fontFamily: "'Arial', sans-serif" }}>
                        {previewCert.issuedAt ? new Date(previewCert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </strong>
                      <div style={{ height: '1px', background: '#0F2F3D', width: '100%' }}></div>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem', fontFamily: "'Arial', sans-serif" }}>Date of Issuance</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer py-3 px-4 bg-light d-flex justify-content-between">
                <span className="small text-muted font-monospace">
                  Ref: {previewCert.certificateUuid}
                </span>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setPreviewCert(null)}>
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-teal btn-sm px-4 fw-bold text-white d-inline-flex align-items-center gap-1.5"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCertificate}
                  >
                    {downloadingCertificate ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="download" size={14} />
                        <span>Download Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ISSUE NEW CERTIFICATE ===================== */}
      {showIssueModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 47, 61, 0.65)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Icon name="certificates" size={18} color="#00E5FF" />
                  <span>Issue Completion Certificate</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowIssueModal(false)}></button>
              </div>
              <form onSubmit={handleIssueCertificate}>
                <div className="modal-body p-4 bg-light-subtle">
                  <p className="text-muted small mb-3">
                    Award an official completion certificate to a subscriber who completed rotational cycles in a group.
                  </p>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold small">
                      Select Member / Subscriber *
                    </label>
                    <select
                      className="form-select"
                      value={issueUserId}
                      onChange={(e) => setIssueUserId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email} (ID #{u.id})
                        </option>
                      ))}
                    </select>
                    <div className="form-text text-muted small" style={{ fontSize: '11px' }}>
                      (System administrators are excluded from certificate eligibility)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold small">
                      Select Seettu Group *
                    </label>
                    <select
                      className="form-select"
                      value={issueGroupId}
                      onChange={(e) => setIssueGroupId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Seettu Group --</option>
                      {allGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (LKR {(g.contributionAmount || 0).toLocaleString()} • ID #{g.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowIssueModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-teal btn-sm px-4 fw-bold text-white d-flex align-items-center gap-2"
                    disabled={issuing}
                  >
                    {issuing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        <span>Issue Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT / MODIFY CERTIFICATE ===================== */}
      {editCert && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 47, 61, 0.65)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Icon name="pencil" size={18} color="#00E5FF" />
                  <span>Modify Certificate #{editCert.id}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditCert(null)}></button>
              </div>
              <form onSubmit={handleUpdateCertificate}>
                <div className="modal-body p-4 bg-light-subtle">
                  <div className="alert alert-info py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                    <Icon name="info" size={16} />
                    <span>
                      Modifying this record will automatically regenerate the PDF certificate and update all verification logs.
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold small">Certificate Code</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm bg-light" 
                      value={editCert.certificateUuid || ''} 
                      disabled 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold small">
                      Select Member / Subscriber *
                    </label>
                    <select
                      className="form-select"
                      value={editUserId}
                      onChange={(e) => setEditUserId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email} (ID #{u.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold small">
                      Select Seettu Group *
                    </label>
                    <select
                      className="form-select"
                      value={editGroupId}
                      onChange={(e) => setEditGroupId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Seettu Group --</option>
                      {allGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (LKR {(g.contributionAmount || 0).toLocaleString()} • ID #{g.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setEditCert(null)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-teal btn-sm px-4 fw-bold text-white d-flex align-items-center gap-2"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DELETE CONFIRMATION ===================== */}
      {deleteCert && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 47, 61, 0.75)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header py-3 px-4 text-white bg-danger">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Icon name="trash" size={18} color="#FFFFFF" />
                  <span>Delete Certificate Confirmation</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteCert(null)}></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="d-inline-flex p-3 rounded-circle mb-3 bg-danger-subtle text-danger">
                  <Icon name="trash" size={36} color="#DC2626" />
                </div>
                <h5 className="fw-bold text-dark mb-2">Permanently Delete Certificate?</h5>
                <p className="text-muted small mb-3">
                  Are you sure you want to permanently delete this completion certificate? This action will remove the record from the database and delete the generated PDF file.
                </p>

                <div className="card bg-light border p-3 rounded-3 text-start small mb-3">
                  <div className="mb-1">
                    <strong>Recipient:</strong> {deleteCert.user?.fullName || deleteCert.user?.email || 'Member'}
                  </div>
                  <div className="mb-1">
                    <strong>Group:</strong> {deleteCert.group?.name || 'Seettu Group'}
                  </div>
                  <div className="mb-1">
                    <strong>Certificate Code:</strong> <span className="font-monospace">{deleteCert.certificateUuid}</span>
                  </div>
                  <div>
                    <strong>Issued Date:</strong> {deleteCert.issuedAt ? new Date(deleteCert.issuedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="text-danger small fw-semibold">
                  ⚠️ This action is irreversible.
                </div>
              </div>

              <div className="modal-footer py-3 px-4 bg-light d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3" 
                  onClick={() => setDeleteCert(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm px-4 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="trash" size={14} />
                      <span>Yes, Delete Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
