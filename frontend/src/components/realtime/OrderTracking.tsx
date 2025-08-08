import React from 'react';
import { CheckCircle, Clock, MapPin, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface OrderTrackingProps {
  order: {
    id: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    service: {
      name: string;
      category: string;
    };
    provider?: {
      id: string;
      name: string;
      avatar?: string;
      phone?: string;
      rating: number;
    };
    scheduledDate: string;
    scheduledTime: string;
    address: string;
    estimatedDuration: number;
    progress?: number;
    updates: Array<{
      id: string;
      status: string;
      message: string;
      timestamp: string;
    }>;
  };
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-500', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-green-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: Clock },
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order }) => {
  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  const getStepStatus = (step: string) => {
    const steps = ['pending', 'accepted', 'in_progress', 'completed'];
    const currentIndex = steps.indexOf(order.status);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  const trackingSteps = [
    { key: 'pending', label: 'Order Placed', description: 'Your service request has been submitted' },
    { key: 'accepted', label: 'Provider Assigned', description: 'A service provider has been assigned' },
    { key: 'in_progress', label: 'Service Started', description: 'Provider is on the way or working' },
    { key: 'completed', label: 'Service Completed', description: 'Service has been completed successfully' },
  ];

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              Order #{order.id.slice(-8)}
            </CardTitle>
            <Badge variant="secondary" className={`${currentStatus.color} text-white`}>
              {currentStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Service Details</h4>
              <p className="text-sm text-muted-foreground">{order.service.name}</p>
              <p className="text-xs text-muted-foreground">{order.service.category}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Scheduled</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.scheduledDate), 'MMM d, yyyy')} at {order.scheduledTime}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {order.address}
          </div>
        </CardContent>
      </Card>

      {/* Provider Info */}
      {order.provider && (
        <Card>
          <CardHeader>
            <CardTitle>Service Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={order.provider.avatar} />
                  <AvatarFallback>
                    {order.provider.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.provider.name}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(order.provider.rating))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({order.provider.rating})
                    </span>
                  </div>
                </div>
              </div>
              {order.provider.phone && (
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => {
              const stepStatus = getStepStatus(step.key);
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepStatus === 'completed'
                          ? 'bg-green-500 text-white'
                          : stepStatus === 'current'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepStatus === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-2 ${
                          stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4
                      className={`font-medium ${
                        stepStatus === 'current' ? 'text-blue-600' : ''
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      {order.updates && order.updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.updates.map((update, index) => (
                <div key={update.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{update.status}</p>
                      <p className="text-sm text-muted-foreground">{update.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(update.timestamp), 'h:mm a')}
                    </span>
                  </div>
                  {index < order.updates.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};