import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email === 'admin@example.com') {
      apiClient('/admin/guardrail-events')
        .then(data => setEvents(data))
        .catch(err => setError(err.message));
    } else {
      setError('You must be logged in as admin@example.com to view this page.');
    }
  }, [user]);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-color)' }}>
      <h1>Guardrail Events Log</h1>
      {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}
      
      {events.length === 0 && !error && (
        <p>No events logged yet. Try triggering a restricted topic or rate limit!</p>
      )}

      {events.map(ev => (
        <div key={ev.id} style={{ 
          background: 'var(--surface-color)', 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '8px',
          borderLeft: `4px solid ${ev.type === 'rate-limit' ? 'var(--accent-amber)' : 'var(--error-color)'}`
        }}>
          <div><strong>Type:</strong> {ev.type}</div>
          <div><strong>Rule:</strong> {ev.ruleTriggered}</div>
          <div><strong>User:</strong> {ev.user?.email}</div>
          <div><strong>Time:</strong> {new Date(ev.createdAt).toLocaleString()}</div>
          {ev.contentSnippet && (
            <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Snippet: "{ev.contentSnippet}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
