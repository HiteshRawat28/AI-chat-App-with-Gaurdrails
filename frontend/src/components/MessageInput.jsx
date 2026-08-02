import { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: 'var(--surface-color)',
      borderTop: '1px solid var(--border-color)',
      backdropFilter: 'blur(8px)'
    }}>
      <input
        type="text"
        className="form-input"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        style={{ flex: 1, margin: 0 }}
      />
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={!text.trim() || disabled}
        style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
