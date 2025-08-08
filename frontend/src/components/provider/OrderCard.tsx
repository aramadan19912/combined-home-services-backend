import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: {
    id: string;
    customerName: string;
    service: string;
    date: string;
    time: string;
    location: string;
    price: number;
    status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
    description?: string;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onUpdateStatus?: (status: string) => void;
}

export const OrderCard = ({ order, onAccept, onReject, onUpdateStatus }: OrderCardProps) => {
  const { toast } = useToast();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    onUpdateStatus?.(newStatus);
    toast({
      title: "Order updated",
      description: `Order status changed to ${newStatus.replace('-', ' ')}`,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.service}</CardTitle>
          <Badge className={getStatusClass(order.status)}>
            {order.status.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Order #{order.id}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{order.customerName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{order.date}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{order.time}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{order.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="h-4 w-4" />
          <span>${order.price}</span>
        </div>
        
        {order.description && (
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {order.description}
          </p>
        )}
        
        <div className="flex gap-2 pt-2">
          {order.status === 'pending' && (
            <>
              <Button onClick={onAccept} className="flex-1 bg-green-600 hover:bg-green-700">
                Accept
              </Button>
              <Button onClick={onReject} variant="outline" className="flex-1">
                Decline
              </Button>
            </>
          )}
          
          {order.status === 'accepted' && (
            <Button 
              onClick={() => handleStatusUpdate('in-progress')} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Start Work
            </Button>
          )}
          
          {order.status === 'in-progress' && (
            <Button 
              onClick={() => handleStatusUpdate('completed')} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Complete
            </Button>
          )}
          
          {order.status === 'completed' && (
            <Button variant="outline" className="flex-1" disabled>
              Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};