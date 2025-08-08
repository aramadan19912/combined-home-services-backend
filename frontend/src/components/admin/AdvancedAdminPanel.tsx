import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe, 
  Users, 
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileUploadSize: number;
  defaultUserRole: string;
  sessionTimeout: number;
}

const AdvancedAdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'security' | 'notifications'>('overview');
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    siteName: 'HandyHubConnect',
    siteUrl: 'https://handyhub.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 10,
    defaultUserRole: 'Customer',
    sessionTimeout: 30,
  });

  const [systemStats] = useState({
    totalUsers: 1247,
    activeUsers: 342,
    totalOrders: 2156,
    pendingOrders: 23,
    totalRevenue: 124567,
    systemUptime: '99.9%',
    avgResponseTime: '245ms',
    errorRate: '0.1%',
  });

  const [recentActivities] = useState([
    { id: 1, user: 'John Doe', action: 'Created new order', time: '2 minutes ago', type: 'order' },
    { id: 2, user: 'Admin', action: 'Updated system settings', time: '15 minutes ago', type: 'system' },
    { id: 3, user: 'Jane Smith', action: 'Completed order #1234', time: '1 hour ago', type: 'order' },
    { id: 4, user: 'System', action: 'Backup completed', time: '2 hours ago', type: 'system' },
  ]);

  const [securityLogs] = useState([
    { id: 1, event: 'Failed login attempt', ip: '192.168.1.100', user: 'unknown', time: '10 minutes ago', severity: 'medium' },
    { id: 2, event: 'Password reset', ip: '10.0.0.1', user: 'john@example.com', time: '1 hour ago', severity: 'low' },
    { id: 3, event: 'Admin login', ip: '172.16.0.1', user: 'admin@handyhub.com', time: '2 hours ago', severity: 'info' },
  ]);

  const updateSystemConfig = (key: keyof SystemConfig, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveConfiguration = () => {
    // Mock save - replace with actual API call
    toast({
      title: 'Configuration Saved',
      description: 'System configuration has been updated successfully.',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <FileText className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Admin Panel</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Backup System
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            System Health
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'system', label: 'System Config', icon: Settings },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.activeUsers} active today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.pendingOrders} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
                <p className="text-xs text-muted-foreground">
                  Avg response: {systemStats.avgResponseTime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.errorRate}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">by {activity.user}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Configuration Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Name</label>
                  <Input 
                    value={systemConfig.siteName}
                    onChange={(e) => updateSystemConfig('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Site URL</label>
                  <Input 
                    value={systemConfig.siteUrl}
                    onChange={(e) => updateSystemConfig('siteUrl', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max File Upload Size (MB)</label>
                  <Input 
                    type="number"
                    value={systemConfig.maxFileUploadSize}
                    onChange={(e) => updateSystemConfig('maxFileUploadSize', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input 
                    type="number"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) => updateSystemConfig('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Default User Role</label>
                  <Select 
                    value={systemConfig.defaultUserRole}
                    onValueChange={(value) => updateSystemConfig('defaultUserRole', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Provider">Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button onClick={saveConfiguration}>
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{log.event}</TableCell>
                      <TableCell className="font-mono">{log.ip}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedAdminPanel;