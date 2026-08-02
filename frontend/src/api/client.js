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
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};
