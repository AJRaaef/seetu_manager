import api from './axios';

export const createDispute = async (data, raisedById) => {
  const response = await api.post(`/disputes?raisedById=${raisedById}`, data);
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
  const response = await api.put(`/disputes/${id}/status?status=${status}&resolutionNotes=${resolutionNotes || ''}&resolvedById=${resolvedById}`);
  return response.data;
};
