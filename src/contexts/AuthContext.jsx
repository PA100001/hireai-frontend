import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import * as profileService from '../services/profileService'; // To get current user on load

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // Initial loading state

  const fetchCurrentUser = useCallback(async () => {
    if (token) {
      localStorage.setItem('authToken', token); // Ensure it's set if passed
      try {
        setLoading(true);
        const response = await profileService.getCurrentUser();
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.removeItem('authToken');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const response = await authService.loginUser(credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('authToken', response.data.token);
    return response.data; // return full user data for immediate use
  };

  const register = async (userData) => {
    const response = await authService.registerUser(userData);
    setToken(response.data.token); // Assuming API returns token directly on register success under 'token'
    setUser(response.data.user);
    localStorage.setItem('authToken', response.token);
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    // Optionally: Call a backend logout endpoint if it exists
  };

  const updateUserContext = (updatedUserData) => {
    setUser(prevUser => ({...prevUser, ...updatedUserData, profile: {...prevUser.profile, ...updatedUserData.profile}}));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token && !!user, updateUserContext, refetchUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;