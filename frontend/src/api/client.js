export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`http://localhost:3000/api${endpoint}`, config);
  
  const data = await response.json();
  
  if (!response.ok) {
    if (data.blocked) {
      // Throw a specific error object we can identify in the UI
      const error = new Error('Blocked by guardrail');
      error.isGuardrail = true;
      error.reason = data.reason;
      throw error;
    }
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};
