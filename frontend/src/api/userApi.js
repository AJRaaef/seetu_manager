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

export const submitKyc = async (nicNumber, file, requestedRole = null) => {
  const formData = new FormData();
  formData.append('nicNumber', nicNumber);
  formData.append('file', file);
  if (requestedRole) {
    formData.append('requestedRole', requestedRole);
  }
  const response = await api.post('/users/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getMyKycStatus = async () => {
  const response = await api.get('/users/kyc/status');
  return response.data;
};

export const getPendingKycUsers = async () => {
  const response = await api.get('/users/kyc/pending');
  return response.data;
};

export const getAllMembersWithKyc = async () => {
  const response = await api.get('/users/kyc/members');
  return response.data;
};

export const verifyMemberKyc = async (userId, status, rejectionReason = '', role = null) => {
  const payload = { status, rejectionReason };
  if (role) payload.role = role;
  const response = await api.put(`/users/${userId}/kyc/verify`, payload);
  return response.data;
};
