import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { queryChatbot } from '../api/chatbotApi';
import Icon from './Icons';

const ChatbotWidget = () => {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Seettu Assistant 👋\n\nHow can I help you today? You can type any question or click one of the quick topics below.",
      sender: 'bot',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Categorized quick prompt topics for instant 1-click answers
  const quickTopics = [
    { label: '💳 How to Pay', query: 'How do I make a payment or upload a deposit slip?' },
    { label: '📊 Score Formula', query: 'How is the Financial Discipline Score calculated?' },
    { label: '🔄 Payout Cycles', query: 'When and how are monthly payouts disbursed?' },
    { label: '📜 Seettu Law', query: 'Is Seettu legal under Sri Lankan law?' },
    { label: '❌ Exit Rules', query: 'What happens if a member wants to cancel or leave early?' },
    { label: '💰 Refund Policy', query: 'How does the refund process work?' },
    { label: '⚖️ File Dispute', query: 'How do I file a dispute or complaint?' },
    { label: '📞 Helplines', query: 'How do I contact SeettuManager customer support?' }
  ];

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-chatbot', handleToggle);
    return () => window.removeEventListener('toggle-chatbot', handleToggle);
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
        fallbackText = "I'm currently operating in offline mode. Please choose one of the topic chips below or email support@seettumanager.com for assistance!";
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
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
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
            className="p-3 text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: '#0F2F3D' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px', backgroundColor: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.4)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <rect x="4" y="6" width="16" height="12" rx="2" />
                  <circle cx="9" cy="12" r="1.5" fill="#00E5FF" />
                  <circle cx="15" cy="12" r="1.5" fill="#00E5FF" />
                  <path d="M9 16h6" />
                </svg>
              </div>
              <div>
                <div className="fw-bold fs-6 lh-1 mb-1" style={{ letterSpacing: '0.2px' }}>Seettu Assistant</div>
                <div className="d-flex align-items-center gap-1 small text-white-50" style={{ fontSize: '0.75rem' }}>
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: '7px', height: '7px', backgroundColor: '#10B981' }}
                  ></span>
                  <span>Instant Help & FAQ</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-link text-white-50 p-1 border-0 text-decoration-none"
              style={{ transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              title="Close Chat"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            className="flex-grow-1 p-3 overflow-y-auto"
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
                  {m.text}
                </div>
                <span className="text-muted mt-1 px-1" style={{ fontSize: '0.675rem' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center gap-2 text-muted small p-2">
                <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                <span style={{ fontSize: '0.8rem' }}>Assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips with horizontal scroll */}
          <div className="px-3 py-2 bg-white border-top border-bottom" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <div className="d-flex gap-2">
              {quickTopics.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSendText(item.query)}
                  className="btn btn-sm btn-light border rounded-pill text-dark small px-2 py-1"
                  style={{
                    fontSize: '0.72rem',
                    flexShrink: 0,
                    borderColor: '#E2E8F0',
                    backgroundColor: '#F8FAFC',
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
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-2 bg-white d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control rounded-pill border shadow-none px-3 small"
              placeholder="Ask anything (e.g. payout, score, rules)..."
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
              title="Send Message"
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
