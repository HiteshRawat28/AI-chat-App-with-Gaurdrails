import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import GuardrailNotice from './GuardrailNotice';
import { RateLimitNotice } from './RateLimitNotice';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

const ChatWindow = () => {
  const { user } = useAuth();
  const username = user?.email ? user.email.split('@')[0] : 'User';
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState('');
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(0);
  const [modelPreference, setModelPreference] = useState('mock');
  
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
          setMessages([]);
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
        body: JSON.stringify({ content, conversationId, modelPreference })
      });
      
      setConversationId(response.conversationId);
      setMessages(prev => [...prev.filter(m => m !== userMsg), response.userMessage, response.assistantMessage]);
    } catch (err) {
      if (err.isRateLimit) {
        setRateLimitRetryAfter(err.retryAfter);
        setMessages(prev => prev.filter(m => m !== userMsg));
      } else if (err.isGuardrail) {
        // Append a synthetic message indicating a guardrail block
        setMessages(prev => [...prev.filter(m => m !== userMsg), userMsg, { isNotice: true, reason: err.reason }]);
      } else {
        let errorMsg = err.message || 'Failed to send message';
        if (err.isApiError && modelPreference !== 'low' && modelPreference !== 'mock') {
          errorMsg += ' Suggestion: Try switching to the "Low" or "Mock" model using the dropdown below.';
        }
        setError(errorMsg);
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
      justifyContent: messages.length === 0 ? 'center' : 'flex-start',
      height: messages.length === 0 ? 'calc(100vh - 73px)' : 'calc(100vh - 73px - 4rem)',
      width: '100%',
      maxWidth: '800px',
      margin: messages.length === 0 ? '0 auto' : '2rem auto',
      backgroundColor: messages.length === 0 ? 'transparent' : 'var(--surface-color)',
      borderRadius: messages.length === 0 ? '0' : '16px',
      boxShadow: messages.length === 0 ? 'none' : 'var(--shadow-sm)',
      border: messages.length === 0 ? 'none' : '1px solid var(--border-color)',
      padding: '2rem 1rem',
      transition: 'all 0.3s ease-in-out'
    }}>
      {error && (
        <div className="error-message" style={{ margin: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            margin: '0 0 0.5rem',
            background: 'linear-gradient(135deg, var(--primary-color), #818cf8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Welcome, {capitalizedUsername}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', margin: 0 }}>
            How can I help you today?
          </p>
        </div>
      ) : (
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
            <div style={{ alignSelf: 'flex-start', margin: '0.5rem 1rem', display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }}></span>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.2s' }}></span>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out 0.4s' }}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div style={{ padding: '0 1.5rem' }}>
        {rateLimitRetryAfter > 0 && (
          <RateLimitNotice 
            retryAfter={rateLimitRetryAfter} 
            onExpire={() => setRateLimitRetryAfter(0)} 
          />
        )}
      </div>

      <MessageInput 
        onSend={handleSendMessage} 
        disabled={isLoading || rateLimitRetryAfter > 0} 
        selectedModel={modelPreference}
        onModelChange={setModelPreference}
      />
    </div>
  );
};

export default ChatWindow;
