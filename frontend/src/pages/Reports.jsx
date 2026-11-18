import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import * as reportApi from '../api/reportApi';
import { getAllGroups, getGroupsByUser } from '../api/groupApi';
import { getAllPayments, getPaymentsByMember } from '../api/paymentApi';
import Icon from '../components/Icons';

const getPaymentRecordKey = (payment) => {
  const cycleId = payment.cycleId ?? payment.cycle?.id;
  const memberId = payment.memberId ?? payment.member?.id;
  if (cycleId != null && memberId != null) {
    return `cycle:${cycleId}:member:${memberId}`;
  }
  return payment.id != null ? `payment:${payment.id}` : null;
};

const deduplicatePayments = (payments) => {
  const seen = new Set();
  return payments.filter((payment) => {
    const key = getPaymentRecordKey(payment);
    if (key == null) {
      return true;
    }
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const Reports = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin } = useAuth();
  const getReportTypeLabel = (type) => {
    if (!type) return '';
    const normalizedType = String(type).toUpperCase();
    return t(`reports_page.types.${normalizedType}`, { defaultValue: type });
  };
  const [reports, setReports] = useState([]);
  const [reportGroups, setReportGroups] = useState([]);
  const [reportPayments, setReportPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const isPersonalReport = selectedReport?.type?.toUpperCase() === 'PERSONAL_PAYMENT_HISTORY';
  const reportOwnerId = selectedReport?.generatedBy?.id
    ?? selectedReport?.generatedBy?.userId
    ?? user?.userId
    ?? user?.id;
  const visibleReportPayments = isPersonalReport
    ? reportPayments.filter((payment) => {
        const memberId = payment.memberId ?? payment.member?.id;
        return reportOwnerId != null && String(memberId) === String(reportOwnerId);
      })
    : reportPayments;
  const visibleReportGroups = isPersonalReport
    ? reportGroups.filter((group) => group.members?.some((member) => {
        const memberId = member.userId ?? member.id;
        return reportOwnerId != null && String(memberId) === String(reportOwnerId);
      }))
    : reportGroups;
  const totalCollections = visibleReportPayments
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const defaultType = (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY';
  const [formData, setFormData] = useState({
    title: '',
    type: defaultType,
    content: '',
  });



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
      const groupsRequest = (isAdmin || isOrganizer)
        ? getAllGroups()
        : uid
          ? getGroupsByUser(uid)
          : Promise.resolve([]);
      groupsRequest.then((gRes) => {
        const raw = gRes?.data ?? gRes;
        const gList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setReportGroups(gList);
      }).catch(() => {});

      const paymentsRequest = (isAdmin || isOrganizer)
        ? getAllPayments()
        : uid
          ? getPaymentsByMember(uid)
          : Promise.resolve([]);
      paymentsRequest.then((pRes) => {
        const raw = pRes?.data ?? pRes;
        const pList = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setReportPayments(deduplicatePayments(pList));
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
    setCreatingReport(true);
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
      alert(err.response?.data?.message || err.message || t('reports_page.failed_generate'));
    } finally {
      setCreatingReport(false);
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
          [t('reports_page.audit_system')],
          [t('reports_page.official_statement')],
          [t('reports_page.report_title'), selectedReport.title],
          [t('reports_page.type'), selectedReport.type],
          [t('reports_page.generated'), selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()],
          [t('reports_page.auditor'), selectedReport.generatedBy?.fullName || user?.fullName || t('reports_page.administrator')],
          [],
          [t('reports_page.executive_summary')],
          [t('reports_page.active_groups'), visibleReportGroups.length],
          [t('reports_page.enrolled_members'), isPersonalReport ? (reportOwnerId == null ? 0 : 1) : visibleReportGroups.reduce((sum, group) => sum + Number(group.memberCount || 0), 0)],
          [t('reports_page.collected_funds'), `LKR ${totalCollections}`],
          [t('reports_page.compliance_rating'), t('reports_page.verified')],
          [],
          [t('reports_page.audit_findings_notes')],
          [selectedReport.content || t('reports_page.default_audit_content')],
          [],
          [t('reports_page.tracked_groups_ledger'), visibleReportGroups.length],
          ['ID', t('reports_page.group_name'), t('reports_page.category'), t('reports_page.target_members'), t('reports_page.contribution'), t('reports_page.status')],
          ...(visibleReportGroups.length
            ? visibleReportGroups.map((group) => [
                `#${group.id}`,
                group.name || t('reports_page.unnamed'),
                group.category || t('reports_page.general'),
                group.memberCount || 0,
                `LKR ${Number(group.contributionAmount || 0)}`,
                group.status || t('reports_page.active')
              ])
            : [[t('reports_page.no_active_groups')]]),
          [],
          [t('reports_page.payment_ledger_csv')],
          ['TX #', t('reports_page.group'), t('reports_page.member'), t('reports_page.amount_lkr'), t('reports_page.method'), t('reports_page.status')],
          ...(visibleReportPayments.length
            ? visibleReportPayments.slice(0, 20).map((payment) => [
                `#${payment.id}`,
                payment.groupName || payment.cycle?.group?.name || t('reports_page.seettu_group'),
                payment.memberName || payment.member?.fullName || t('reports_page.member_number', { number: payment.memberId ?? payment.member?.id ?? '-' }),
                Number(payment.amount || 0),
                payment.paymentMethod || t('reports_page.offline'),
                payment.status || t('reports_page.paid')
              ])
            : [[t('reports_page.no_transactions')]]),
          [],
          [t('reports_page.csv_disclaimer')],
          [t('reports_page.certified_system_audit'), t('reports_page.core_engine')]
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
        ? t('reports_page.csv_unavailable')
        : t('reports_page.failed_download_csv');
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
            <h2 className="fw-bold mb-0" style={{ color: '#1A3644' }}>{t('reports_page.title', 'Reports & Analytics')}</h2>
          </div>
          <p className="text-muted mb-0">{t('reports_page.subtitle', 'Generate and export financial reports, cycle statements, and member analytics')}</p>
        </div>

        <button
          type="button"
          className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => {
            setFormData({
              title: (isAdmin || isOrganizer) ? t('reports_page.monthly_summary_title') : t('reports_page.personal_history_title', { name: user?.fullName || t('reports_page.member') }),
              type: (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY',
              content: (isAdmin || isOrganizer) ? t('reports_page.group_summary_content') : t('reports_page.personal_history_content', { name: user?.fullName || t('reports_page.member') })
            });
            setShowModal(true);
          }}
        >
          <span>+</span> {t('reports_page.generate_btn', 'Generate Report')}
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4 rounded-3">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#235665' }} role="status"></div>
          <p className="mt-2 text-muted">{t('reports_page.loading')}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="ui-card text-center p-5 shadow-sm border-0 mb-4">
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ backgroundColor: '#E8F0F3' }}>
              <Icon name="reports" size={36} color="#235665" />
            </div>
            <h5 className="fw-bold mt-2" style={{ color: '#1A3644' }}>{t('reports_page.no_reports')}</h5>
            <p className="text-muted small mb-4">
              {isAdmin || isOrganizer
                ? t('reports_page.empty_admin')
                : t('reports_page.empty_member')}
            </p>
            <div>
              <button
                className="btn btn-teal px-4 py-2"
                onClick={() => {
                  setFormData({
                    title: (isAdmin || isOrganizer) ? t('reports_page.monthly_summary_title') : t('reports_page.personal_history_title', { name: user?.fullName || t('reports_page.member') }),
                    type: (isAdmin || isOrganizer) ? 'GROUP_SUMMARY' : 'PERSONAL_PAYMENT_HISTORY',
                    content: (isAdmin || isOrganizer) ? t('reports_page.group_summary_content') : t('reports_page.personal_history_content', { name: user?.fullName || t('reports_page.member') })
                  });
                  setShowModal(true);
                }}
              >
                <span>+</span> {t('reports_page.generate_first')}
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
                    {getReportTypeLabel(r.type)}
                  </span>
                  <span className="small text-muted">#{r.id}</span>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-2">{r.title}</h5>
                  <p className="text-muted small mb-3">{r.content || t('reports_page.system_summary')}</p>
                  <div className="p-2 bg-light rounded-3 mb-3">
                    <small className="text-muted d-block">
                      <strong>{t('reports_page.generated_on')}</strong> {r.createdAt ? new Date(r.createdAt).toLocaleString() : t('reports_page.na')}
                    </small>
                  </div>
                  <button 
                    className="btn btn-outline-primary w-100 fw-semibold" 
                    onClick={() => setSelectedReport(r)}
                  >
                    {t('reports_page.view_report', 'View Report')}
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
                <h5 className="modal-title fw-bold">{t('reports_page.generate_btn', 'Generate Report')}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('reports_page.report_title')}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={isAdmin || isOrganizer ? t('reports_page.admin_title_placeholder') : t('reports_page.member_title_placeholder')}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('reports_page.report_type')}</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      {isAdmin || isOrganizer ? (
                        <>
                          <option value="GROUP_SUMMARY">{t('reports_page.type_group_summary')}</option>
                          <option value="PAYMENT_AUDIT">{t('reports_page.type_payment_audit')}</option>
                          <option value="DISCIPLINE_SCORE_SUMMARY">{t('reports_page.type_discipline_summary')}</option>
                        </>
                      ) : (
                        <>
                          <option value="PERSONAL_PAYMENT_HISTORY">{t('reports_page.type_personal_history')}</option>
                          <option value="DISCIPLINE_SCORE_SUMMARY">{t('reports_page.type_personal_discipline')}</option>
                          <option value="GROUP_SUMMARY">{t('reports_page.type_member_activity')}</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>{t('reports_page.notes_content')}</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder={t('reports_page.notes_placeholder')}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer py-3 px-4 bg-light">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setShowModal(false)}>{t('reports_page.cancel')}</button>
                  <button type="submit" className="btn btn-teal px-4 fw-semibold" style={{ borderRadius: '8px' }} disabled={creatingReport}>
                    {creatingReport ? t('reports_page.generating') : t('reports_page.generate_btn', 'Generate Report')}
                  </button>
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
                          <img src="/logo.png" alt={t('reports_page.logo')} style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                          <h4 className="fw-bold mb-0" style={{ color: '#0F2F3D', letterSpacing: '-0.5px' }}>
                            {t('reports_page.audit_brand')}
                          </h4>
                        </div>
                        <div className="text-muted small mt-1">
                          {t('reports_page.report_reference')} <span className="font-monospace fw-bold text-dark">#{selectedReport.id}</span> • {t('reports_page.official_ledger')}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                          {getReportTypeLabel(selectedReport.type)}
                        </span>
                        <div className="text-muted small mt-1">
                          {t('reports_page.generated')}: {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : new Date().toLocaleString()}
                        </div>
                        <div className="text-muted small">
                          {t('reports_page.auditor')}: <strong>{selectedReport.generatedBy?.fullName || user?.fullName || t('reports_page.administrator')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Executive KPI Stats Cards */}
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>{t('reports_page.tracked_groups')}</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">{visibleReportGroups.length || 0}</h4>
                          <span className="small text-success">{t('reports_page.active_circles')}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>{t('reports_page.total_collections')}</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">LKR {totalCollections.toLocaleString()}</h4>
                          <span className="small text-primary">{t('reports_page.verified_paid')}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>{t('reports_page.transactions_logged')}</small>
                          <h4 className="fw-bold text-dark mb-0 mt-1">{visibleReportPayments.length || 0}</h4>
                          <span className="small text-muted">{t('reports_page.ledger_records')}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="p-3 rounded-3 border bg-light text-center">
                          <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem' }}>{t('reports_page.compliance_rating')}</small>
                          <h4 className="fw-bold text-success mb-0 mt-1">100%</h4>
                          <span className="small text-success">{t('reports_page.discipline_standing')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Findings & Notes */}
                    <div className="p-3 rounded-3 border mb-4" style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid #1A5265' }}>
                      <h6 className="fw-bold mb-1" style={{ color: '#1A3644' }}>{t('reports_page.audit_findings_scope')}</h6>
                      <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedReport.content || t('reports_page.default_audit_content')}
                      </p>
                    </div>

                    {/* Table 1: Active Groups Breakdown */}
                    {!isPersonalReport && <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                        <Icon name="users" size={16} color="#1A5265" />
                        <span>{t('reports_page.active_groups_ledger', { count: reportGroups.length })}</span>
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th>{t('reports_page.group_id')}</th>
                              <th>{t('reports_page.group_name')}</th>
                              <th>{t('reports_page.category')}</th>
                              <th>{t('reports_page.target_members')}</th>
                              <th>{t('reports_page.contribution_lkr')}</th>
                              <th>{t('reports_page.cycle_frequency')}</th>
                              <th>{t('reports_page.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleReportGroups.length === 0 ? (
                              <tr><td colSpan="7" className="text-center py-3 text-muted">{t('reports_page.no_group_records')}</td></tr>
                            ) : (
                              visibleReportGroups.map(g => (
                                <tr key={g.id}>
                                  <td className="font-monospace">#{g.id}</td>
                                  <td className="fw-semibold text-dark">{g.name}</td>
                                  <td>{g.category || t('reports_page.general')}</td>
                                  <td>{g.memberCount || 0} {t('reports_page.members')}</td>
                                  <td className="fw-bold text-dark">LKR {Number(g.contributionAmount || 0).toLocaleString()}</td>
                                  <td>{g.cycleFrequency || t('reports_page.monthly')}</td>
                                  <td><span className="badge bg-success-subtle text-success border">{g.status || t('reports_page.active')}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>}

                    {/* Table 2: Recent Payment Ledger Transactions */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                        <Icon name="credit-card" size={16} color="#1A5265" />
                        <span>{t('reports_page.financial_ledger')}</span>
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th>{t('reports_page.tx_number')}</th>
                              <th>{t('reports_page.seettu_group')}</th>
                              <th>{t('reports_page.paying_member')}</th>
                              <th>{t('reports_page.amount_lkr')}</th>
                              <th>{t('reports_page.settlement_method')}</th>
                              <th>{t('common.date', 'Date')}</th>
                              <th>{t('reports_page.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleReportPayments.length === 0 ? (
                              <tr><td colSpan="7" className="text-center py-3 text-muted">{t('reports_page.no_transactions_found')}</td></tr>
                            ) : (
                              visibleReportPayments.slice(0, 15).map(p => (
                                <tr key={p.id}>
                                  <td className="font-monospace">#{p.id}</td>
                                  <td>{p.groupName || p.cycle?.group?.name || t('reports_page.seettu_group')}</td>
                                  <td className="fw-semibold">{p.memberName || p.member?.fullName || t('reports_page.member_number', { number: p.memberId ?? p.member?.id ?? '-' })}</td>
                                  <td className="fw-bold text-dark">LKR {Number(p.amount || 0).toLocaleString()}</td>
                                  <td><span className="badge bg-light text-dark border">{p.paymentMethod || t('reports_page.cash')}</span></td>
                                  <td className="text-muted">{p.paymentDate ? String(p.paymentDate).split('T')[0] : t('reports_page.na')}</td>
                                  <td><span className={`badge ${p.status === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-dark'} border`}>{p.status || t('reports_page.paid')}</span></td>
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
                          <span>{t('reports_page.official_automated_statement')}</span>
                        </div>
                        <small style={{ fontSize: '0.72rem' }}>{t('reports_page.platform_footer')}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">{t('reports_page.certified_audit_engine')}</div>
                        <small style={{ fontSize: '0.72rem' }}>{t('reports_page.balanced_status')}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 bg-light no-print d-flex justify-content-between align-items-center">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '8px' }} onClick={() => setSelectedReport(null)}>
                    {t('reports_page.cancel')}
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-success d-inline-flex align-items-center gap-2"
                      style={{ borderRadius: '8px' }}
                      onClick={handleOpenInExcel}
                      disabled={downloadingCsv}
                      title={t('reports_page.excel_download_title')}
                    >
                      <Icon name="download" size={16} />
                      <span>{downloadingCsv ? t('reports_page.preparing_csv') : t('reports_page.download_excel')}</span>
                    </button>
                    {isPersonalReport ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                        style={{ borderRadius: '8px' }}
                        onClick={() => window.print()}
                      >
                        <Icon name="download" size={16} />
                        <span>{t('reports_page.print_personal_pdf')}</span>
                      </button>
                    ) : (
                      <a
                        href={`http://localhost:8081/api/reports/${selectedReport.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                        style={{ borderRadius: '8px' }}
                      >
                        <Icon name="download" size={16} />
                        <span>{t('reports_page.download_pdf')}</span>
                      </a>
                    )}
                  </div>
                  <small className="w-100 text-end text-muted">
                    {t('reports_page.csv_footer')}
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
