import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/services/api';
import { Notification, TestNotificationDto, NotificationContentDto } from '@/types/api';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
  reminder: boolean;
}

export interface UseNotificationsProps {
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const useNotifications = ({ 
  enablePolling = false, 
  pollingInterval = 30000 
}: UseNotificationsProps = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    marketing: false,
    reminder: true,
  });

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const notificationData = await notificationsApi.getNotifications();
      setNotifications(notificationData);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up polling if enabled
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notif => notificationsApi.markAsRead(notif.id))
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
    }
  }, [notifications]);

  // Send test notification (for testing purposes)
  const sendTestNotification = useCallback(async (testData: TestNotificationDto) => {
    try {
      await notificationsApi.testNotification(testData);
      // Reload notifications to show the test notification
      await loadNotifications();
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
    }
  }, [loadNotifications]);

  // Send notification to current user
  const sendNotificationToMe = useCallback(async (contentData: NotificationContentDto) => {
    try {
      await notificationsApi.sendToMe(contentData);
      // Reload notifications to show the new notification
      await loadNotifications();
    } catch (err) {
      console.error('Failed to send notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  }, [loadNotifications]);

  // Get unread notifications
  const unreadNotifications = notifications.filter(notif => !notif.isRead);
  
  // Get notifications by type
  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  // Get recent notifications (last 7 days)
  const getRecentNotifications = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return notifications.filter(notif => 
      new Date(notif.createdAt) > sevenDaysAgo
    );
  }, [notifications]);

  // Clear all notifications (if you want to implement this feature)
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    loading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    sendNotificationToMe,
    getNotificationsByType,
    getRecentNotifications,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
    setSettings,
  };
};