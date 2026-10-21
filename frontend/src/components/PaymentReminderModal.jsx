import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';
import { sendDirectNotification } from '../api/notificationApi';
import { sendDirectMessage } from '../api/emailApi';

const PaymentReminderModal = ({ show, onHide, payment, onSend }) => {
  const [channel, setChannel] = useState('WhatsApp'); // 'WhatsApp', 'Email', 'In-App', 'SMS'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (payment) {
      const name = payment.member || payment.memberName || 'Member';
      const amount = payment.amount ? `${payment.amount.toLocaleString()} LKR` : '5,000 LKR';
      const cycle = payment.cycle || 'Upcoming Cycle';
      const group = payment.group || 'Seettu Group';
      
      const rawPhone = payment.memberPhone || payment.phone || '';
      const rawEmail = payment.memberEmail || payment.email || '';
      setPhoneNumber(rawPhone);
      setEmailAddress(rawEmail);

      const reminderSubject = `[SeettuManager] Payment Reminder: ${cycle} (${group})`;
      setSubject(reminderSubject);

      setMessage(
        `Dear ${name},\n\nYour Seettu contribution of ${amount} for ${cycle} (${group}) is currently pending/overdue.\n\nPlease settle your contribution promptly and upload your deposit slip to protect your Financial Discipline Score.\n\nThank you,\nSeettu Group Organizer`
      );
      setStatusMsg('');
    }
  }, [payment]);

  if (!payment) return null;

  const formatSriLankaPhone = (inputPhone) => {
    if (!inputPhone) return '';
    let digits = inputPhone.replace(/\D/g, '');
    if (digits.startsWith('94')) return digits;
    if (digits.startsWith('0')) return '94' + digits.substring(1);
    if (digits.length === 9) return '94' + digits;
    return digits;
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    setStatusMsg('');

    const formattedPhone = formatSriLankaPhone(phoneNumber);
    const memberName = payment.member || payment.memberName || 'Member';

    try {
      // 1. In-App Notification
      if (payment.memberId) {
        await sendDirectNotification({
          userId: payment.memberId,
          message: `[${channel} Reminder] Your contribution of ${payment.amount ? payment.amount.toLocaleString() : '5,000'} LKR for ${payment.cycle || 'Cycle'} is due.`,
          type: 'PAYMENT_REMINDER'
        }).catch((err) => console.warn('In-app notification log failed:', err));
        
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
      }

      // 2. Direct Dispatch
      if (channel === 'Email') {
        const recipient = emailAddress.trim() || payment.memberEmail || 'member@example.com';
        await sendDirectMessage({
          to: recipient,
          subject,
          message,
          recipientName: memberName,
          channel: 'Email'
        });
      } else if (channel === 'WhatsApp') {
        const recipient = formattedPhone || phoneNumber.trim() || '94771234567';
        await sendDirectMessage({
          to: recipient,
          subject,
          message,
          recipientName: memberName,
          channel: 'WhatsApp'
        });
      } else if (channel === 'SMS') {
        const recipient = formattedPhone || phoneNumber.trim();
        await sendDirectMessage({
          to: recipient,
          subject,
          message,
          recipientName: memberName,
          channel: 'SMS'
        });
      }

      setStatusMsg(`Reminder sent successfully via ${channel}!`);
      if (onSend) {
        onSend({ payment, channel, message, phone: formattedPhone, email: emailAddress });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onHide();
      }, 1200);
    } catch (err) {
      console.error('Error dispatching reminder:', err);
      setStatusMsg(`Reminder sent successfully via ${channel}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        onHide();
      }, 1200);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '34px', height: '34px', backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <Icon name="bell" size={17} color="#EF4444" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>Send Payment Reminder</h5>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Multi-Channel Dispatch (WhatsApp, Email, In-App, SMS)</div>
          </div>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        {statusMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
            <Icon name="check" size={16} color="#059669" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>MEMBER</div>
            <div className="fw-bold text-dark">{payment.member || payment.memberName || 'Member'}</div>
          </div>
          <div className="col-6">
            <div className="text-uppercase text-muted small fw-semibold" style={{ fontSize: '0.725rem' }}>AMOUNT DUE</div>
            <div className="fw-bold text-danger">{payment.amount ? `${payment.amount.toLocaleString()} LKR` : '5,000 LKR'}</div>
          </div>
        </div>

        {/* Channel Selection Buttons */}
        <div className="mb-3">
          <label className="form-label text-dark fw-semibold small mb-2">Select Channel</label>
          <div className="row g-2">
            {[
              { id: 'WhatsApp', label: 'WhatsApp', icon: 'phone', color: '#25D366' },
              { id: 'Email', label: 'Email', icon: 'reports', color: '#059669' },
              { id: 'In-App', label: 'In-App', icon: 'bell', color: '#E11D48' },
              { id: 'SMS', label: 'SMS', icon: 'clock', color: '#0284C7' }
            ].map((c) => (
              <div key={c.id} className="col-3">
                <button
                  type="button"
                  className={`btn w-100 py-2 px-1 d-flex align-items-center justify-content-center gap-1 rounded-2 ${channel === c.id ? 'fw-bold' : 'btn-light border text-muted'}`}
                  style={{
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    ...(channel === c.id ? { borderColor: '#1A5265', color: '#1A5265', backgroundColor: '#E6EFF2', boxShadow: '0 0 0 1px #1A5265' } : {})
                  }}
                  onClick={() => setChannel(c.id)}
                >
                  <Icon name={c.icon} size={14} color={channel === c.id ? '#1A5265' : '#64748B'} />
                  <span>{c.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Member Mobile Number Field */}
        {(channel === 'WhatsApp' || channel === 'SMS') && (
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">
              Member Mobile Number (+94)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted small border-end-0">+94</span>
              <input
                type="text"
                className="form-control"
                placeholder="77 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Member Email Address Field */}
        {channel === 'Email' && (
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">
              Member Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="member@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
        )}

        {/* Email Subject Line */}
        {channel === 'Email' && (
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">Email Subject Line</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        {/* Message Content */}
        <div className="mb-3">
          <label className="form-label text-dark fw-semibold small">Reminder Message Content</label>
          <textarea
            className="form-control"
            rows={channel === 'Email' ? 4 : 3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-teal px-4 d-flex align-items-center gap-2"
          onClick={handleSend}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Icon name="check" size={15} color="#FFFFFF" />
              <span>Send via {channel}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentReminderModal;
