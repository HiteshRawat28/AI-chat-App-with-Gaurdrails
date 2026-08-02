import React, { useState, useEffect } from 'react';

export const RateLimitNotice = ({ retryAfter, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(retryAfter);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--surface-color)',
      borderLeft: '4px solid var(--error-color)',
      borderRadius: '8px',
      margin: '0.5rem 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>
          Rate Limit Exceeded
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        You're sending messages too fast. Please wait <strong>{timeLeft}</strong> seconds before trying again.
      </p>
    </div>
  );
};
