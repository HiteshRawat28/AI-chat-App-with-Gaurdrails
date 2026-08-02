import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <div className="app-brand">
          🤖 AI Chat with Guardrails
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{user?.email}</span>
          <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Logout
          </button>
        </div>
      </header>
      
      <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Phase 3</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
          Authentication is working! You are logged in as {user?.email}.
          <br /><br />
          In the next phase, we will implement the core chat interface here.
        </p>
      </div>
    </div>
  );
};

export default Home;
