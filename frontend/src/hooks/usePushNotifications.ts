import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>({
    granted: false,
    denied: false,
    prompt: true,
  });
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      
      setPermission({
        granted: permResult.receive === 'granted',
        denied: permResult.receive === 'denied',
        prompt: permResult.receive === 'prompt',
      });

      if (permResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
      }

      // Add listeners
      PushNotifications.addListener('registration', (token: Token) => {
        setToken(token.value);
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast({
          title: "Push Notification Error",
          description: "Failed to register for push notifications",
          variant: "destructive",
        });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show local notification
        toast({
          title: notification.title || "New Notification",
          description: notification.body || "You have a new message",
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed: ', notification.actionId, notification.inputValue);
        
        // Handle notification tap
        if (notification.actionId === 'tap') {
          // Navigate to relevant screen based on notification data
          console.log('User tapped notification:', notification.notification);
        }
      });

    } catch (error) {
      console.error('Push notification initialization error:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await PushNotifications.requestPermissions();
      setPermission({
        granted: result.receive === 'granted',
        denied: result.receive === 'denied',
        prompt: result.receive === 'prompt',
      });
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for important updates",
        });
      }
      
      return result.receive === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, delay: number = 0) => {
    // For local notifications, we would typically use the Local Notifications plugin
    // For now, we'll just show a toast as a fallback
    setTimeout(() => {
      toast({
        title,
        description: body,
      });
    }, delay);
  };

  return {
    permission,
    token,
    requestPermission,
    scheduleLocalNotification,
    isSupported: () => 'PushNotifications' in window,
  };
};