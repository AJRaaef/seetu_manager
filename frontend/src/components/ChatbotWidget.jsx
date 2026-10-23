import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { queryChatbot } from '../api/chatbotApi';
import Icon from './Icons';

// Returns the current time in HH:MM format for message timestamps
const currentTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Quick topics shown as chips. The label is translated with the key under chatbot_widget.topics
const QUICK_TOPICS = [
  { key: 'how_to_pay', label: 'How to Pay', icon: 'credit-card', query: 'How do I make a payment or upload a deposit slip?' },
  { key: 'score_formula', label: 'Score Formula', icon: 'award', query: 'How is the Financial Discipline Score calculated?' },
  { key: 'payout_cycles', label: 'Payout Cycles', icon: 'refresh', query: 'When and how are monthly payouts disbursed?' },
  { key: 'seettu_law', label: 'Seettu Law', icon: 'shield', query: 'Is Seettu legal under Sri Lankan law?' },
  { key: 'exit_rules', label: 'Exit Rules', icon: 'alert-circle', query: 'What happens if a member wants to cancel or leave early?' },
  { key: 'refund_policy', label: 'Refund Policy', icon: 'file-text', query: 'How does the refund process work?' },
  { key: 'file_dispute', label: 'File Dispute', icon: 'scale', query: 'How do I file a dispute or complaint?' },
  { key: 'helplines', label: 'Helplines', icon: 'phone', query: 'How do I contact SeettuManager customer support?' },
];

// Offline answers (SRS STB-13) used when the server cannot be reached
const getFallbackAnswer = (text) => {
  const lower = text.toLowerCase();

  if (lower.includes('score') || lower.includes('discipline') || lower.includes('formula')) {
    return "Your Financial Discipline Score starts at 100 points:\n\nFormula: 100 - [(Late Payments × 5) + (Missed Cycles × 10) + (Avg Delay Days × 0.5)]\n\n• 90-100 (Excellent): Priority payout access\n• 75-89 (Good): Standard eligibility\n• 50-74 (Average): Guarantor required\n• Below 50: At Risk";
  }
  if (lower.includes('payout') || lower.includes('turn') || lower.includes('cycle')) {
    return "Payouts follow the agreed rotational schedule:\n• Each cycle, one member receives the lump-sum pot.\n• Turn allocation is based on the initial lot draw, auction bid, or discipline score.\n• Check the payout section on your dashboard for your scheduled date.";
  }
  if (lower.includes('pay') || lower.includes('slip') || lower.includes('deposit') || lower.includes('transfer')) {
    return "To make or record a payment:\n1. Open 'Payments' from the sidebar.\n2. Select your active Seettu group and cycle.\n3. Click 'Record Payment' or upload your slip.\n4. The organizer verifies it.";
  }
  if (lower.includes('law') || lower.includes('ordinance') || lower.includes('legal') || lower.includes('cheetus')) {
    return "SeettuManager operates under The Cheetus Ordinance No. 61 of 1935 of Sri Lanka, with transparent digital records and legal dispute channels.";
  }
  if (lower.includes('cancel') || lower.includes('exit') || lower.includes('leave') || lower.includes('quit')) {
    return "Cancellation rules depend on your group's terms. Prizewinners cannot withdraw without settling future dues. Please contact your organizer for details.";
  }
  if (lower.includes('refund') || lower.includes('money back')) {
    return "Refunds are processed after the Seettu group completes its final cycle. Erroneous transfers are refunded after verification.";
  }
  if (lower.includes('dispute') || lower.includes('complaint') || lower.includes('issue')) {
    return "To file a dispute, open the 'Disputes' page from the sidebar and submit the details.";
  }
  if (lower.includes('contact') || lower.includes('helpline') || lower.includes('support')) {
    return "Please contact SeettuManager support through the contact details on the landing page, or reach your group organizer.";
  }
  return "I'm currently unable to reach the server. Please choose one of the quick topics or try again later.";
};

const ChatbotWidget = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { isWelcome: true, sender: 'bot', time: 'Just now' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef(null);

  // Open/close the chat when the sidebar "Help Center" button fires the global event
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-chatbot', handleToggle);
    return () => window.removeEventListener('toggle-chatbot', handleToggle);
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, isOpen, loading]);

  // Sends a question (typed or from a quick topic) and appends the reply
  const handleSendText = async (textToSend) => {
    const queryText = (textToSend ?? input).trim();
    if (!queryText || loading) return;

    setMessages((prev) => [...prev, { text: queryText, sender: 'user', time: currentTime() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryChatbot(queryText);
      const botResponse = res?.data ?? res?.answer ?? res;
      const text = typeof botResponse === 'string' ? botResponse : JSON.stringify(botResponse);
      setMessages((prev) => [...prev, { text, sender: 'bot', time: currentTime() }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { text: getFallbackAnswer(queryText), sender: 'bot', time: currentTime() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Admins do not use the chatbot
  if (isAdmin) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1060 }}>
      {/* Scoped CSS: hides the chip scrollbar and styles the message scrollbar */}
      <style>{`
        .chatbot-chips-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .chatbot-chips-scroll::-webkit-scrollbar { display: none; }
        .chatbot-messages-scroll { scrollbar-width: thin; scrollbar-color: #CBD5E1 transparent; }
        .chatbot-messages-scroll::-webkit-scrollbar { width: 5px; }
        .chatbot-messages-scroll::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }
      `}</style>

      {/* Floating launcher button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn text-white rounded-circle d-flex align-items-center justify-content-center border-0"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#0F2F3D',
            boxShadow: '0 8px 24px rgba(15, 47, 61, 0.35)',
            cursor: 'pointer',
          }}
          title={t('chatbot', 'Seettu Assistant')}
        >
          <Icon name="help-circle" size={24} color="#FFFFFF" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="bg-white rounded-4 shadow-lg border d-flex flex-column"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 36px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 1070,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 47, 61, 0.22)',
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white d-flex justify-content-between align-items-center flex-shrink-0"
            style={{ backgroundColor: '#0F2F3D' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px', backgroundColor: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)' }}
              >
                <Icon name="help-circle" size={18} color="#00E5FF" />
              </div>
              <div>
                <div className="fw-bold fs-6 lh-1 mb-1">{t('chatbot_widget.title', 'Seettu Assistant')}</div>
                <div className="d-flex align-items-center gap-1 small text-white-50" style={{ fontSize: '0.75rem' }}>
                  <span className="rounded-circle d-inline-block" style={{ width: '7px', height: '7px', backgroundColor: '#10B981' }}></span>
                  <span>{t('chatbot_widget.status', 'Instant Help & FAQ')}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-link text-white-50 p-1 border-0 text-decoration-none"
              title={t('chatbot_widget.close', 'Close Chat')}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="chatbot-messages-scroll flex-grow-1 p-3 overflow-y-auto"
            style={{ backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`d-flex flex-column ${m.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}
              >
                <div
                  className="p-3 rounded-3 small"
                  style={{
                    maxWidth: '85%',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: m.sender === 'user' ? '#0F2F3D' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#0F2F3D',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '2px' : '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {m.isWelcome
                    ? t(
                        'chatbot_widget.welcome',
                        "Hello! I'm your Seettu Assistant.\n\nHow can I help you today? You can type any question or choose one of the quick topics below."
                      )
                    : m.text}
                </div>
                {!m.isWelcome && (
                  <span className="text-muted mt-1 px-1" style={{ fontSize: '0.675rem' }}>{m.time}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center gap-2 text-muted small p-2">
                <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                <span style={{ fontSize: '0.8rem' }}>{t('chatbot_widget.typing', 'Assistant is typing...')}</span>
              </div>
            )}
          </div>

          {/* Quick topic chips */}
          <div className="bg-white border-top border-bottom py-2 flex-shrink-0">
            <div className="chatbot-chips-scroll px-3 d-flex gap-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {QUICK_TOPICS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSendText(item.query)}
                  disabled={loading}
                  className="btn btn-sm border rounded-pill d-inline-flex align-items-center gap-1 px-3 py-1 shadow-none"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    flexShrink: 0,
                    borderColor: '#E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#0F2F3D',
                  }}
                >
                  <Icon name={item.icon} size={13} color="#0097B2" />
                  <span>{t(`chatbot_widget.topics.${item.key}`, item.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="p-2 bg-white d-flex align-items-center gap-2 flex-shrink-0">
            <input
              type="text"
              className="form-control rounded-pill border shadow-none px-3"
              placeholder={t('chatbot_widget.placeholder', 'Ask a question...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              style={{ fontSize: '0.875rem' }}
            />
            <button
              type="button"
              onClick={() => handleSendText()}
              disabled={!input.trim() || loading}
              className="btn rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 text-white"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#0097B2',
                border: 'none',
                opacity: !input.trim() || loading ? 0.6 : 1,
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              }}
              title={t('chatbot_widget.send', 'Send')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;