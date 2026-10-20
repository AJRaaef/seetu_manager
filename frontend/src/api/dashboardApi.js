import api from './axios';

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

export const getUserDashboard = async (userId) => {
  const response = await api.get(`/dashboard/user/${userId}`);
  return response.data;
};
