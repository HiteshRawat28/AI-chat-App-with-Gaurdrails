import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-content">
      <header className="app-header">
        <div className="app-brand" style={{ gap: '0.75rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#primaryGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-color)" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2v-6c0-1.1.9-2 2-2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6 10c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2s-2-.9-2-2v-2c0-1.1.9-2 2-2zm12 0c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2s-2-.9-2-2v-2c0-1.1.9-2 2-2z"/>
          </svg>
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary-color), #818cf8)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            AI Chat with Guardrails
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.email === 'admin@example.com' && (
            <button onClick={() => navigate('/admin')} className="btn" style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(79, 70, 229, 0.1)', 
              color: 'var(--primary-color)', 
              border: '1px solid rgba(79, 70, 229, 0.2)',
              fontSize: '0.875rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                Admin Logs
              </span>
            </button>
          )}
          <span style={{ fontSize: '0.875rem' }}>{user?.email}</span>
          <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
            Logout
          </button>
        </div>
      </header>
      
      <ChatWindow />
    </div>
  );
};

export default Home;
