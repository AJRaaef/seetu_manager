import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { queryChatbot } from '../api/chatbotApi';
import Icon from './Icons';

const ChatbotWidget = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      isWelcome: true,
      text: "Hello! I'm your Seettu Assistant.\n\nHow can I help you today? You can type any question or choose one of the quick topics below.",
      sender: 'bot',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Categorized quick prompt topics with standard UI icons
  const quickTopics = [
    { key: 'how_to_pay', label: 'How to Pay', icon: 'credit-card', query: 'How do I make a payment or upload a deposit slip?' },
    { key: 'score_formula', label: 'Score Formula', icon: 'award', query: 'How is the Financial Discipline Score calculated?' },
    { key: 'payout_cycles', label: 'Payout Cycles', icon: 'refresh', query: 'When and how are monthly payouts disbursed?' },
    { key: 'seettu_law', label: 'Seettu Law', icon: 'shield', query: 'Is Seettu legal under Sri Lankan law?' },
    { key: 'exit_rules', label: 'Exit Rules', icon: 'alert-circle', query: 'What happens if a member wants to cancel or leave early?' },
    { key: 'refund_policy', label: 'Refund Policy', icon: 'file-text', query: 'How does the refund process work?' },
    { key: 'file_dispute', label: 'File Dispute', icon: 'scale', query: 'How do I file a dispute or complaint?' },
    { key: 'helplines', label: 'Helplines', icon: 'phone', query: 'How do I contact SeettuManager customer support?' }
  ];

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-chatbot', handleToggle);
    return () => window.removeEventListener('toggle-chatbot', handleToggle);
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, loading]);

  const handleSendText = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    const userMsg = {
      text: queryText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryChatbot(queryText);
      const botResponse = res?.data || res?.answer || res || "I'm here to help! You can review groups, payouts, and payments from the sidebar.";
      setMessages(prev => [
        ...prev,
        {
          text: typeof botResponse === 'string' ? botResponse : JSON.stringify(botResponse),
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      // Local fallback in case of network interruption or server delay
      let fallbackText = "";
      const lower = queryText.toLowerCase();

      if (lower.includes('score') || lower.includes('discipline') || lower.includes('rating') || lower.includes('formula')) {
        fallbackText = "Your Financial Discipline Score starts at 100 points:\n\nFormula: 100 - [(Late Payments × 5) + (Missed Cycles × 10) + (Avg Delay Days × 0.5)]\n\n• 90-100 (Excellent): Priority payout access\n• 75-89 (Good): Standard eligibility\n• 50-74 (Average): Guarantor required\n• Below 50: At Risk";
      } else if (lower.includes('payout') || lower.includes('turn') || lower.includes('cycle') || lower.includes('pot')) {
        fallbackText = "Payouts follow the agreed rotational schedule:\n• Each cycle, one member is assigned the lump-sum pot.\n• Turn allocation is based on initial lot draw, auction bid, or discipline score.\n• Check the 'Payouts' section on your dashboard to see your scheduled turn date!";
      } else if (lower.includes('pay') || lower.includes('payment') || lower.includes('slip') || lower.includes('deposit') || lower.includes('transfer')) {
        fallbackText = "To make or record a payment:\n1. Click 'Payments' on the left navigation menu.\n2. Select your active Seettu Group and Cycle number.\n3. Click 'Record Payment' or 'Upload Slip'.\n4. Attach your bank slip or transaction reference.\n5. The organizer verifies it within 24 hours.";
      } else if (lower.includes('law') || lower.includes('ordinance') || lower.includes('legal') || lower.includes('cheetus')) {
        fallbackText = "SeettuManager operates strictly under The Cheetus Ordinance No. 61 of 1935 (Chapter 190) and the Cheetus (Amendment) Act No. 55 of 1980 of Sri Lanka, with transparent digital records and legal dispute channels.";
      } else if (lower.includes('cancel') || lower.includes('exit') || lower.includes('leave') || lower.includes('quit')) {
        fallbackText = "Cancellation Rules (Cheetus Ordinance Sec. 18-22):\n• Non-Prizewinners: May withdraw with 14 days' written notice; savings refunded at group maturity minus 5% admin fee.\n• Prizewinners: Cannot withdraw without settling future dues or providing bank collateral.";
      } else if (lower.includes('refund') || lower.includes('money back')) {
        fallbackText = "Refunds are processed within 30 days after the Seettu group completes its final cycle. Erroneous transfers are refunded within 3-5 business days upon verification.";
      } else if (lower.includes('dispute') || lower.includes('complaint') || lower.includes('issue')) {
        fallbackText = "To file a complaint or report a default, visit the 'Complaints' page from our footer quick links or email disputes@seettumanager.com for statutory arbitration support.";
      } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('helpline') || lower.includes('support')) {
        fallbackText = "Contact SeettuManager Support:\n• Hotline: +94 11 234 5678 / +94 77 123 4567\n• WhatsApp: +94 77 987 6543\n• Email: support@seettumanager.com\n• Colombo Head Office: Level 4, Colombo Commercial Hub, Galle Road, Colombo 03.";
      } else {
        fallbackText = "I'm currently operating in offline mode. Please choose one of the topics below or email support@seettumanager.com for assistance!";
      }

      setMessages(prev => [
        ...prev,
        {
          text: fallbackText,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1060 }}>
      {/* Scoped CSS to eliminate horizontal scrollbar and style vertical scrollbar */}
      <style>{`
        .chatbot-chips-scroll {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .chatbot-chips-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chatbot-messages-scroll {
          scrollbar-width: thin !important;
          scrollbar-color: #CBD5E1 transparent !important;
        }
        .chatbot-messages-scroll::-webkit-scrollbar {
          width: 5px !important;
        }
        .chatbot-messages-scroll::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .chatbot-messages-scroll::-webkit-scrollbar-thumb {
          background-color: #CBD5E1 !important;
          border-radius: 4px !important;
        }
        .chatbot-messages-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8 !important;
        }
      `}</style>

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn text-white rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#0F2F3D',
            boxShadow: '0 8px 24px rgba(15, 47, 61, 0.35)',
            transition: 'all 0.25s ease',
            cursor: 'pointer'
          }}
          title="Open Seettu Assistant"
        >
          <Icon name="help-circle" size={24} color="#FFFFFF" />
        </button>
      )}

      {/* Floating Chatbot Window */}
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
            animation: 'fadeIn 0.2s ease-in-out'
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
                <div className="fw-bold fs-6 lh-1 mb-1" style={{ letterSpacing: '0.2px' }}>{t('chatbot_widget.title', 'Seettu Assistant')}</div>
                <div className="d-flex align-items-center gap-1 small text-white-50" style={{ fontSize: '0.75rem' }}>
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: '7px', height: '7px', backgroundColor: '#10B981' }}
                  ></span>
                  <span>{t('chatbot_widget.status', 'Instant Help & FAQ')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-link text-white-50 p-1 border-0 text-decoration-none"
              style={{ transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              title={t('chatbot_widget.close', 'Close Chat')}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Messages Container */}
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
                    fontSize: '0.85rem'
                  }}
                >
                  {m.isWelcome 
                    ? t('chatbot_widget.welcome', "Hello! I'm your Seettu Assistant.\n\nHow can I help you today? You can type any question or choose one of the quick topics below.")
                    : m.text}
                </div>
                <span className="text-muted mt-1 px-1" style={{ fontSize: '0.675rem' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center gap-2 text-muted small p-2">
                <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                <span style={{ fontSize: '0.8rem' }}>{t('chatbot_widget.typing', 'Assistant is typing...')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips Bar (Fully visible without scrollbar overlay) */}
          <div className="bg-white border-top border-bottom py-2 flex-shrink-0">
            <div 
              className="chatbot-chips-scroll px-3 d-flex gap-2"
              style={{ 
                overflowX: 'auto', 
                whiteSpace: 'nowrap',
                scrollBehavior: 'smooth',
                paddingTop: '2px',
                paddingBottom: '2px'
              }}
            >
              {quickTopics.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendText(item.query)}
                  className="btn btn-sm border rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-none"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    flexShrink: 0,
                    borderColor: '#E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#0F2F3D',
                    lineHeight: '1.25',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0F7FA';
                    e.currentTarget.style.borderColor = '#0097B2';
                    e.currentTarget.style.color = '#007A8F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#0F2F3D';
                  }}
                >
                  <Icon name={item.icon} size={13} color="#0097B2" />
                  <span>{t(`chatbot_widget.topics.${item.key}`, item.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-2 bg-white d-flex align-items-center gap-2 flex-shrink-0">
            <input
              type="text"
              className="form-control rounded-pill border shadow-none px-3 small"
              placeholder={t('chatbot_widget.placeholder', 'Ask anything (e.g. payout, score, rules)...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              style={{ fontSize: '0.875rem' }}
            />
            <button
              onClick={() => handleSendText()}
              disabled={!input.trim() || loading}
              className="btn rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#0097B2',
                border: 'none',
                opacity: (!input.trim() || loading) ? 0.6 : 1,
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer'
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
