import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const res = await axios.post(
          `${API_URL}/auth/getuser`,
          {},
          { headers: { 'auth-token': token } }
        );
        if (res.data.success) {
          setUser(res.data.user);
          setAuthError(null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err.response?.status, err.response?.data?.message);
        // If 401, token is invalid - user should log out
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setAuthError('Session expired. Please log in again.');
        }
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const value = React.useMemo(() => ({ user, setUser, authError }), [user, authError]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
