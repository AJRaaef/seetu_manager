import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';

const PaymentReminderModal = ({ show, onHide, payment, onSend }) => {
  const [channel, setChannel] = useState('WhatsApp');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (payment) {
      const name = payment.member || payment.memberName || 'Rani';
      const amount = payment.amount ? `${payment.amount.toLocaleString()} LKR` : '5,000 LKR';
      const cycle = payment.cycle || 'Cycle 2';
      const group = payment.group || 'Small Business';
      setMessage(
        `Dear ${name}, your Seettu contribution of ${amount} for ${cycle} (${group}) is currently overdue. Please settle your contribution promptly to protect your Financial Discipline Score.`
      );
    }
  }, [payment]);

  if (!payment) return null;

  const handleSend = () => {
    if (onSend) {
      onSend({ payment, channel, message });
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <Icon name="bell" size={16} color="#EF4444" />
          </div>
          <h5 className="fw-bold mb-0 text-dark">Send Payment Reminder</h5>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>MEMBER</div>
            <div className="fw-bold text-dark">{payment.member || payment.memberName || 'Rani'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>AMOUNT</div>
            <div className="fw-bold text-dark">{payment.amount ? `${payment.amount.toLocaleString()} LKR` : '5,000 LKR'}</div>
          </div>
        </div>

        {/* Channel Selection Buttons */}
        <div className="mb-3">
          <label className="form-label text-dark fw-semibold small mb-2">Notification Channel</label>
          <div className="d-flex gap-2">
            {['WhatsApp', 'SMS', 'In-App'].map((c) => (
              <button
                key={c}
                type="button"
                className={`btn flex-fill py-2 text-center rounded-2 ${channel === c ? 'btn-outline-primary border-primary fw-bold' : 'btn-light border text-muted'}`}
                style={channel === c ? { borderColor: '#1A5265', color: '#1A5265', backgroundColor: '#E6EFF2' } : {}}
                onClick={() => setChannel(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Textarea */}
        <div className="mb-3">
          <label className="form-label text-dark fw-semibold small">Reminder Message Preview</label>
          <textarea
            className="form-control"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* SRS Requirement Notice */}
        <div
          className="p-3 rounded-3 border"
          style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        >
          <div className="small text-danger" style={{ fontSize: '0.8rem' }}>
            Sending this reminder notifies the member and logs an activity audit record.
          </div>
        </div>
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          Cancel
        </button>
        <button type="button" className="btn btn-teal px-4" onClick={handleSend}>
          Send Reminder
        </button>
      </div>
    </Modal>
  );
};

export default PaymentReminderModal;
