import api from './axios';

export const recordPayment = async (data, recorderId) => {
  const response = await api.post(`/payments?recorderId=${recorderId}`, data);
  return response.data;
};

export const getPaymentsByGroup = async (groupId) => {
  const response = await api.get(`/payments/group/${groupId}`);
  return response.data;
};

export const getPaymentsByMember = async (memberId) => {
  const response = await api.get(`/payments/member/${memberId}`);
  return response.data;
};

export const recordAdvancePayment = async (memberId, amount, notes) => {
  const response = await api.post(`/advance-payments?memberId=${memberId}&amount=${amount}&notes=${notes || ''}`);
  return response.data;
};

export const getAdvancePayments = async (memberId) => {
  const response = await api.get(`/advance-payments/member/${memberId}`);
  return response.data;
};

export const getPaymentCyclesByGroup = async (groupId) => {
  const response = await api.get(`/payment-cycles/group/${groupId}`);
  return response.data;
};
