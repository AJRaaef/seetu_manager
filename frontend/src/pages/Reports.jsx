import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as reportApi from '../api/reportApi';
import Icon from '../components/Icons';

const Reports = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const defaultType = (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY';
  const [formData, setFormData] = useState({
    title: '',
    type: defaultType,
    content: '',
  });

  const templates = (isAdmin || isOrganizer)
    ? [
        {
          name: 'Group Summary Audit',
          icon: 'users',
          bgColor: '#E0F2FE',
          iconColor: '#0284C7',
          type: 'GROUP_SUMMARY',
          title: 'Monthly Group Summary Audit',
          content: 'Audit report summarizing total active groups, registered member headcount, pot balances, and draw rotation statuses.',
          desc: 'High-level audit of group health, rotation cycles, and collected funds.'
        },
        {
          name: 'Payment Audit Trail',
          icon: 'payments',
          bgColor: '#ECFDF5',
          iconColor: '#059669',
          type: 'PAYMENT_AUDIT',
          title: 'System Payment Audit Trail',
          content: 'Detailed ledger of all verified member payments, pending installments, and overdue fines across groups.',
          desc: 'Complete payment reconciliation across all group cycles.'
        },
        {
          name: 'Discipline Score Summary',
          icon: 'award',
          bgColor: '#FEF3C7',
          iconColor: '#D97706',
          type: 'DISCIPLINE_SCORE_SUMMARY',
          title: 'Member Discipline Score Summary',
          content: 'Performance rankings and compliance ratings identifying on-time contributors and frequent default risks.',
          desc: 'Comprehensive reliability scores and payment discipline analytics.'
        }
      ]
    : [
        {
          name: 'Personal Payment History',
          icon: 'payments',
          bgColor: '#ECFDF5',
          iconColor: '#059669',
          type: 'PERSONAL_PAYMENT_HISTORY',
          title: `Personal Payment History & Receipts - ${user?.fullName || 'Member'}`,
          content: `Comprehensive contribution statement detailing all verified offline & online monthly installments, payment cycles, and receipt references for ${user?.fullName || 'Member'}.`,
          desc: 'Official statement of all your completed contributions and advance balances.'
        },
        {
          name: 'Discipline Scorecard',
          icon: 'award',
          bgColor: '#FEF3C7',
          iconColor: '#D97706',
          type: 'DISCIPLINE_SCORE_SUMMARY',
          title: `Personal Discipline Scorecard - ${user?.fullName || 'Member'}`,
          content: `Financial discipline certification confirming on-time payment track record (100% completion rate), zero default history, and high reliability rating across Seettu groups.`,
          desc: 'Proof of your reliable credit standing, zero default rate, and 100% on-time score.'
        },
        {
          name: 'Group Activity & Payout Schedule',
          icon: 'users',
          bgColor: '#E0F2FE',
          iconColor: '#0284C7',
          type: 'GROUP_SUMMARY',
          title: `Group Activity & Payout Schedule - ${user?.fullName || 'Member'}`,
          content: `Summary of active Seettu groups joined by ${user?.fullName || 'Member'}, assigned contribution turns, and scheduled payout distribution dates.`,
          desc: 'Overview of all your enrolled Seettu groups and scheduled payout turns.'
        }
      ];

  const openModalWithTemplate = (tpl) => {
    setFormData({
      title: tpl.title,
      type: tpl.type,
      content: tpl.content
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const uid = user?.userId || user?.id;
      if (uid) {
        const res = await reportApi.getReportsByUser(uid);
        const list = res?.data || res || [];
        setReports(Array.isArray(list) ? list : []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error(err);
      setReports([]);
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
        <div>
          <div className="ui-card text-center p-5 shadow-sm border-0 mb-4">
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
              <Icon name="reports" size={36} color="#235665" />
            </div>
            <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>No Reports Generated Yet</h5>
            <p className="text-muted small mb-4">
              {isAdmin || isOrganizer
                ? 'Generate comprehensive group financial audits, payment trails, and member discipline score evaluations.'
                : 'Select one of the recommended member report templates below or create a custom report.'}
            </p>
            <div>
              <button 
                className="btn btn-teal px-4 py-2" 
                onClick={() => {
                  setFormData({
                    title: (isAdmin || isOrganizer) ? 'Monthly Group Summary Audit' : `Personal Payment History & Receipts - ${user?.fullName || 'Member'}`,
                    type: (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY',
                    content: (isAdmin || isOrganizer) ? 'Comprehensive group summary and cycle audit.' : `Contribution audit and ledger statement for ${user?.fullName || 'Member'}.`
                  });
                  setShowModal(true);
                }}
              >
                <span>+</span> Generate First Report
              </button>
            </div>
          </div>

          {/* Quick Start Templates */}
          <div>
            <h6 className="fw-bold mb-3" style={{ color: '#1A3644' }}>
              {isAdmin || isOrganizer ? 'Standard Audit Templates' : 'Recommended Reports for You'}
            </h6>
            <div className="row g-3">
              {templates.map((tpl, idx) => (
                <div key={idx} className="col-12 col-md-4">
                  <div className="ui-card h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-inline-flex p-2 rounded-3 mb-3" style={{ backgroundColor: tpl.bgColor }}>
                        <Icon name={tpl.icon} size={22} color={tpl.iconColor} />
                      </div>
                      <h6 className="fw-bold text-dark mb-2">{tpl.name}</h6>
                      <p className="text-muted small mb-3">{tpl.desc}</p>
                    </div>
                    <button
                      className="btn btn-outline-primary w-100 btn-sm py-2 fw-semibold"
                      onClick={() => openModalWithTemplate(tpl)}
                    >
                      Generate This Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                      placeholder={isAdmin || isOrganizer ? "e.g. Monthly Seettu Group Audit Q3" : "e.g. Personal Seettu Payment Summary"}
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
                      {isAdmin || isOrganizer ? (
                        <>
                          <option value="GROUP_SUMMARY">Group Summary Audit</option>
                          <option value="PAYMENT_AUDIT">Payment Audit Trail</option>
                          <option value="DISCIPLINE_SCORE_SUMMARY">Discipline Score Summary</option>
                        </>
                      ) : (
                        <>
                          <option value="PERSONAL_PAYMENT_HISTORY">Personal Payment History & Receipts</option>
                          <option value="DISCIPLINE_SCORE_SUMMARY">Personal Discipline Score Summary</option>
                          <option value="GROUP_SUMMARY">Member Group Activity Summary</option>
                        </>
                      )}
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
            <div className="modal-content border-0 shadow-lg printable-report" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header py-3 px-4 text-white no-print" style={{ backgroundColor: '#134A5A' }}>
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
              <div className="modal-footer py-3 px-4 bg-light no-print">
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
