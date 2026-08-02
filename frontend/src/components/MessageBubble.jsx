const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        backgroundColor: isUser ? 'var(--primary-color)' : 'var(--surface-color)',
        color: isUser ? 'white' : 'var(--text-color)',
        border: isUser ? 'none' : '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        lineHeight: 1.5,
        fontSize: '15px',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}>
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
