import api from './axios';

export const getAllDisputes = async () => {
  const response = await api.get('/disputes');
  return response.data;
};

export const createDispute = async (data, raisedById) => {
  const url = raisedById ? `/disputes?raisedById=${raisedById}` : '/disputes';
  const response = await api.post(url, data);
  return response.data;
};

export const getDisputesByGroup = async (groupId) => {
  const response = await api.get(`/disputes/group/${groupId}`);
  return response.data;
};

export const getDisputesByUser = async (userId) => {
  const response = await api.get(`/disputes/user/${userId}`);
  return response.data;
};

export const updateDisputeStatus = async (id, status, resolutionNotes, resolvedById) => {
  let url = `/disputes/${id}/status?status=${status}&resolutionNotes=${encodeURIComponent(resolutionNotes || '')}`;
  if (resolvedById) {
    url += `&resolvedById=${resolvedById}`;
  }
  const response = await api.put(url);
  return response.data;
};
