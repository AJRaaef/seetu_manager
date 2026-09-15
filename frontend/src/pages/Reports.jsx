import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as reportApi from '../api/reportApi';

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
      const res = await reportApi.getReportsByUser(user.userId);
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
      await reportApi.generateReport(formData.title, formData.type, user.userId, formData.content);
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
          <h2 className="fw-bold mb-1">📈 Analytics & System Reports</h2>
          <p className="text-muted mb-0">Generate, review, and print audit summaries for financial groups</p>
        </div>
        <button className="btn btn-primary shadow-sm fw-bold" onClick={() => setShowModal(true)}>
          ➕ Generate New Report
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading audit reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>📈</div>
          <h5 className="fw-bold mt-3">No Reports Generated Yet</h5>
          <p className="text-muted">Generate group summary, payment audit, or discipline score reports.</p>
          <div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Generate First Report
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {reports.map((r) => (
            <div key={r.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white border-bottom-0 pt-4 d-flex justify-content-between align-items-start">
                  <span className="badge bg-primary-subtle text-primary border fw-bold">{r.type}</span>
                  <span className="small text-muted">#{r.id}</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title fw-bold text-dark mb-2">{r.title}</h5>
                  <p className="card-text text-muted small mb-3">{r.content || 'System generated summary audit report.'}</p>
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <small className="text-muted d-block">
                      <strong>Generated On:</strong> {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}
                    </small>
                  </div>
                  <button className="btn btn-outline-primary w-100 fw-bold" onClick={() => setSelectedReport(r)}>
                    👁 View / Print Report
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Generate New Report</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Report Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Monthly Seettu Group Audit Q3"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Report Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="GROUP_SUMMARY">Group Summary</option>
                      <option value="PAYMENT_AUDIT">Payment Audit</option>
                      <option value="DISCIPLINE_SCORE_SUMMARY">Discipline Score Summary</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes / Content</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Audit notes or observations..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-bold">Generate Report</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Print Report Modal */}
      {selectedReport && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">📄 {selectedReport.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="border p-4 rounded-3 bg-light">
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <div>
                      <h4 className="fw-bold mb-0">Seettu Manager Audit System</h4>
                      <small className="text-muted">Report ID: #{selectedReport.id}</small>
                    </div>
                    <span className="badge bg-primary fs-6">{selectedReport.type}</span>
                  </div>
                  <h5 className="fw-bold text-dark">{selectedReport.title}</h5>
                  <p className="text-dark mt-3">{selectedReport.content || 'System performance summary and transactional audit.'}</p>
                  <hr />
                  <div className="row text-muted small">
                    <div className="col-6">
                      <strong>Generated By:</strong> User #{user.userId} ({user.fullName})
                    </div>
                    <div className="col-6 text-end">
                      <strong>Date:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
                <button type="button" className="btn btn-success fw-bold" onClick={handlePrint}>🖨 Print / Export PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
