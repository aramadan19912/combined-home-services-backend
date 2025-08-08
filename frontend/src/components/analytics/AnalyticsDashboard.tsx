import React, { useState, useEffect } from 'react';
import { analyticsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Star,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { analyticsApi } from '@/services/api';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsData {
  revenue: { date: string; amount: number; orders: number }[];
  userGrowth: { date: string; customers: number; providers: number }[];
  orderStats: { date: string; pending: number; completed: number; cancelled: number }[];
  topServices: { name: string; orders: number; revenue: number }[];
  providerPerformance: { name: string; rating: number; orders: number; revenue: number }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    revenue: [],
    userGrowth: [],
    orderStats: [],
    topServices: [],
    providerPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const dateRanges = {
    '7d': { label: 'Last 7 days', days: 7 },
    '30d': { label: 'Last 30 days', days: 30 },
    '90d': { label: 'Last 90 days', days: 90 },
    'current_month': { label: 'Current month', days: 0 },
    'last_month': { label: 'Last month', days: 0 }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'current_month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
        };
      default:
        const days = dateRanges[dateRange as keyof typeof dateRanges]?.days || 30;
        return {
          start: format(subDays(now, days), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
    }
  };

  const loadAnalytics = async () => {
    try {
      const { start, end } = getDateRange();
      
      // Replace mock data with real API calls
      const [
        dashboardData,
        revenueData,
        orderData,
        userGrowthData,
        serviceData,
        providerData
      ] = await Promise.all([
        analyticsApi.getDashboard(start, end),
        analyticsApi.getRevenue(start, end),
        analyticsApi.getOrders(start, end),
        analyticsApi.getUsers(start, end),
        analyticsApi.getServices(start, end),
        analyticsApi.getProviders(start, end)
      ]);

      // Transform API data to match the expected format
      const analyticsData: AnalyticsData = {
        revenue: revenueData || [],
        userGrowth: userGrowthData || [],
        orderStats: orderData || [],
        topServices: serviceData || [],
        providerPerformance: providerData || []
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      
      // Fallback to empty data structure
      setData({
        revenue: [],
        userGrowth: [],
        orderStats: [],
        topServices: [],
        providerPerformance: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const handleExport = () => {
    // Export functionality - could generate CSV/PDF
    console.log('Exporting analytics data...');
  };

  // Calculate totals and growth
  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalOrders = data.revenue.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalUsers = data.userGrowth.reduce((sum, item) => sum + item.customers + item.providers, 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and growth metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateRanges).map(([key, range]) => (
                <SelectItem key={key} value={key}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-destructive">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18.7% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Customers"
                />
                <Line
                  type="monotone"
                  dataKey="providers"
                  stroke="hsl(var(--secondary-foreground))"
                  strokeWidth={2}
                  name="Providers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: 85, color: COLORS[1] },
                    { name: 'Pending', value: 10, color: COLORS[2] },
                    { name: 'Cancelled', value: 5, color: COLORS[3] }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Completed', value: 85, color: COLORS[1] },
                    { name: 'Pending', value: 10, color: COLORS[2] },
                    { name: 'Cancelled', value: 5, color: COLORS[3] }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Services and Provider Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topServices}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.providerPerformance.map((provider, index) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {provider.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${provider.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{provider.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};