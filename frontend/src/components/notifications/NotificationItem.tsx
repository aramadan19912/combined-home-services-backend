import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  Star, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    userId?: string;
    bookingId?: string;
    amount?: number;
    rating?: number;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'system':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reminder':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${getTypeColor()}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {notification.type}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                
                {notification.metadata?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{notification.metadata.rating}/5</span>
                  </div>
                )}
                
                {notification.metadata?.amount && (
                  <span className="font-medium">
                    ${notification.metadata.amount.toFixed(2)}
                  </span>
                )}
              </div>
              
              {notification.actionUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2"
                  onClick={() => onAction?.(notification)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8 w-8 p-0"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;