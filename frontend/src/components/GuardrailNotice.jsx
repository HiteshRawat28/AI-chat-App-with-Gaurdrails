const GuardrailNotice = ({ reason }) => {
  // Map internal reason codes to friendly user messages
  const friendlyMessages = {
    'hate_speech': 'Your message was blocked because it contained inappropriate language.',
    'restricted_topic_finance': 'I cannot provide financial advice. Please consult a qualified professional.',
    'invalid_input': 'Your message could not be processed.'
  };

  const displayMessage = friendlyMessages[reason] || 'Your message was blocked by our safety guidelines.';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '1rem',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '85%',
        padding: '0.75rem 1.25rem',
        borderRadius: '8px',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-color)',
        borderLeft: '4px solid var(--accent-amber)',
        boxShadow: 'var(--shadow-sm)',
        lineHeight: 1.5,
        fontSize: '15px'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
          Notice
        </div>
        {displayMessage}
      </div>
    </div>
  );
};

export default GuardrailNotice;
