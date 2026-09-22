import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUser(userData);
        } else {
          setToken(null);
          localStorage.removeItem('token');
        }
      } catch (e) {
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const { token, ...userData } = data.data;
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (details) => {
    const data = await authApi.register(details);
    const { token, ...userData } = data.data;
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isMember = user?.role === 'MEMBER';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin, isOrganizer, isMember }}>
      {children}
    </AuthContext.Provider>
  );
};export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
