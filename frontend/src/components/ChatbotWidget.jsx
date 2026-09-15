import React, { useState } from 'react';
import { queryChatbot } from '../api/chatbotApi';
import { useTranslation } from 'react-i18next';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! I'm your Seettu assistant. How can I help you?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const { t } = useTranslation();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    try {
      const res = await queryChatbot(userMsg.text);
      setMessages(prev => [...prev, { text: res.data, sender: 'bot' }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' }]);
    }
  };

  return (
    <div className="chatbot-widget">
      {!isOpen && (
        <button className="chatbot-button" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>{t('chatbot')}</span>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
