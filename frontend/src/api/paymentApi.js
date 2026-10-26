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
  const response = await api.get(`/payments/member/${memberId}/pending-dues`);
  return response.data;
};

export const recordAdvancePayment = async (memberId, amount, notes) => {
  const response = await api.post(`/advance-payments?memberId=${memberId}&amount=${amount}&notes=${notes || ''}`);
  return response.data;
};

export const getAdvancePayments = async (memberId) => {
  const response = await api.get(`/advance-payments/user/${memberId}`);
  return response.data;
};

export const getAllAdvancePayments = async () => {
  const response = await api.get('/advance-payments');
  return response.data;
};

export const getPaymentCyclesByGroup = async (groupId) => {
  const response = await api.get(`/payment-cycles/group/${groupId}`);
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const updatePayment = async (paymentId, data) => {
  const response = await api.put(`/payments/${paymentId}`, data);
  return response.data;
};

export const deletePayment = async (paymentId) => {
  const response = await api.delete(`/payments/${paymentId}`);
  return response.data;
};

export const uploadPaymentEvidence = async (paymentId, fileOrPath) => {
  if (fileOrPath instanceof File || (fileOrPath && typeof fileOrPath === 'object' && fileOrPath.name)) {
    const formData = new FormData();
    formData.append('file', fileOrPath);
    const response = await api.post(`/payments/${paymentId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
  const filePath = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath?.filePath;
  const response = await api.post(`/payments/${paymentId}/evidence`, { filePath });
  return response.data;
};

export const getPaymentEvidences = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}/evidence`);
  return response.data;
};

export const triggerPaymentReminders = async () => {
  const response = await api.post('/payments/send-reminders');
  return response.data;
};


export const getMyPendingDues = async () => {
  const response = await api.get('/payments/my-pending-dues');
  return response.data;
};

export const getMemberPendingDues = async (memberId) => {
  const response = await api.get(`/payments/member/${memberId}/pending-dues`);
  return response.data;
};
