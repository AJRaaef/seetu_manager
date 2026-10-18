import { useState, useEffect, useCallback } from 'react';
import { getUnreadNotifications, getUnreadCount, markAsRead } from '../api/notificationApi';
import { useAuth } from './useAuth';

export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const targetUserId = user?.userId || user?.id;
    if (targetUserId) {
      try {
        const listRes = await getUnreadNotifications(targetUserId);
        const countRes = await getUnreadCount(targetUserId);
        setNotifications(listRes.data || []);
        setUnreadCount(countRes.data || 0);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // 1. Smart Real-Time Polling: Poll every 10 seconds for live updates
    const interval = setInterval(fetchNotifications, 10000);

    // 2. Reactive Event Listener: Instant wakeup whenever any action dispatches an alert
    const handleImmediateRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('refresh-notifications', handleImmediateRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notifications', handleImmediateRefresh);
    };
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
