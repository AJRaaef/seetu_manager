import api from './axios';

export const createJoinRequest = async (groupId, userId) => {
  const response = await api.post(`/join-requests?groupId=${groupId}${userId ? `&userId=${userId}` : ''}`);
  return response.data;
};

export const getPendingJoinRequests = async () => {
  const response = await api.get('/join-requests/pending');
  return response.data;
};

export const getJoinRequestsByUser = async (userId) => {
  const response = await api.get(`/join-requests/user/${userId}`);
  return response.data;
};

export const approveJoinRequest = async (id) => {
  const response = await api.put(`/join-requests/${id}/approve`);
  return response.data;
};

export const rejectJoinRequest = async (id) => {
  const response = await api.put(`/join-requests/${id}/reject`);
  return response.data;
};
