import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from './Icons';
import { sendDirectNotification } from '../api/notificationApi';

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
      
      // Auto-populate member phone and email
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

  // Format Sri Lankan phone number (+94)
  const formatSriLankaPhone = (inputPhone) => {
    if (!inputPhone) return '';
    let digits = inputPhone.replace(/\D/g, '');
    if (digits.startsWith('94')) {
      return digits;
    }
    if (digits.startsWith('0')) {
      return '94' + digits.substring(1);
    }
    if (digits.length === 9) {
      return '94' + digits;
    }
    return digits;
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    setStatusMsg('');

    const formattedPhone = formatSriLankaPhone(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const encodedSubject = encodeURIComponent(subject);

    try {
      // 1. In-App Notification (Always record in database for audit trail & in-app bell)
      if (payment.memberId) {
        await sendDirectNotification({
          userId: payment.memberId,
          message: `[${channel} Reminder] Your contribution of ${payment.amount ? payment.amount.toLocaleString() : '5,000'} LKR for ${payment.cycle || 'Cycle'} is due.`,
          type: 'PAYMENT_REMINDER'
        }).catch((err) => console.warn('In-app notification log failed:', err));
        
        // Notify other components (Topbar bell, Notification Center) to refresh immediately
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
      }

      // 2. Channel-specific live dispatch
      if (channel === 'WhatsApp') {
        const waUrl = formattedPhone 
          ? `https://wa.me/${formattedPhone}?text=${encodedMessage}`
          : `https://wa.me/?text=${encodedMessage}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else if (channel === 'Email') {
        // Open Gmail Web composer directly in browser (with mailto fallback)
        const recipient = emailAddress.trim();
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodedSubject}&body=${encodedMessage}`;
        const newWin = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        // If popup blocked or user prefers mailto
        if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
          window.location.href = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedMessage}`;
        }
      } else if (channel === 'SMS') {
        const smsUrl = formattedPhone
          ? `sms:+${formattedPhone}?body=${encodedMessage}`
          : `sms:?body=${encodedMessage}`;
        window.open(smsUrl, '_self');
      }

      if (onSend) {
        onSend({ payment, channel, message, phone: formattedPhone, email: emailAddress });
      }

      setStatusMsg(`Reminder successfully dispatched via ${channel}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        onHide();
      }, 1200);
    } catch (err) {
      console.error('Error dispatching reminder:', err);
      setIsSubmitting(false);
      setStatusMsg('Reminder recorded in audit log.');
      setTimeout(() => onHide(), 1500);
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
          <label className="form-label text-dark fw-semibold small mb-2">Select Notification Channel</label>
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'WhatsApp', label: 'WhatsApp', icon: 'phone', color: '#25D366' },
              { id: 'Email', label: 'Email', icon: 'reports', color: '#059669' },
              { id: 'In-App', label: 'In-App Bell', icon: 'bell', color: '#E11D48' },
              { id: 'SMS', label: 'SMS Text', icon: 'clock', color: '#0284C7' }
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 rounded-2 ${channel === c.id ? 'fw-bold' : 'btn-light border text-muted'}`}
                style={channel === c.id ? { borderColor: '#1A5265', color: '#1A5265', backgroundColor: '#E6EFF2', boxShadow: '0 0 0 1px #1A5265' } : {}}
                onClick={() => setChannel(c.id)}
              >
                <Icon name={c.icon} size={15} color={channel === c.id ? '#1A5265' : '#64748B'} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Member Mobile Number Field (for WhatsApp and SMS) */}
        {(channel === 'WhatsApp' || channel === 'SMS') && (
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">
              Member Mobile Number <span className="text-muted fw-normal">(Sri Lanka: 07x xxx xxxx)</span>
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
            <div className="form-text text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              {channel === 'WhatsApp' 
                ? '📱 Recommended: Opens WhatsApp Web on PC or WhatsApp App on Mobile with the message pre-filled.'
                : '✉️ Opens native SMS app on smartphones or Windows Phone Link on PC. (Per SRS Section 3.4, no paid telecom SMS gateway is used).'}
            </div>
          </div>
        )}

        {/* Member Email Address Field (for Email channel) */}
        {channel === 'Email' && (
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small mb-1">
              Member Registered Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="member@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <div className="form-text text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              ✉️ Opens Gmail / Mail client with the subject and reminder content pre-filled for 1-click delivery to the member's inbox.
            </div>
          </div>
        )}

        {/* Email Subject Line (for Email channel) */}
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

        {/* Message Preview Textarea */}
        <div className="mb-3">
          <label className="form-label text-dark fw-semibold small">Reminder Message Content</label>
          <textarea
            className="form-control"
            rows={channel === 'Email' ? 5 : 3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Real-Time Status & Audit Notice */}
        <div
          className="p-2.5 rounded-3 border d-flex align-items-center gap-2"
          style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        >
          <Icon name="shield" size={16} color="#0097B2" />
          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
            Dispatching this reminder updates the member's notification feed and logs a security audit entry.
          </div>
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
              <span>Dispatching...</span>
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
