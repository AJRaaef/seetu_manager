import { useState, useEffect, useCallback } from 'react';
import { getUnreadNotifications, getUnreadCount, markAsRead } from '../api/notificationApi';
import { useAuth } from './useAuth';

export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (user) {
      try {
        const listRes = await getUnreadNotifications(user.userId);
        const countRes = await getUnreadCount(user.userId);
        setNotifications(listRes.data || []);
        setUnreadCount(countRes.data || 0);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const readNotification = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return { notifications, unreadCount, readNotification, refreshNotifications: fetchNotifications };
};
