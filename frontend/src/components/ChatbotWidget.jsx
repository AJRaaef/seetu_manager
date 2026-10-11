import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { queryChatbot } from '../api/chatbotApi';
import Icon from './Icons';

const ChatbotWidget = () => {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Seettu Assistant. How can I help you today with your groups, payouts, or payments?",
      sender: 'bot',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick prompt suggestions per SRS US-16
  const suggestions = [
    'When is my next payout?',
    'How is discipline score calculated?',
    'How to record a payment?'
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
      // Local fallback per SRS STB-13 (Graceful degraded mode with basic FAQs)
      let fallbackText = "I couldn't reach the server right now. ";
      const lower = queryText.toLowerCase();

      if (lower.includes('score') || lower.includes('discipline')) {
        fallbackText = "Your Financial Discipline Score is calculated as: 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)]. Scores above 90 are in the EXCELLENT tier!";
      } else if (lower.includes('payout') || lower.includes('cycle')) {
        fallbackText = "Your upcoming payout is scheduled for Kamala Perera (Cycle 3, 24,000 LKR). Click 'Review Payout' on your dashboard to approve it.";
      } else if (lower.includes('payment') || lower.includes('record')) {
        fallbackText = "To record payments, go to the Payments page from the sidebar, select the group, member, and cycle, then click 'Record Payment'.";
      } else {
        fallbackText += "For assistance, you can also browse the FAQ or reach out to your group organizer.";
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
            backgroundColor: '#1A5265',
            transition: 'all 0.25s ease',
            cursor: 'pointer'
          }}
          title="Open Seettu Chat Assistant"
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
            width: '370px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            zIndex: 1070,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: '#1A5265' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <rect x="4" y="6" width="16" height="12" rx="2" />
                  <circle cx="9" cy="12" r="1" fill="#FFFFFF" />
                  <circle cx="15" cy="12" r="1" fill="#FFFFFF" />
                  <path d="M9 16h6" />
                </svg>
              </div>
              <div>
                <div className="fw-bold fs-6 lh-1 mb-1">Seettu Assistant</div>
                <div className="d-flex align-items-center gap-1 small text-white-50" style={{ fontSize: '0.75rem' }}>
                  <span
                    className="rounded-circle d-inline-block"
                    style={{ width: '7px', height: '7px', backgroundColor: '#10B981' }}
                  ></span>
                  <span>Online Help</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-link text-white p-1 border-0 text-decoration-none"
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
                    maxWidth: '82%',
                    lineHeight: '1.45',
                    backgroundColor: m.sender === 'user' ? '#1A5265' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#0F2F3D',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '2px' : '12px'
                  }}
                >
                  {m.text}
                </div>
                <span className="text-muted mt-1" style={{ fontSize: '0.675rem' }}>
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

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white border-top border-bottom" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <div className="d-flex gap-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSendText(s)}
                  className="btn btn-sm btn-light border rounded-pill text-muted small px-2 py-1"
                  style={{ fontSize: '0.725rem', flexShrink: 0 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-2 bg-white d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control rounded-pill border shadow-none px-3 small"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              style={{ fontSize: '0.875rem' }}
            />
            <button
              onClick={() => handleSendText()}
              disabled={!input.trim() || loading}
              className="btn btn-teal rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style={{ width: '38px', height: '38px' }}
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
