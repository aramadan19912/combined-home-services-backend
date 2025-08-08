import React from 'react';
import { Header } from '@/components/layout/Header';
import { PushNotificationSettings } from '@/components/mobile/PushNotificationSettings';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const Settings: React.FC = () => {
  const { getStorageInfo, isOnline } = useOfflineStorage();
  const info = getStorageInfo();

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <PushNotificationSettings />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offline Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Connection</span>
                <Badge variant={isOnline ? 'secondary' : 'destructive'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Cached size</span>
                <span className="text-muted-foreground">{info.size} KB</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Items cached</span>
                <span className="text-muted-foreground">{info.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last sync</span>
                <span className="text-muted-foreground">{info.lastSync || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <InstallPrompt />
    </div>
  );
};

export default Settings;