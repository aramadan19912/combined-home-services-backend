import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export const PushNotificationSettings: React.FC = () => {
  const { permission, token, requestPermission, scheduleLocalNotification } = usePushNotifications();
  const [notificationPreferences, setNotificationPreferences] = useState({
    newBookings: true,
    orderUpdates: true,
    paymentReminders: true,
    promotions: false,
    systemAlerts: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      setNotificationPreferences(JSON.parse(saved));
    }
  }, []);

  const savePreferences = (newPreferences: typeof notificationPreferences) => {
    setNotificationPreferences(newPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences));
  };

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You'll now receive push notifications for important updates",
      });
    }
  };

  const testNotification = async () => {
    await scheduleLocalNotification(
      "Test Notification",
      "This is a test notification to verify your settings are working correctly!",
      1000
    );
  };

  const togglePreference = (key: keyof typeof notificationPreferences) => {
    const newPreferences = {
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    };
    savePreferences(newPreferences);
  };

  const getPermissionStatus = () => {
    if (permission.granted) return { status: 'granted', color: 'green', icon: CheckCircle };
    if (permission.denied) return { status: 'denied', color: 'red', icon: AlertTriangle };
    return { status: 'prompt', color: 'yellow', icon: Bell };
  };

  const permissionStatus = getPermissionStatus();
  const StatusIcon = permissionStatus.icon;

  const notificationTypes = [
    {
      key: 'newBookings' as const,
      title: 'New Bookings',
      description: 'Get notified when you receive new service requests',
    },
    {
      key: 'orderUpdates' as const,
      title: 'Order Updates',
      description: 'Receive updates about your active bookings and services',
    },
    {
      key: 'paymentReminders' as const,
      title: 'Payment Reminders',
      description: 'Reminders for pending payments and invoices',
    },
    {
      key: 'promotions' as const,
      title: 'Promotions & Offers',
      description: 'Special deals and promotional notifications',
    },
    {
      key: 'systemAlerts' as const,
      title: 'System Alerts',
      description: 'Important system updates and maintenance notices',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notification Status
          </CardTitle>
          <CardDescription>
            Manage your push notification permissions and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 text-${permissionStatus.color}-500`} />
              <div>
                <h4 className="font-medium">Permission Status</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {permissionStatus.status === 'granted' && 'Notifications enabled'}
                  {permissionStatus.status === 'denied' && 'Notifications blocked'}
                  {permissionStatus.status === 'prompt' && 'Permission required'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={permissionStatus.status === 'granted' ? 'default' : 'destructive'}
                className={`bg-${permissionStatus.color}-100 text-${permissionStatus.color}-800`}
              >
                {permissionStatus.status}
              </Badge>
              {!permission.granted && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePermissionRequest}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>

          {token && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Device successfully registered for push notifications
              </AlertDescription>
            </Alert>
          )}

          {permission.granted && (
            <Button 
              variant="outline" 
              onClick={testNotification}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test Notification
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {permission.granted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{type.title}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <Switch
                  checked={notificationPreferences[type.key]}
                  onCheckedChange={() => togglePreference(type.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting */}
      {permission.denied && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Notifications Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertDescription>
                Notifications are currently blocked. To enable them:
                <br />
                1. Go to your browser settings
                <br />
                2. Find notification permissions for this site
                <br />
                3. Change from "Block" to "Allow"
                <br />
                4. Refresh the page and try again
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};