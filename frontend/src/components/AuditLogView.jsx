import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Converts a raw backend log into one consistent shape
const normalizeLog = (log, index) => ({
  id: log.id ?? index + 1,
  user: log.user ?? log.username ?? log.performedBy ?? '',
  action: log.action ?? '',
  timestamp: log.timestamp ?? log.createdAt ?? null,
  details: log.details ?? log.logMessage ?? '',
  targetEntity: log.targetEntity ?? '',
  role: log.role ?? '',
});

// Wraps a CSV value in quotes and escapes inner quotes
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const AuditLogView = () => {
  const { t, i18n } = useTranslation();

  // Logs fetched from the backend
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Search text and quick filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Loads audit logs from the API
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res?.data?.data) ? res.data.data : []);
      setLogs(data);
    } catch (err) {
      setLogs([]);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Formats a timestamp using the current language locale
  const formatTimestamp = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    try {
      return date.toLocaleString(i18n.language);
    } catch {
      return date.toLocaleString();
    }
  };

  // Translated action label. Falls back to the raw action text if no key exists.
  const actionLabel = (action) => {
    if (!action) return '-';
    return t(`audit_trail_page.actions.${action}`, action.replace(/_/g, ' '));
  };

  const rows = logs.map(normalizeLog);

  // Applies the search box and the quick filter
  const filteredRows = rows.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.user.toLowerCase().includes(term) ||
      r.action.toLowerCase().includes(term) ||
      r.details.toLowerCase().includes(term);

    if (activeFilter === 'PAYMENT') return matchesSearch && r.action.includes('PAYMENT');
    return matchesSearch;
  });

  // Exports the filtered rows as a CSV file (BOM added so Sinhala/Tamil text opens correctly in Excel)
  const exportToCSV = () => {
    if (filteredRows.length === 0) return;

    const header = [
      t('audit_trail_page.columns.id'),
      t('audit_trail_page.columns.timestamp'),
      t('audit_trail_page.columns.action'),
      t('audit_trail_page.columns.user'),
      t('audit_trail_page.columns.target_entity'),
      t('audit_trail_page.columns.details'),
    ].map(csvCell).join(',');

    const body = filteredRows.map((r) =>
      [r.id, formatTimestamp(r.timestamp), actionLabel(r.action), r.user, r.targetEntity, r.details]
        .map(csvCell)
        .join(',')
    );

    const csv = '\uFEFF' + [header, ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger text-uppercase px-2 py-1" style={{ fontSize: '0.7rem' }}>
              {t('audit_trail_page.admin_portal')}
            </span>
            <span className="badge bg-secondary text-uppercase px-2 py-1" style={{ fontSize: '0.7rem' }}>
              {t('audit_trail_page.ledger_badge')}
            </span>
          </div>
          <h3 className="fw-bold mb-0 text-dark">
            {t('audit_trail_page.title')}
          </h3>
          <small className="text-muted">
            {t('audit_trail_page.subtitle')}
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold"
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            {t('audit_trail_page.refresh')}
          </button>
          <button
            type="button"
            className="btn btn-info text-white btn-sm fw-semibold"
            onClick={exportToCSV}
            disabled={loading || filteredRows.length === 0}
          >
            {t('audit_trail_page.export_csv')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 border-start border-4 border-primary">
            <small className="text-muted fw-bold">{t('audit_trail_page.stats.total_system_logs')}</small>
            <h3 className="fw-bold my-1 text-dark">{logs.length}</h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 border-start border-4 border-success">
            <small className="text-muted fw-bold">{t('audit_trail_page.stats.payment_ledger_audits')}</small>
            <h3 className="fw-bold my-1 text-dark">
              {logs.filter((l) => (l.action || '').includes('PAYMENT')).length}
            </h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 border-start border-4 border-info">
            <small className="text-muted fw-bold">{t('audit_trail_page.stats.auth_account_events')}</small>
            <h3 className="fw-bold my-1 text-dark">
              {logs.filter((l) => (l.action || '').includes('LOGIN') || (l.action || '').includes('REGISTER')).length}
            </h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 border-start border-4 border-danger">
            <small className="text-muted fw-bold">{t('audit_trail_page.stats.disputes_emergencies')}</small>
            <h3 className="fw-bold my-1 text-dark">
              {logs.filter((l) => (l.action || '').includes('DISPUTE')).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder={t('audit_trail_page.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setActiveFilter('ALL')}
            >
              {t('audit_trail_page.all_system_logs')}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'PAYMENT' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setActiveFilter('PAYMENT')}
            >
              {t('audit_trail_page.payment_audits')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            {t('audit_trail_page.records_title')}{' '}
            <span className="badge bg-light text-dark ms-2">
              {filteredRows.length} {t('audit_trail_page.entries')}
            </span>
          </h5>
        </div>

        <div className="p-0">
          {loading && <p className="text-muted text-center my-4">{t('audit_trail_page.loading')}</p>}

          {!loading && hasError && (
            <p className="text-danger text-center my-4">
              {t('audit_trail_page.load_error')}
            </p>
          )}

          {!loading && !hasError && filteredRows.length === 0 && (
            <p className="text-muted text-center my-4">{t('audit_trail_page.no_logs')}</p>
          )}

          {!loading && !hasError && filteredRows.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.id')}</th>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.timestamp')}</th>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.action')}</th>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.user')}</th>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.target_entity')}</th>
                    <th className="py-3 px-3 text-muted small">{t('audit_trail_page.columns.details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((log, index) => (
                    <tr key={`${log.id}-${index}`}>
                      <td className="py-3 px-3 fw-bold text-muted">#{log.id}</td>
                      <td className="py-3 px-3 small text-muted">{formatTimestamp(log.timestamp)}</td>
                      <td className="py-3 px-3">
                        <span className="badge rounded-pill bg-light text-dark border px-2 py-1">
                          {actionLabel(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-3 fw-semibold text-dark">
                        {log.user || t('audit_trail_page.system_user')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge bg-light text-secondary border font-monospace">
                          {log.targetEntity || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-secondary small">{log.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;