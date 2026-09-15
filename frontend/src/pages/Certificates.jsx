import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates/user/${user.userId}`);
      setCertificates(res.data?.data || []);
    } catch (err) {
      console.error('Error loading certificates', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">🎓 Seettu Completion Certificates</h2>
          <p className="text-muted mb-0">Official completion badges awarded upon successfully finishing full group payment cycles</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2 text-muted">Loading earned certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3.5rem' }}>🎓</div>
          <h5 className="fw-bold mt-3">No Certificates Earned Yet</h5>
          <p className="text-muted max-w-md mx-auto">
            Certificates are automatically awarded when you complete all payment cycles in an active Seettu contribution group.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {certificates.map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-warning border-2 h-100 position-relative">
                <div className="card-body text-center p-4">
                  <div className="display-3 text-warning mb-3">🏆</div>
                  <h5 className="fw-bold text-dark mb-1">Completion Certificate</h5>
                  <p className="text-primary fw-bold small mb-3">Code: {c.certificateCode || `CERT-${c.id}`}</p>
                  <p className="text-muted small mb-3">
                    Granted for excellent financial discipline and 100% timely cycle contributions.
                  </p>
                  <div className="p-2 bg-light rounded-3 mb-3">
                    <small className="text-muted d-block">Issued: {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : 'N/A'}</small>
                  </div>
                  <button className="btn btn-outline-warning text-dark fw-bold w-100" onClick={() => setPreviewCert(c)}>
                    👁 Preview / Print Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">🎓 Certificate Preview</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewCert(null)}></button>
              </div>
              <div className="modal-body p-5 text-center" style={{ background: '#fffdf5' }}>
                <div className="border border-warning border-4 p-5 rounded-4 shadow-sm position-relative">
                  <div style={{ fontSize: '4rem' }}>🏅</div>
                  <h2 className="fw-extrabold text-dark mt-2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    CERTIFICATE OF COMPLETION
                  </h2>
                  <p className="text-muted text-uppercase tracking-widest small fw-bold">Seettu Manager System</p>
                  <hr className="my-4" />
                  <p className="lead text-dark">This is to certify that</p>
                  <h3 className="fw-bold text-primary mb-3">{user?.fullName || 'Valued Member'}</h3>
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
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPreviewCert(null)}>Close</button>
                <button type="button" className="btn btn-warning fw-bold text-dark" onClick={handlePrint}>🖨 Print Certificate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
