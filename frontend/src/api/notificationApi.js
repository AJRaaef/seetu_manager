import api from './axios';

export const getNotificationsByUser = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`);
  return response.data;
};

export const getUnreadNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}/unread`);
  return response.data;
};

export const getUnreadCount = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}/unread-count`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};
