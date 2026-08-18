import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadNotifications,
        markRead,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
