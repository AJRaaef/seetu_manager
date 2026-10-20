import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext();

const normalizeUser = (userData) => {
  if (!userData) return null;
  const id = userData.id || userData.userId;
  return {
    ...userData,
    id,
    userId: id
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const rawUserData = JSON.parse(localStorage.getItem('user'));
        if (rawUserData) {
          const userData = normalizeUser(rawUserData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
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
    const { token, ...rawUserData } = data.data;
    const userData = normalizeUser(rawUserData);
    setToken(token);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (details) => {
    const data = await authApi.register(details);
    const { token, ...rawUserData } = data.data;
    const userData = normalizeUser(rawUserData);
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
    const newUser = normalizeUser({ ...user, ...updatedData });
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isMember = user?.role === 'MEMBER';
  const isVerified = user?.kycStatus === 'VERIFIED';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin, isOrganizer, isMember, isVerified }}>
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
