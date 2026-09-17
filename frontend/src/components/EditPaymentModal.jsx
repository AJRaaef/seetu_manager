import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';

const EditPaymentModal = ({ show, onHide, payment, onSave }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('PAID');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount || 1000);
      setDate(payment.date ? payment.date.replace(/\//g, '-') : '2026-09-15');
      setStatus(payment.status || 'PAID');
      setNotes(payment.notes || 'Settled pending payment for Suresh');
    }
  }, [payment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...payment,
        amount: parseFloat(amount),
        date,
        status,
        notes
      });
    }
    onHide();
  };

  if (!payment) return null;

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">Edit Payment Record</h5>
          <span className="badge bg-light text-muted border small">
            {payment.id ? `#PAY-${payment.id}` : '#PAY-1789493164511'}
          </span>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="custom-modal-body">
          <div className="row g-3 mb-3">
            <div className="col-6">
              <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>MEMBER</div>
              <div className="fw-bold text-dark">{payment.member || payment.memberName || 'Member'}</div>
            </div>
            <div className="col-6">
              <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>GROUP</div>
              <div className="fw-bold text-dark">{payment.group || "Village Women's"} ({payment.cycle || 'Cycle 3'})</div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Amount</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label text-dark fw-semibold small">Notes / Remarks</label>
            <textarea
              className="form-control"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="custom-modal-footer">
          <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
            Cancel
          </button>
          <button type="submit" className="btn btn-teal px-4">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPaymentModal;
