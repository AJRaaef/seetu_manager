import api from './axios';

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUserProfile = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const getUserProfileStats = async (id) => {
  const response = await api.get(`/users/${id}/profile`);
  return response.data;
};
