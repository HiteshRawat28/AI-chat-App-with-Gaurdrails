import { useState } from 'react';

const MessageInput = ({ onSend, disabled, selectedModel, onModelChange }) => {
  const [text, setText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const models = [
    { id: 'high', label: 'High (Gemini 3.5)' },
    { id: 'low', label: 'Low (Gemini 2.5)' },
    { id: 'mock', label: 'Mock (Testing)' }
  ];

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
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="form-input"
          style={{ 
            width: 'auto', 
            padding: '0.75rem 1rem', 
            margin: 0, 
            cursor: disabled ? 'not-allowed' : 'pointer', 
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            fontWeight: 600,
            color: 'var(--primary-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          {models.find(m => m.id === selectedModel)?.label}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '0.5rem',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 10,
            minWidth: '100%'
          }}>
            {models.map(model => (
              <div 
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: selectedModel === model.id ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: selectedModel === model.id ? 'var(--primary-color)' : 'var(--text-color)',
                  fontWeight: selectedModel === model.id ? 600 : 400,
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (selectedModel !== model.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedModel !== model.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {model.label}
              </div>
            ))}
          </div>
        )}
      </div>
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
