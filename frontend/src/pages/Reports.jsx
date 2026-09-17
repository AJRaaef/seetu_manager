import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as reportApi from '../api/reportApi';
import Icon from '../components/Icons';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'GROUP_SUMMARY',
    content: '',
  });

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const uid = user?.userId || user?.id;
      const res = await reportApi.getReportsByUser(uid);
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reports list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const uid = user?.userId || user?.id;
      await reportApi.generateReport(formData.title, formData.type, uid, formData.content);
      setShowModal(false);
      setFormData({ title: '', type: 'GROUP_SUMMARY', content: '' });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report.');
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
            <Icon name="reports" size={24} color="#235665" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Analytics & System Reports</h2>
          </div>
          <p className="text-muted mb-0">Generate, review, and print audit summaries for financial groups</p>
        </div>
        <button 
          className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2" 
          onClick={() => setShowModal(true)}
        >
          <span>+</span> Generate New Report
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4 rounded-3">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#235665' }} role="status"></div>
          <p className="mt-2 text-muted">Loading audit reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
            <Icon name="reports" size={36} color="#235665" />
          </div>
          <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>No Reports Generated Yet</h5>
          <p className="text-muted small mb-4">Generate group summary, payment audit, or discipline score reports.</p>
          <div>
            <button className="btn btn-teal px-4 py-2" onClick={() => setShowModal(true)}>
              Generate First Report
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reports.map((r) => (
            <div key={r.id} className="col-md-6 col-lg-4">
              <div className="ui-card shadow-sm h-100 border-0 p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge rounded-pill" style={{ backgroundColor: '#E8F0F3', color: '#235665', border: '1px solid #DCE7EB' }}>
                    {r.type}
                  </span>
                  <span className="small text-muted">#{r.id}</span>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-2">{r.title}</h5>
                  <p className="text-muted small mb-3">{r.content || 'System generated summary audit report.'}</p>
                  <div className="p-2 bg-light rounded-3 mb-3">
                    <small className="text-muted d-block">
                      <strong>Generated On:</strong> {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}
                    </small>
                  </div>
                  <button 
                    className="btn btn-outline-primary w-100 fw-semibold" 
                    onClick={() => setSelectedReport(r)}
                  >
                    View / Print Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {showModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">Generate New Report</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Report Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Monthly Seettu Group Audit Q3"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Report Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="GROUP_SUMMARY">Group Summary</option>
                      <option value="PAYMENT_AUDIT">Payment Audit</option>
                      <option value="DISCIPLINE_SCORE_SUMMARY">Discipline Score Summary</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Notes / Content</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Audit notes or observations..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>Generate Report</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Print Report Modal */}
      {selectedReport && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white" style={{ backgroundColor: '#134A5A' }}>
                <h5 className="modal-title fw-bold">{selectedReport.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="border p-4 rounded-3 bg-light">
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <div>
                      <h4 className="fw-bold mb-0" style={{ color: '#1A3644' }}>Seettu Manager Audit System</h4>
                      <small className="text-muted">Report ID: #{selectedReport.id}</small>
                    </div>
                    <span className="badge rounded-pill" style={{ backgroundColor: '#E8F0F3', color: '#235665' }}>{selectedReport.type}</span>
                  </div>
                  <p><strong>Title:</strong> {selectedReport.title}</p>
                  <p><strong>Generated By Member:</strong> {user?.fullName || 'Organizer/Admin'}</p>
                  <p><strong>Date:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
                  <hr />
                  <div className="bg-white p-3 rounded-2 border">
                    <h6 className="fw-bold mb-2" style={{ color: '#1A3644' }}>Audit Findings & Ledger Summary:</h6>
                    <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReport.content || 'All contribution cycles and payment balances verified consistent. No discipline anomalies detected.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer py-3 px-4 bg-light">
                <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setSelectedReport(null)}>Close</button>
                <button type="button" className="btn btn-teal px-4" style={{ borderRadius: '8px' }} onClick={handlePrint}>Print Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
