import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';
import { getPaymentAuditLogs, getAllAuditLogs } from '../api/auditApi';

const PaymentAuditTrail = () => {
  const { user, isAdmin, isOrganizer } = useAuth();
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [logScope, setLogScope] = useState('PAYMENTS'); // 'PAYMENTS' or 'ALL'

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let res;
      if (logScope === 'PAYMENTS') {
        res = await getPaymentAuditLogs();
      } else {
        res = await getAllAuditLogs();
      }
      const list = res?.data || res || [];
      setAuditLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs from database', err);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [logScope]);

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.id && String(log.id).includes(searchQuery));

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  // Calculate statistics
  const totalLogs = auditLogs.length;
  const recordedCount = auditLogs.filter(l => l.action === 'PAYMENT_RECORDED').length;
  const updatedCount = auditLogs.filter(l => l.action === 'PAYMENT_UPDATED').length;
  const deletedCount = auditLogs.filter(l => l.action === 'PAYMENT_DELETED').length;

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No audit logs available to export.');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'Performed By', 'Role', 'Action', 'Target Table', 'Target ID', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString() : '-',
      `"${l.userName || 'System'}"`,
      l.userRole || 'SYSTEM',
      l.action || '-',
      l.targetTable || '-',
      l.targetId || '-',
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payment_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'PAYMENT_RECORDED':
        return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill"><Icon name="check" size={13} className="me-1" />RECORDED</span>;
      case 'PAYMENT_UPDATED':
        return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1 rounded-pill" style={{ color: '#0097B2' }}><Icon name="edit" size={13} className="me-1" />UPDATED</span>;
      case 'PAYMENT_DELETED':
        return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill"><Icon name="trash" size={13} className="me-1" />DELETED</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1 rounded-pill">{action}</span>;
    }
  };

  const getRoleBadge = (role) => {
    const norm = (role || '').replace('ROLE_', '').toUpperCase();
    if (norm === 'ADMIN') {
      return (
        <span className="badge ms-1" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', fontSize: '0.7rem', fontWeight: 700 }}>
          ADMIN
        </span>
      );
    }
    if (norm === 'ORGANIZER') {
      return (
        <span className="badge ms-1" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC', fontSize: '0.7rem', fontWeight: 700 }}>
          ORGANIZER
        </span>
      );
    }
    return (
      <span className="badge ms-1" style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontSize: '0.7rem', fontWeight: 600 }}>
        {norm || 'SYSTEM'}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger px-3 py-1.5 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
              <Icon name="shield" size={14} className="me-1" /> Admin Security Portal
            </span>
            <span className="badge bg-dark bg-opacity-10 text-dark px-3 py-1.5 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              MySQL Database Audit Ledger
            </span>
          </div>
          <h2 className="fw-extrabold text-dark mb-0" style={{ color: '#0F2F3D' }}>
            Payment Audit Trail & System Logs
          </h2>
          <p className="text-muted small mb-0">
            Real-time immutable audit trail recording every payment entry, status change, and administrative edit.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            onClick={fetchAuditLogs} 
            className="btn btn-outline-secondary d-flex align-items-center gap-1.5 fw-semibold px-3 py-2 rounded-3"
            title="Refresh Logs"
          >
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={handleExportCSV} 
            className="btn btn-info text-white fw-bold d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 shadow-sm"
            style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
          >
            <Icon name="download" size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Payment Audits</span>
                <h3 className="fw-extrabold mb-0 mt-1" style={{ color: '#0F2F3D' }}>{totalLogs}</h3>
              </div>
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                <Icon name="file-text" size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Payments Recorded</span>
                <h3 className="fw-extrabold text-success mb-0 mt-1">{recordedCount}</h3>
              </div>
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                <Icon name="check" size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-info">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Payment Updates</span>
                <h3 className="fw-extrabold text-info mb-0 mt-1" style={{ color: '#0097B2' }}>{updatedCount}</h3>
              </div>
              <div className="p-3 rounded-circle bg-info bg-opacity-10 text-info" style={{ color: '#0097B2' }}>
                <Icon name="edit" size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Deletions / Overdues</span>
                <h3 className="fw-extrabold text-danger mb-0 mt-1">{deletedCount}</h3>
              </div>
              <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger">
                <Icon name="trash" size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector & Filters Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Icon name="search" size={16} />
                </span>
                <input 
                  type="text"
                  className="form-control border-start-0 ps-0 shadow-none"
                  placeholder="Search by admin user, member name, or log details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Scope Filter (Payment vs All System Logs) */}
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-3 border">
                <button
                  onClick={() => setLogScope('PAYMENTS')}
                  className={`btn btn-sm flex-fill fw-bold rounded-2 ${logScope === 'PAYMENTS' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`}
                  style={logScope === 'PAYMENTS' ? { color: '#0F2F3D' } : {}}
                >
                  Payment Audits
                </button>
                <button
                  onClick={() => setLogScope('ALL')}
                  className={`btn btn-sm flex-fill fw-bold rounded-2 ${logScope === 'ALL' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`}
                >
                  All System Logs
                </button>
              </div>
            </div>

            {/* Action Filter */}
            <div className="col-6 col-md-4">
              <select
                className="form-select shadow-none"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
                <option value="PAYMENT_UPDATED">PAYMENT_UPDATED</option>
                <option value="PAYMENT_DELETED">PAYMENT_DELETED</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Data Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Icon name="shield" size={18} className="text-info" style={{ color: '#0097B2' }} />
            <h5 className="fw-bold mb-0 text-dark" style={{ color: '#0F2F3D' }}>Audit Log Records</h5>
            <span className="badge bg-secondary bg-opacity-10 text-secondary ms-2">{filteredLogs.length} Entries</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary small text-uppercase fw-semibold" style={{ backgroundColor: '#F8FAFC' }}>
              <tr>
                <th style={{ width: '80px' }}>Log ID</th>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th style={{ width: '150px' }}>Action</th>
                <th style={{ width: '220px' }}>Performed By</th>
                <th style={{ width: '120px' }}>Target Entity</th>
                <th>Audit Details & Log Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-info" role="status" style={{ color: '#0097B2' }}>
                      <span className="visually-hidden">Loading audit trail logs...</span>
                    </div>
                    <p className="mt-2 text-muted small">Fetching real-time MySQL audit logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <Icon name="info" size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-semibold">No payment audit logs found matching your filters.</p>
                    <small className="text-muted">Recorded payment actions by Admins and Organizers will appear here automatically.</small>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="fw-bold text-secondary font-monospace" style={{ fontSize: '0.85rem' }}>#{log.id}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 small text-dark fw-medium">
                        <Icon name="clock" size={14} className="text-muted me-1" />
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }) : '-'}
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '0.75rem', backgroundColor: '#0F2F3D' }}>
                          {log.userName ? log.userName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block small" style={{ color: '#0F2F3D' }}>
                            {log.userName || 'System'}
                          </span>
                          {getRoleBadge(log.userRole)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {log.targetTable} #{log.targetId}
                      </span>
                    </td>
                    <td>
                      <p className="mb-0 text-dark small font-monospace bg-light p-2 rounded-2 border border-secondary border-opacity-10" style={{ fontSize: '0.82rem' }}>
                        {log.details || 'No details specified.'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentAuditTrail;
