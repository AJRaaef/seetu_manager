import api from './axios';

export const getGroupsByUser = async (userId) => {
  const response = await api.get(`/groups/user/${userId}`);
  return response.data;
};

export const getGroupsByOrganizer = async (organizerId) => {
  const response = await api.get(`/groups/organizer/${organizerId}`);
  return response.data;
};

export const getGroupsByMember = async (memberId) => {
  const response = await api.get(`/groups/member/${memberId}`);
  return response.data;
};

export const getUserGroups = getGroupsByUser;

export const getAllGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getGroupById = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data;
};

export const createGroup = async (data, creatorId) => {
  const response = await api.post(`/groups?creatorId=${creatorId}`, data);
  return response.data;
};

export const updateGroup = async (id, data) => {
  const response = await api.put(`/groups/${id}`, data);
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const addMember = async (groupId, userId) => {
  const response = await api.post(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const removeMember = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const getAllMembers = async () => {
  const response = await api.get('/groups/members');
  return response.data;
};

export const inviteMember = async (groupId, data) => {
  const response = await api.post(`/groups/${groupId}/members/invite`, data);
  return response.data;
};
