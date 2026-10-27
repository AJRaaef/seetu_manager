import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';
import { getMyKycStatus } from '../api/userApi';

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

  const refreshUser = async () => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) return null;
    try {
      const res = await getMyKycStatus();
      if (res?.data) {
        const freshData = res.data;
        setUser((prev) => {
          const base = prev || JSON.parse(localStorage.getItem('user')) || {};
          const updated = normalizeUser({
            ...base,
            ...freshData,
            id: freshData.id || base.id,
            userId: freshData.id || base.userId,
            kycStatus: freshData.kycStatus || base.kycStatus,
            role: freshData.role || base.role
          });
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
        return freshData;
      }
    } catch (e) {
      // Background sync silent catch
    }
    return null;
  };

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

      // Sync latest KYC and profile status from database
      refreshUser();
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const { token: receivedToken, ...rawUserData } = data.data;
    const userData = normalizeUser(rawUserData);
    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // Immediately fetch freshest KYC & verification state
    try {
      const kycRes = await getMyKycStatus();
      if (kycRes?.data) {
        const freshUser = normalizeUser({
          ...userData,
          ...kycRes.data,
          id: kycRes.data.id || userData.id,
          userId: kycRes.data.id || userData.userId
        });
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (e) {}

    return userData;
  };

  const register = async (details) => {
    const data = await authApi.register(details);
    const { token: receivedToken, ...rawUserData } = data.data;
    const userData = normalizeUser(rawUserData);
    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('token', receivedToken);
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
    setUser((prev) => {
      const base = prev || JSON.parse(localStorage.getItem('user')) || {};
      const newUser = normalizeUser({ ...base, ...updatedData });
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isMember = user?.role === 'MEMBER';
  const isVerified = user?.kycStatus === 'VERIFIED';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, refreshUser, isAdmin, isOrganizer, isMember, isVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
