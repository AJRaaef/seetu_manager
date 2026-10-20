import api from './axios';

export const getAllAuditLogs = async () => {
  const response = await api.get('/audit-logs');
  return response.data;
};

export const getPaymentAuditLogs = async () => {
  const response = await api.get('/audit-logs/payments');
  return response.data;
};

export const getAuditLogsByUser = async (userId) => {
  const response = await api.get(`/audit-logs/user/${userId}`);
  return response.data;
};
