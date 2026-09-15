import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllGroups } from '../api/groupApi';
import { getPaymentsByGroup } from '../api/paymentApi';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import RecordPaymentModal from '../components/RecordPaymentModal';

const PaymentTracking = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getAllGroups();
        const loadedGroups = res.data || [];
        setGroups(loadedGroups);
        if (loadedGroups.length > 0) {
          setSelectedGroup(loadedGroups[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch groups', error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadPayments();
    } else {
      setPayments([]);
    }
  }, [selectedGroup]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await getPaymentsByGroup(selectedGroup);
      setPayments(res.data || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = (payment) => {
    setPaymentInfo(payment);
    setShowModal(true);
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">{t('payments') || 'Payment Tracking & Collection'}</h2>
          <p className="text-muted mb-0">Monitor contribution payments across active Seettu cycles</p>
        </div>
      </div>
      
      {/* Filters Card */}
      <div className="card shadow-sm border-0 mb-4 bg-white p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <label className="form-label text-dark fw-bold">Select Group</label>
            <select 
              className="form-select" 
              value={selectedGroup} 
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">-- Select a Group --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.category || 'General'})</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label text-dark fw-bold">Filter by Status</label>
            <div className="btn-group w-100" role="group">
              {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(status => (
                <button
                  key={status}
                  type="button"
                  className={`btn btn-sm ${filterStatus === status ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading payments list...</p>
        </div>
      )}

      {!loading && selectedGroup && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">
              💳 Payment Records ({filteredPayments.length})
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={loadPayments}>
              🔄 Refresh List
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Cycle #</th>
                    <th>Member Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id || `${p.cycleId}-${p.memberId}`}>
                      <td className="fw-bold">Cycle #{p.cycleNumber}</td>
                      <td className="fw-semibold text-dark">{p.memberName}</td>
                      <td><strong className="text-primary">LKR {(p.amount || 0).toLocaleString()}</strong></td>
                      <td><PaymentStatusBadge status={p.status} /></td>
                      <td className="text-muted">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                      <td>
                        {p.status !== 'PAID' ? (
                          <button 
                            className="btn btn-sm btn-primary fw-bold shadow-sm"
                            onClick={() => handleRecordPayment(p)}
                          >
                            ➕ Record Payment
                          </button>
                        ) : (
                          <span className="badge bg-success-subtle text-success">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">No payments found for this criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <RecordPaymentModal 
          show={showModal} 
          onHide={() => setShowModal(false)}
          paymentInfo={paymentInfo}
          onSuccess={loadPayments}
        />
      )}
    </div>
  );
};

export default PaymentTracking;
