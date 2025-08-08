import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Users, DollarSign, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCustomerDashboard, useProviderDashboard, useAdminDashboard } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  trend = 'neutral' 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            {description && <span className="text-muted-foreground">from last month</span>}
          </div>
        )}
        {description && change === undefined && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface LiveActivityProps {
  activities: Array<{
    id: string;
    type: 'order' | 'payment' | 'review' | 'user';
    message: string;
    timestamp: string;
    status?: 'success' | 'pending' | 'failed';
  }>;
}

const LiveActivity: React.FC<LiveActivityProps> = ({ activities = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Live Activity
        </CardTitle>
        <CardDescription>Real-time platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                    {activity.status && (
                      <Badge 
                        variant={
                          activity.status === 'success' ? 'default' :
                          activity.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const LiveDashboard: React.FC = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use appropriate dashboard hook based on user role
  const { data: customerData, refetch: refetchCustomer } = useCustomerDashboard();
  const { data: providerData, refetch: refetchProvider } = useProviderDashboard();
  const { data: adminData, refetch: refetchAdmin } = useAdminDashboard();

  const data = userRole === 'admin' ? adminData : userRole === 'provider' ? providerData : customerData;
  const refetch = userRole === 'admin' ? refetchAdmin : userRole === 'provider' ? refetchProvider : refetchCustomer;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const renderMetrics = () => {
    if (!data) return null;

    switch (userRole) {
      case 'admin':
        return (
          <>
            <MetricCard
              title="Total Revenue"
              value={`$${(data as any).totalRevenue?.toLocaleString() || '0'}`}
              change={(data as any).revenueChange}
              icon={DollarSign}
              trend={(data as any).revenueChange > 0 ? 'up' : (data as any).revenueChange < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Active Users"
              value={(data as any).activeUsers || '0'}
              change={(data as any).userGrowth}
              icon={Users}
              trend={(data as any).userGrowth > 0 ? 'up' : (data as any).userGrowth < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Total Orders"
              value={(data as any).totalOrders || '0'}
              change={(data as any).orderGrowth}
              icon={Clock}
              trend={(data as any).orderGrowth > 0 ? 'up' : (data as any).orderGrowth < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Platform Rating"
              value={`${(data as any).averageRating || '0'}/5`}
              icon={Star}
              description="Average service rating"
            />
          </>
        );
      case 'provider':
        return (
          <>
            <MetricCard
              title="Monthly Earnings"
              value={`$${(data as any).monthlyEarnings?.toLocaleString() || '0'}`}
              change={(data as any).earningsChange}
              icon={DollarSign}
              trend={(data as any).earningsChange > 0 ? 'up' : (data as any).earningsChange < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Pending Orders"
              value={(data as any).pendingOrders || '0'}
              icon={Clock}
              description="Orders awaiting response"
            />
            <MetricCard
              title="Completed Orders"
              value={(data as any).completedOrders || '0'}
              change={(data as any).orderGrowth}
              icon={Users}
              trend={(data as any).orderGrowth > 0 ? 'up' : (data as any).orderGrowth < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Your Rating"
              value={`${(data as any).rating || '0'}/5`}
              icon={Star}
              description="Customer satisfaction"
            />
          </>
        );
      default:
        return (
          <>
            <MetricCard
              title="Active Orders"
              value={(data as any).activeOrders || '0'}
              icon={Clock}
              description="Orders in progress"
            />
            <MetricCard
              title="Completed Orders"
              value={(data as any).completedOrders || '0'}
              change={(data as any).orderGrowth}
              icon={Users}
              trend={(data as any).orderGrowth > 0 ? 'up' : (data as any).orderGrowth < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Total Spent"
              value={`$${(data as any).totalSpent?.toLocaleString() || '0'}`}
              change={(data as any).spendingChange}
              icon={DollarSign}
              trend={(data as any).spendingChange > 0 ? 'up' : (data as any).spendingChange < 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              title="Saved Amount"
              value={`$${(data as any).savedAmount?.toLocaleString() || '0'}`}
              icon={Star}
              description="Through platform discounts"
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time updates • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetrics()}
      </div>

      {/* Live Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <LiveActivity activities={(data as any)?.recentActivity || []} />
        
        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Completion Rate</span>
                  <span>{(data as any)?.completionRate || 95}%</span>
                </div>
                <Progress value={(data as any)?.completionRate || 95} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Customer Satisfaction</span>
                  <span>{(data as any)?.satisfactionRate || 88}%</span>
                </div>
                <Progress value={(data as any)?.satisfactionRate || 88} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                  <span>{(data as any)?.responseTime || 12} min avg</span>
                </div>
                <Progress value={75} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};