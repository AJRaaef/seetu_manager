import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import Icon from '../components/Icons';

const Certificates = () => {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueUserId, setIssueUserId] = useState('');
  const [issueGroupId, setIssueGroupId] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;
      const res = await api.get(`/certificates/user/${uid}`);
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
      alert('Please enter both User ID and Group ID');
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
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Seettu Completion Certificates</h2>
          </div>
          <p className="text-muted mb-0">Official completion badges awarded upon successfully finishing full group payment cycles</p>
        </div>
        {(isAdmin || isOrganizer) && (
          <button 
            className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2" 
            onClick={() => setShowIssueModal(true)}
          >
            <span>+</span> Issue Certificate
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
            Certificates are automatically awarded when you complete all payment cycles in an active Seettu contribution group.
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
                <h5 className="fw-bold text-dark mb-1">Completion Certificate</h5>
                <p className="fw-semibold small mb-3" style={{ color: '#235665' }}>Code: {c.certificateCode || `CERT-${c.id}`}</p>
                <p className="text-muted small mb-3">
                  Granted for excellent financial discipline and 100% timely cycle contributions.
                </p>
                <div className="p-2 bg-light rounded-3 mb-3">
                  <small className="text-muted d-block">Issued: {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : 'N/A'}</small>
                </div>
                <button className="btn btn-teal w-100 fw-semibold" onClick={() => setPreviewCert(c)}>
                  Preview / Print Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">Certificate Preview</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewCert(null)}></button>
              </div>
              <div className="modal-body p-5 text-center" style={{ background: '#F8FAFC' }}>
                <div className="border p-5 rounded-4 shadow-sm position-relative bg-white" style={{ borderColor: '#DCE7EB' }}>
                  <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
                    <Icon name="certificates" size={48} color="#235665" />
                  </div>
                  <h2 className="fw-extrabold text-dark mt-2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    CERTIFICATE OF COMPLETION
                  </h2>
                  <p className="text-muted text-uppercase tracking-widest small fw-bold">Seettu Manager System</p>
                  <hr className="my-4" />
                  <p className="lead text-dark">This is to certify that</p>
                  <h3 className="fw-bold mb-3" style={{ color: '#235665' }}>{user?.fullName || 'Valued Member'}</h3>
                  <p className="text-muted px-lg-5">
                    has successfully completed all contribution payment obligations for Seettu Group Cycle with 100% financial discipline score.
                  </p>
                  <div className="row mt-5 pt-3">
                    <div className="col-6 text-start">
                      <small className="text-muted d-block">Certificate Code:</small>
                      <strong className="text-dark">{previewCert.certificateCode || `CERT-${previewCert.id}`}</strong>
                    </div>
                    <div className="col-6 text-end">
                      <small className="text-muted d-block">Issued Date:</small>
                      <strong className="text-dark">{previewCert.issuedAt ? new Date(previewCert.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}</strong>
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
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>User ID</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 5"
                      value={issueUserId}
                      onChange={(e) => setIssueUserId(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Group ID</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 1"
                      value={issueGroupId}
                      onChange={(e) => setIssueGroupId(e.target.value)}
                      style={{ borderRadius: '8px' }}
                      required
                    />
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
