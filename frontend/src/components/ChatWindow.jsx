import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import GuardrailNotice from './GuardrailNotice';
import { apiClient } from '../api/client';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Load history on mount
    const fetchHistory = async () => {
      try {
        const conversations = await apiClient('/chat/history');
        if (conversations && conversations.length > 0) {
          // Load the most recent conversation
          const latest = conversations[0];
          setConversationId(latest.id);
          setMessages(latest.messages);
        } else {
          // Starting a new conversation
          setMessages([{
            role: 'assistant',
            content: 'Hello! I am your AI assistant. How can I help you today?'
          }]);
        }
      } catch (err) {
        console.error('Failed to load history', err);
        setError('Failed to load chat history.');
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (content) => {
    setError('');
    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await apiClient('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ content, conversationId })
      });
      
      setConversationId(response.conversationId);
      setMessages(prev => [...prev.filter(m => m !== userMsg), response.userMessage, response.assistantMessage]);
    } catch (err) {
      if (err.isGuardrail) {
        // Append a synthetic message indicating a guardrail block
        setMessages(prev => [...prev.filter(m => m !== userMsg), userMsg, { isNotice: true, reason: err.reason }]);
      } else {
        setError(err.message || 'Failed to send message');
        setMessages(prev => prev.filter(m => m !== userMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 73px)', // minus header height approx
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'var(--bg-color)'
    }}>
      {error && (
        <div className="error-message" style={{ margin: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, idx) => (
          msg.isNotice 
            ? <GuardrailNotice key={idx} reason={msg.reason} />
            : <MessageBubble key={idx} message={msg} />
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 1rem' }}>
            Assistant is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWindow;
