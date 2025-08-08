import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  HardDrive, 
  Wifi,
  RefreshCw
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: number;
}

export const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', threshold: 80 },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'healthy', threshold: 85 },
    { name: 'Disk Usage', value: 34, unit: '%', status: 'healthy', threshold: 90 },
    { name: 'Network I/O', value: 12, unit: 'MB/s', status: 'healthy', threshold: 100 },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', status: 'online', uptime: '99.9%', responseTime: 120 },
    { name: 'Database', status: 'online', uptime: '99.8%', responseTime: 45 },
    { name: 'Payment Service', status: 'online', uptime: '99.7%', responseTime: 200 },
    { name: 'Notification Service', status: 'degraded', uptime: '98.5%', responseTime: 800 },
    { name: 'File Storage', status: 'online', uptime: '99.9%', responseTime: 90 },
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate metric updates
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
      status: metric.value > metric.threshold ? 'critical' : 
              metric.value > metric.threshold * 0.8 ? 'warning' : 'healthy'
    })));

    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center gap-1">
                {getStatusIcon(metric.status)}
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value.toFixed(1)}{metric.unit}
              </div>
              <Progress 
                value={metric.value} 
                className="mt-2"
                max={metric.threshold}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Threshold: {metric.threshold}{metric.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime} • Response: {service.responseTime}ms
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Normal</div>
            <p className="text-xs text-muted-foreground">
              All systems operating normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Incident</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3d ago</div>
            <p className="text-xs text-muted-foreground">
              Database connection timeout
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Last updated: {lastUpdated.toLocaleString()}
      </p>
    </div>
  );
};