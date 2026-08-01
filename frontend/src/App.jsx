import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI Chat App with Guardrails</h1>
      <h2>Backend Health Check</h2>
      {error ? (
        <p style={{ color: 'red' }}>Error connecting to backend: {error}</p>
      ) : health ? (
        <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        <p>Loading backend status...</p>
      )}
    </div>
  )
}

export default App
