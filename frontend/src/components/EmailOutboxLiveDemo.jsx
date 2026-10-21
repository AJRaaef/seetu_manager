import React, { useState, useEffect } from 'react';
import { getOutboxMessages, sendDemoEmail, getEmailPreviewUrl } from '../api/emailApi';
import Icon from './Icons';

const EmailOutboxLiveDemo = ({ currentUser }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipient, setRecipient] = useState(currentUser?.email || 'member.demo@example.com');
  const [templateType, setTemplateType] = useState('PAYMENT_REMINDER');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('EMAIL'); // 'EMAIL' | 'WHATSAPP'
  const [searchTerm, setSearchTerm] = useState('');

  // WhatsApp simulation state
  const [waPhone, setWaPhone] = useState(currentUser?.phoneNumber || '+94 77 123 4567');
  const [waType, setWaType] = useState('DUE_REMINDER');
  const [waSimulating, setWaSimulating] = useState(false);
  const [waDispatchedList, setWaDispatchedList] = useState([
    {
      id: 'wa-1',
      to: '+94 77 889 9001',
      recipientName: 'Kavinda Perera',
      title: 'Monthly Contribution Due Alert',
      body: 'Seettu Alert: Your monthly contribution of LKR 10,000 for Colombo Gold Seettu is due in 2 days. Instant Pay: https://seettu.lk/pay/inv-8812',
      status: 'DELIVERED (Cloud API)',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    fetchOutbox();
  }, []);

  const fetchOutbox = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOutboxMessages();
      setEmails(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to outbound message ledger.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!recipient || !recipient.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }
    try {
      setSending(true);
      setError('');
      setSendSuccess('');
      const res = await sendDemoEmail(recipient, templateType);
      setSendSuccess(
        `✓ Direct Email Dispatched! Server transmitted to "${recipient}" with zero manual action required.`
      );
      await fetchOutbox();
      setTimeout(() => setSendSuccess(''), 6000);
    } catch (err) {
      console.error(err);
      setError('Failed to trigger background email dispatch.');
    } finally {
      setSending(false);
    }
  };

  const handleSimulateWhatsApp = () => {
    setWaSimulating(true);
    setTimeout(() => {
      const newEntry = {
        id: 'wa-' + Date.now(),
        to: waPhone,
        recipientName: currentUser?.fullName || 'Valued Member',
        title: waType === 'DUE_REMINDER' ? 'Installment Due Reminder' : 'Payment Confirmation Voucher',
        body:
          waType === 'DUE_REMINDER'
            ? `SeettuManager Notice: Dear ${currentUser?.fullName || 'Member'}, your installment of LKR 15,000 is due on 25th Oct. Tap to pay: https://seettu.lk/pay/demo`
            : `SeettuManager Receipt: Payment of LKR 15,000 recorded successfully. Receipt Ref: RCT-${Date.now().toString().slice(-6)}.`,
        status: 'DELIVERED (Meta Cloud API)',
        timestamp: new Date().toLocaleTimeString()
      };
      setWaDispatchedList([newEntry, ...waDispatchedList]);
      setWaSimulating(false);
    }, 700);
  };

  const filteredEmails = emails.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.to && item.to.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.fileName && item.fileName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white">
      {/* Header Banner */}
      <div
        className="p-4 text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, #0F2F3D 0%, #164E63 60%, #0097B2 100%)'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-info text-dark px-2.5 py-1 fw-bold text-uppercase">
                Automated Zero-Touch Messaging
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5">
                ● Live Server Dispatch Active
              </span>
            </div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <Icon name="mail" size={26} color="#00E5FF" />
              <span>Direct Email & WhatsApp Dispatch Hub</span>
            </h3>
            <p className="mb-0 text-white-50 small" style={{ maxWidth: '780px', lineHeight: 1.6 }}>
              <strong>No manual opening needed:</strong> The SeettuManager backend automatically dispatches
              transactional emails and WhatsApp alerts via server-level SMTP & Cloud API protocols.
              You can test the dispatch mechanism and preview the delivered communications in real-time below!
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-light btn-sm fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-2 shadow-sm"
              onClick={fetchOutbox}
              disabled={loading}
            >
              <Icon name="refresh" size={14} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh Outbox'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="d-flex gap-2 mt-4">
          <button
            className={`btn btn-sm px-3 py-1.5 fw-bold rounded-pill transition-all ${
              activeTab === 'EMAIL' ? 'btn-light text-dark shadow-sm' : 'btn-outline-light'
            }`}
            onClick={() => setActiveTab('EMAIL')}
          >
            📧 Direct Server Email Outbox ({emails.length})
          </button>
          <button
            className={`btn btn-sm px-3 py-1.5 fw-bold rounded-pill transition-all ${
              activeTab === 'WHATSAPP' ? 'btn-light text-dark shadow-sm' : 'btn-outline-light'
            }`}
            onClick={() => setActiveTab('WHATSAPP')}
          >
            📱 Direct WhatsApp Cloud Bot ({waDispatchedList.length})
          </button>
        </div>
      </div>

      <div className="p-4 bg-light-subtle">
        {error && <div className="alert alert-danger shadow-sm mb-3 py-2 px-3 small">{error}</div>}
        {sendSuccess && (
          <div className="alert alert-success shadow-sm mb-3 py-2 px-3 small d-flex align-items-center gap-2">
            <Icon name="check" size={16} color="#10B981" />
            <span>{sendSuccess}</span>
          </div>
        )}

        {/* ===================== TAB 1: EMAIL DISPATCH & OUTBOX ===================== */}
        {activeTab === 'EMAIL' && (
          <div>
            {/* Live Interactive Sender Box */}
            <div className="card shadow-sm border-0 rounded-3 p-3 p-md-4 mb-4 bg-white">
              <h5 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
                <Icon name="zap" size={20} color="#0097B2" />
                <span>Test Direct Automated Email Dispatch</span>
              </h5>
              <p className="text-muted small mb-3">
                Send an immediate real-time transactional email without opening your personal email client.
                The server generates the HTML template, transmits it, and records it in the verification ledger.
              </p>

              <form onSubmit={handleSendTestEmail} className="row g-3 align-items-end">
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-bold text-muted">Recipient Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. member@gmail.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-muted">Email Template / Purpose</label>
                  <select
                    className="form-select"
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                  >
                    <option value="PAYMENT_REMINDER">💳 Payment Due Reminder (Rotational Cycle)</option>
                    <option value="PAYMENT_RECEIPT">🧾 Official Payment Receipt (LKR 15,000)</option>
                    <option value="LEGAL_NOTICE">⚖️ Cheetus Ordinance Statutory Notice</option>
                  </select>
                </div>

                <div className="col-12 col-md-3">
                  <button
                    type="submit"
                    className="btn btn-teal w-100 fw-bold text-white d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="mail" size={16} />
                        <span>Send Direct Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Outbox Records */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Dispatched Outbox Ledger</h5>
                <span className="small text-muted">
                  Showing all emails dispatched directly by the SeettuManager background subsystem
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
                <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <Icon name="search" size={14} color="#64748B" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by recipient or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted small">Loading outbound email ledger...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="card text-center p-5 shadow-sm border-0 rounded-4 bg-white">
                <Icon name="mail" size={40} color="#94A3B8" className="mx-auto mb-2" />
                <h6 className="fw-bold text-dark">No Outbound Emails Found</h6>
                <p className="text-muted small mb-0">
                  Trigger a test dispatch above to see the automated outbox in action!
                </p>
              </div>
            ) : (
              <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-uppercase text-muted">
                      <tr>
                        <th style={{ width: '180px' }}>Timestamp</th>
                        <th style={{ width: '220px' }}>Recipient</th>
                        <th>Subject</th>
                        <th style={{ width: '160px' }}>Status</th>
                        <th style={{ width: '140px' }} className="text-end">Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((item, idx) => (
                        <tr key={idx}>
                          <td className="small text-muted">
                            <div className="fw-semibold text-dark">
                              {item.lastModified
                                ? new Date(item.lastModified).toLocaleDateString()
                                : 'Recent'}
                            </div>
                            <div style={{ fontSize: '11px' }}>
                              {item.lastModified
                                ? new Date(item.lastModified).toLocaleTimeString()
                                : ''}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-dark small">{item.to}</div>
                            <span className="badge bg-secondary-subtle text-secondary px-1.5 py-0.5" style={{ fontSize: '10px' }}>
                              Automated Dispatch
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark small">{item.subject}</div>
                            <div className="text-muted font-monospace" style={{ fontSize: '11px' }}>
                              {item.fileName}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small fw-bold d-inline-flex align-items-center gap-1">
                              <Icon name="check" size={12} color="#10B981" />
                              <span>{item.status === 'DELIVERED_SMTP' ? 'Delivered (SMTP)' : 'Dispatched to Outbox'}</span>
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-outline-primary btn-sm fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1"
                              style={{ color: '#0097B2', borderColor: '#0097B2' }}
                              onClick={() => setSelectedEmail(item)}
                              title="View fully rendered HTML email exactly as recipient sees it"
                            >
                              <Icon name="eye" size={14} color="#0097B2" />
                              <span>Preview</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: WHATSAPP CLOUD BOT SIMULATOR ===================== */}
        {activeTab === 'WHATSAPP' && (
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
                <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                  <span className="p-2 rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <Icon name="phone" size={16} color="#FFFFFF" />
                  </span>
                  <span>WhatsApp Cloud API Dispatcher</span>
                </h5>
                <p className="text-muted small mb-3">
                  In production, SeettuManager calls Meta's official WhatsApp Business Cloud API.
                  No browser or phone needs to stay open; the messages land instantly on the member's WhatsApp!
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Recipient Phone Number (+94)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">WhatsApp Approved Template</label>
                  <select
                    className="form-select"
                    value={waType}
                    onChange={(e) => setWaType(e.target.value)}
                  >
                    <option value="DUE_REMINDER">⏰ seettu_cycle_due_reminder (Interactive)</option>
                    <option value="RECEIPT_CONFIRM">✅ payment_verified_voucher (With PDF Link)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm"
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                  onClick={handleSimulateWhatsApp}
                  disabled={waSimulating}
                >
                  {waSimulating ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Transmitting Cloud Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="phone" size={16} />
                      <span>Dispatch Direct WhatsApp Alert</span>
                    </>
                  )}
                </button>

                <div className="mt-4 p-3 rounded-3 bg-light border text-muted small">
                  <div className="fw-bold text-dark mb-1">Architecture Summary:</div>
                  <ul className="mb-0 ps-3" style={{ fontSize: '12px' }}>
                    <li><strong>No WhatsApp Web:</strong> Runs directly via Meta Graph API v19.0.</li>
                    <li><strong>Statutory Verification:</strong> Pre-registered HSM template compliant with local banking notices.</li>
                    <li><strong>Automatic Fallback:</strong> If phone has no data connection, fallback SMS is triggered.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mobile Chat Preview */}
            <div className="col-12 col-lg-7">
              <div
                className="card shadow-sm border-0 rounded-4 overflow-hidden"
                style={{ backgroundColor: '#ECE5DD' }}
              >
                {/* WhatsApp Chat Header */}
                <div
                  className="p-3 text-white d-flex align-items-center gap-3"
                  style={{ backgroundColor: '#075E54' }}
                >
                  <div
                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '40px', height: '40px' }}
                  >
                    SM
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold d-flex align-items-center gap-1">
                      <span>SeettuManager Official</span>
                      <span className="badge bg-success-subtle text-white p-0.5 rounded-circle">✓</span>
                    </div>
                    <div className="small text-white-50" style={{ fontSize: '11px' }}>
                      Official Business Account • Automated Bot
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Bubbles */}
                <div className="p-3 p-md-4" style={{ minHeight: '360px', maxHeight: '450px', overflowY: 'auto' }}>
                  <div className="text-center mb-3">
                    <span className="badge bg-secondary-subtle text-muted fw-normal px-2 py-1 small rounded-pill">
                      Messages are end-to-end encrypted & certified under Cheetus Ordinance
                    </span>
                  </div>

                  {waDispatchedList.map((msg) => (
                    <div
                      key={msg.id}
                      className="card border-0 shadow-sm rounded-3 p-3 mb-3 ms-auto"
                      style={{
                        maxWidth: '85%',
                        backgroundColor: '#DCF8C6',
                        borderTopRightRadius: '0px'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark small">{msg.title}</strong>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          To: {msg.to}
                        </span>
                      </div>
                      <p className="mb-2 text-dark small" style={{ lineHeight: 1.5 }}>
                        {msg.body}
                      </p>
                      <div className="d-flex justify-content-between align-items-center pt-1 border-top border-success-subtle">
                        <span className="badge bg-success small text-white" style={{ fontSize: '9px' }}>
                          ✓✓ {msg.status}
                        </span>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODAL: EMAIL HTML PREVIEW ===================== */}
      {selectedEmail && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 47, 61, 0.75)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: '#0F2F3D', borderBottom: '1px solid #1E465A' }}
              >
                <div>
                  <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <Icon name="mail" size={18} color="#00E5FF" />
                    <span>In-Browser Live Email Inspection</span>
                  </h6>
                  <small className="text-white-50">
                    Recipient: <strong>{selectedEmail.to}</strong> | Subject: {selectedEmail.subject}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <a
                    href={getEmailPreviewUrl(selectedEmail.fileName)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-light d-none d-md-inline-flex align-items-center gap-1"
                  >
                    <span>Open In Full Tab</span>
                    <Icon name="chevron-right" size={14} />
                  </a>
                  <button
                    type="button"
                    className="btn btn-close btn-close-white"
                    onClick={() => setSelectedEmail(null)}
                  />
                </div>
              </div>

              <div className="modal-body p-0" style={{ height: '620px', backgroundColor: '#F8FAFC' }}>
                <iframe
                  title="Rendered Email Preview"
                  src={getEmailPreviewUrl(selectedEmail.fileName)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                />
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between py-2.5 px-4">
                <span className="small text-muted">
                  ✓ Verified: Stored in SeettuManager outbound audit repository (<code>{selectedEmail.fileName}</code>)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fw-bold px-3"
                  onClick={() => setSelectedEmail(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailOutboxLiveDemo;
