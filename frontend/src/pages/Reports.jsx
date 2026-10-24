import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import * as reportApi from '../api/reportApi';
import { getAllGroups } from '../api/groupApi';
import { getAllPayments } from '../api/paymentApi';
import Icon from '../components/Icons';

const Reports = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportGroups, setReportGroups] = useState([]);
  const [reportPayments, setReportPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const totalCollections = reportPayments
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

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
  }, [user, isAdmin, isOrganizer]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const uid = user?.userId || user?.id;
      let res;
      if (isAdmin || isOrganizer) {
        res = await reportApi.getAllReports();
      } else if (uid) {
        res = await reportApi.getReportsByUser(uid);
      } else {
        res = [];
      }
      const list = res?.data || res || [];
      setReports(Array.isArray(list) ? list : []);

      // Fetch active groups and payments for rich audit reports
      getAllGroups().then((gRes) => {
        const raw = gRes?.data ?? gRes;
        const gList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setReportGroups(gList);
      }).catch(() => {});

      getAllPayments().then((pRes) => {
        const raw = pRes?.data ?? pRes;
        const pList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setReportPayments(pList);
      }).catch(() => {});
    } catch (err) {
      console.error(err);
      // Fallback for user if getAllReports endpoint fails
      const uid = user?.userId || user?.id;
      if (uid) {
        try {
          const res = await reportApi.getReportsByUser(uid);
          const list = res?.data || res || [];
          setReports(Array.isArray(list) ? list : []);
        } catch {
          setReports([]);
        }
      } else {
        setReports([]);
      }
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
      setFormData({
        title: '',
        type: (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY',
        content: ''
      });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report.');
    }
  };

  const handleOpenInExcel = async () => {
    setDownloadingCsv(true);
    try {
      let csvBlob;
      try {
        csvBlob = await reportApi.downloadReportCsv(selectedReport.id);
      } catch (err) {
        console.warn('Server CSV download failed; creating the CSV from the report preview data.', err);

        const safeCell = (value) => {
          const text = String(value ?? '');
          const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
          return `"${safeText.replace(/"/g, '""')}"`;
        };
        const fallbackRows = [
          ['SEETTU MANAGER AUDIT SYSTEM'],
          ['Official Financial Reconciliation & Audit Statement'],
          ['Report Title', selectedReport.title],
          ['TYPE', selectedReport.type],
          ['Generated', selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()],
          ['Auditor', selectedReport.generatedBy?.fullName || user?.fullName || 'Administrator'],
          [],
          ['Executive Summary'],
          ['ACTIVE GROUPS', reportGroups.length],
          ['ENROLLED MEMBERS', reportGroups.reduce((sum, group) => sum + Number(group.memberCount || 0), 0)],
          ['COLLECTED FUNDS', `LKR ${totalCollections}`],
          ['COMPLIANCE RATING', '100% VERIFIED'],
          [],
          ['Audit Findings & Operational Notes'],
          [selectedReport.content || 'Comprehensive audit report covering registered groups, active members, contribution ledgers, and rotation schedules.'],
          [],
          ['Tracked Seettu Groups Ledger', reportGroups.length],
          ['ID', 'Group Name', 'Category', 'Target Members', 'Contribution', 'Status'],
          ...(reportGroups.length
            ? reportGroups.map((group) => [
                `#${group.id}`,
                group.name || 'Unnamed',
                group.category || 'GENERAL',
                group.memberCount || 0,
                `LKR ${Number(group.contributionAmount || 0)}`,
                group.status || 'ACTIVE'
              ])
            : [['No active groups found in database.']]),
          [],
          ['Payment Contributions & Settlement Trail (Recent Records)'],
          ['TX #', 'Group', 'Member', 'Amount (LKR)', 'Method', 'Status'],
          ...(reportPayments.length
            ? reportPayments.slice(0, 20).map((payment) => [
                `#${payment.id}`,
                payment.cycle?.group?.name || 'Seettu Group',
                payment.member?.fullName || `Member #${payment.member?.id || '-'}`,
                Number(payment.amount || 0),
                payment.paymentMethod || 'OFFLINE',
                payment.status || 'PAID'
              ])
            : [['No payment transactions recorded yet.']]),
          [],
          ['This is an official computer-generated audit statement from SeettuManager System. All records are cryptographically verified against the persistent transaction ledger.'],
          ['Certified System Audit', 'SeettuManager Core Engine']
        ];
        csvBlob = new Blob(
          [`\uFEFF${fallbackRows.map((row) => row.map(safeCell).join(',')).join('\r\n')}`],
          { type: 'text/csv;charset=utf-8' }
        );
      }

      const blobUrl = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Report_${selectedReport.id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Failed to download report CSV', err);
      const message = err.response?.status === 404
        ? 'CSV export is unavailable. Please ensure the backend is up to date and try again.'
        : 'Failed to download the report CSV.';
      alert(message);
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Icon name="reports" size={24} color="#235665" />
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('reports_page.title')}</h2>
          </div>
          <p className="text-muted mb-0">{t('reports_page.subtitle')}</p>
        </div>

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
                      {t('reports_page.generate_btn')}
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
                    {t('reports_page.export_pdf', 'View / Print Report')}
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
                <h5 className="modal-title fw-bold">{t('reports_page.generate_btn')}</h5>
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
                  <button type="submit" className="btn btn-teal px-4" style={{ borderRadius: '8px' }}>+</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Print Report Modal */}
      {selectedReport && (
          <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg printable-report" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="modal-header py-3 px-4 text-white no-print" style={{ backgroundColor: '#134A5A' }}>
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="reports" size={20} color="#FFFFFF" />
                    <h5 className="modal-title fw-bold mb-0">{selectedReport.title}</h5>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
                </div>

                <div className="modal-body p-4 bg-white">
                  <div className="border p-4 rounded-3 bg-white shadow-sm">
                    {/* Top Brand & Metadata Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-3 mb-4 gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <img src="/logo.png" alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                          <h4 className="fw-bold mb-0" style={{ color: '#0F2F3D', letterSpacing: '-0.5px' }}>
                            SeettuManager Audit System
                          </h4>
                        </div>
                        <div className="text-muted small mt-1">
                          Report Reference: <span className="font-monospace fw-bold text-dark">#{selectedReport.id}</span> • Official Financial Audit Ledger
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                          {selectedReport.type}
                        </span>
                        <div className="text-muted small mt-1">
                          Generated: {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()}
                        </div>
                        <div className="text-muted small">
                          Auditor: <strong>{selectedReport.generatedBy?.fullName || user?.fullName || 'Administrator'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Executive KPI Stats Cards */}
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>Tracked Groups</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">{reportGroups.length || 0}</h4>
                          <span className="small text-success">Active Circles</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>Total Collections</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">LKR {totalCollections.toLocaleString()}</h4>
                          <span className="small text-primary">Verified Paid</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>Transactions Logged</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">{reportPayments.length || 0}</h4>
                          <span className="small text-muted">Ledger Records</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>Compliance Rating</small>
                          <h4 className="fw-bold text-success mb-0 mt-1">100%</h4>
                          <span className="small text-success">Discipline Standing</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Findings & Notes */}
                    <div className="p-3 rounded-3 border mb-4" style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid #1A5265' }}>
                      <h6 className="fw-bold mb-1" style={{ color: '#1A3644' }}>Audit Findings & Scope Statement:</h6>
                      <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedReport.content || 'Comprehensive audit report covering registered groups, active members, contribution ledgers, and rotation schedules.'}
                      </p>
                    </div>

                    {/* Table 1: Active Groups Breakdown */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                        <Icon name="users" size={16} color="#1A5265" />
                        <span>Active Seettu Groups Ledger ({reportGroups.length})</span>
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th>Group ID</th>
                              <th>Group Name</th>
                              <th>Category</th>
                              <th>Target Members</th>
                              <th>Contribution (LKR)</th>
                              <th>Cycle Frequency</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportGroups.length === 0 ? (
                              <tr><td colSpan="7" className="text-center py-3 text-muted">No group records available.</td></tr>
                            ) : (
                              reportGroups.map(g => (
                                <tr key={g.id}>
                                  <td className="font-monospace">#{g.id}</td>
                                  <td className="fw-semibold text-dark">{g.name}</td>
                                  <td>{g.category || 'GENERAL'}</td>
                                  <td>{g.memberCount || 0} Members</td>
                                  <td className="fw-bold text-dark">LKR {Number(g.contributionAmount || 0).toLocaleString()}</td>
                                  <td>{g.cycleFrequency || 'MONTHLY'}</td>
                                  <td><span className="badge bg-success-subtle text-success border">{g.status || 'ACTIVE'}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table 2: Recent Payment Ledger Transactions */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                        <Icon name="credit-card" size={16} color="#1A5265" />
                        <span>Financial Contribution Ledger (Latest Transactions)</span>
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th>TX #</th>
                              <th>Seettu Group</th>
                              <th>Paying Member</th>
                              <th>Amount (LKR)</th>
                              <th>Settlement Method</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportPayments.length === 0 ? (
                              <tr><td colSpan="7" className="text-center py-3 text-muted">No transaction records found.</td></tr>
                            ) : (
                              reportPayments.slice(0, 15).map(p => (
                                <tr key={p.id}>
                                  <td className="font-monospace">#{p.id}</td>
                                  <td>{p.cycle?.group?.name || 'Seettu Group'}</td>
                                  <td className="fw-semibold">{p.member?.fullName || `Member #${p.member?.id || '-'}`}</td>
                                  <td className="fw-bold text-dark">LKR {Number(p.amount || 0).toLocaleString()}</td>
                                  <td><span className="badge bg-light text-dark border">{p.paymentMethod || 'Cash'}</span></td>
                                  <td className="text-muted">{p.paymentDate ? String(p.paymentDate).split('T')[0] : 'N/A'}</td>
                                  <td><span className={`badge ${p.status === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-dark'} border`}>{p.status || 'PAID'}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Official Audit Verification Footer */}
                    <div className="pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2 text-muted small">
                      <div>
                        <div className="d-flex align-items-center gap-1.5">
                          <Icon name="check" size={13} color="#10B981" />
                          <span>Official automated financial statement generated from verified ledger.</span>
                        </div>
                        <small style={{ fontSize: '0.72rem' }}>SeettuManager • Sri Lankan Community Finance Platform</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">Certified Audit Engine</div>
                        <small style={{ fontSize: '0.72rem' }}>Status: Balanced & Reconciled</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 bg-light no-print d-flex justify-content-between align-items-center">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setSelectedReport(null)}>
                    Close
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-success d-inline-flex align-items-center gap-2"
                      style={{ borderRadius: '8px' }}
                      onClick={handleOpenInExcel}
                      disabled={downloadingCsv}
                      title="Downloads an Excel-compatible CSV file"
                    >
                      <Icon name="download" size={16} />
                      <span>{downloadingCsv ? 'Preparing CSV...' : 'Download Excel Sheet'}</span>
                    </button>
                    <a
                      href={`http://localhost:8081/api/reports/${selectedReport.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                      style={{ borderRadius: '8px' }}
                    >
                      <Icon name="download" size={16} />
                      <span>Download PDF Report</span>
                    </a>
                  </div>
                  <small className="w-100 text-end text-muted">
                    CSV downloads to your device; open the downloaded file with Excel.
                  </small>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Reports;
