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
      
      <ChatWindow />
    </div>
  );
};

export default Home;
