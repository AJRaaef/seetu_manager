import React from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';

const DeletePaymentModal = ({ show, onHide, payment, onDelete }) => {
  if (!payment) return null;

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <Icon name="trash" size={16} color="#EF4444" />
          </div>
          <h5 className="fw-bold mb-0 text-dark">Delete Payment Record</h5>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          Are you sure you want to delete this payment record? This action cannot be undone.
        </p>

        <div className="bg-light p-3 rounded-3 border mb-1">
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Member:</span>
            <span className="fw-semibold text-dark">{payment.member || payment.memberName || 'Member'}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Group:</span>
            <span className="fw-semibold text-dark">{payment.group || "Village Women's (Cycle 3)"}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Amount:</span>
            <span className="fw-semibold text-dark">{payment.amount ? `${payment.amount.toLocaleString()} LKR` : '1,000 LKR'}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">Date:</span>
            <span className="fw-semibold text-dark">{payment.date || '2026-09-15'}</span>
          </div>
        </div>
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger px-4"
          onClick={() => {
            if (onDelete) onDelete(payment);
            onHide();
          }}
        >
          Delete Record
        </button>
      </div>
    </Modal>
  );
};

export default DeletePaymentModal;
