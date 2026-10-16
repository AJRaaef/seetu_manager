import api from './axios';

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const applyOrganizer = async (data) => {
  const response = await api.post('/auth/apply-organizer', data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post(`/auth/forgot-password?email=${email}`);
  return response.data;
};

export const resetPassword = async (email, newPassword) => {
  const response = await api.post(`/auth/reset-password?email=${email}&newPassword=${newPassword}`);
  return response.data;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await api.post(`/auth/change-password?userId=${userId}&currentPassword=${currentPassword}&newPassword=${newPassword}`);
  return response.data;
};
