import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineAction {
  id: string;
  type: 'booking' | 'review' | 'payment' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

export const OfflineSupport: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Service Booking',
      description: 'Plumbing service for kitchen sink',
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    },
    {
      id: '2', 
      type: 'review',
      title: 'Service Review',
      description: 'Rating and feedback for cleaning service',
      timestamp: new Date().toISOString(),
      status: 'failed',
      retryCount: 2
    }
  ]);
  const [syncingAll, setSyncingAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You're back online. Syncing pending changes...",
      });
      handleSyncAll();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Changes will be saved and synced when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncAll = async () => {
    if (!isOnline) {
      toast({
        title: "No connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setSyncingAll(true);
    
    for (const action of pendingActions.filter(a => a.status === 'pending' || a.status === 'failed')) {
      await handleSyncAction(action.id);
    }
    
    setSyncingAll(false);
  };

  const handleSyncAction = async (actionId: string) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'syncing' as const }
          : action
      )
    );

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure
      const success = Math.random() > 0.3;
      
      if (success) {
        setPendingActions(prev => 
          prev.map(action => 
            action.id === actionId 
              ? { ...action, status: 'synced' as const }
              : action
          )
        );
        toast({
          title: "Sync successful",
          description: "Action has been synchronized.",
        });
      } else {
        setPendingActions(prev => 
          prev.map(action => 
            action.id === actionId 
              ? { 
                  ...action, 
                  status: 'failed' as const, 
                  retryCount: action.retryCount + 1 
                }
              : action
          )
        );
        toast({
          title: "Sync failed",
          description: "Failed to sync action. Will retry automatically.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setPendingActions(prev => 
        prev.map(action => 
          action.id === actionId 
            ? { 
                ...action, 
                status: 'failed' as const, 
                retryCount: action.retryCount + 1 
              }
            : action
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800">Syncing</Badge>;
      case 'synced':
        return <Badge className="bg-green-100 text-green-800">Synced</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingCount = pendingActions.filter(a => a.status === 'pending' || a.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isOnline ? 'text-green-800' : 'text-red-800'}>
            {isOnline ? 'Connected to internet' : 'No internet connection - working offline'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Offline Actions
              </CardTitle>
              <CardDescription>
                Actions saved while offline will sync automatically when connected
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <Button 
                onClick={handleSyncAll}
                disabled={!isOnline || syncingAll}
                size="sm"
              >
                {syncingAll ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Sync All ({pendingCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All actions are synced</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(action.status)}
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(action.timestamp).toLocaleString()}
                        {action.retryCount > 0 && ` • ${action.retryCount} retries`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(action.status)}
                    {(action.status === 'pending' || action.status === 'failed') && isOnline && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAction(action.id)}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Offline Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Available Offline:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View your bookings and history</li>
                <li>• Browse cached service providers</li>
                <li>• Create new bookings (will sync later)</li>
                <li>• Write reviews and messages</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Requires Connection:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time order tracking</li>
                <li>• Live chat with providers</li>
                <li>• Payment processing</li>
                <li>• Map and location services</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};