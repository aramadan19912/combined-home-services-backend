import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/admin/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, ClipboardList, AlertTriangle, TrendingUp, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardsApi } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/i18n-format";

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ['adminDashboard'], queryFn: dashboardsApi.getAdminDashboard });

  const platformMetrics = [
    {
      title: "Total Users",
      value: isLoading ? '—' : (data?.totalUsers?.toLocaleString() ?? '0'),
      icon: <Users className="h-5 w-5" />,
      description: "All registered users"
    },
    {
      title: "Total Orders",
      value: isLoading ? '—' : (data?.totalOrders?.toLocaleString() ?? '0'),
      icon: <ClipboardList className="h-5 w-5" />,
      description: "All-time orders"
    },
    {
      title: "Total Revenue",
      value: isLoading ? '—' : formatCurrency(data?.totalRevenue ?? 0),
      icon: <DollarSign className="h-5 w-5" />,
      description: "All-time revenue"
    },
    {
      title: "Pending Approvals",
      value: isLoading ? '—' : String(data?.pendingApprovals ?? 0),
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Providers awaiting approval"
    },
    {
      title: "Active Complaints",
      value: isLoading ? '—' : String(data?.activeComplaints ?? 0),
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Currently open"
    },
    {
      title: "System Health",
      value: isLoading ? '—' : (data?.systemHealth ?? 'Unknown'),
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Overall status"
    },
  ];

  const revenueData = [
    { month: "Jul", revenue: 180000 },
    { month: "Aug", revenue: 195000 },
    { month: "Sep", revenue: 210000 },
    { month: "Oct", revenue: 225000 },
    { month: "Nov", revenue: 235000 },
    { month: "Dec", revenue: 247000 }
  ];

  const serviceCategories = [
    { name: "Cleaning", value: 45, color: "hsl(var(--primary))" },
    { name: "Plumbing", value: 20, color: "hsl(var(--success))" },
    { name: "Electrical", value: 15, color: "hsl(var(--warning))" },
    { name: "Gardening", value: 12, color: "hsl(var(--accent))" },
    { name: "Other", value: 8, color: "hsl(var(--muted-foreground))" }
  ];

  const userGrowthData = [
    { month: "Jul", customers: 4200, providers: 7400 },
    { month: "Aug", customers: 4350, providers: 7550 },
    { month: "Sep", customers: 4500, providers: 7700 },
    { month: "Oct", customers: 4620, providers: 7820 },
    { month: "Nov", customers: 4750, providers: 7950 },
    { month: "Dec", customers: 4821, providers: 8026 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_signup",
      message: "New provider John Smith registered",
      time: "5 min ago",
      status: "success"
    },
    {
      id: 2,
      type: "dispute",
      message: "Dispute filed for order #ORD-1247",
      time: "12 min ago",
      status: "warning"
    },
    {
      id: 3,
      type: "payout",
      message: "Payout processed: $4,250 to 15 providers",
      time: "1 hour ago",
      status: "success"
    },
    {
      id: 4,
      type: "review",
      message: "New 5-star review for CleanPro Services",
      time: "2 hours ago",
      status: "success"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userType="admin" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Platform Overview</h1>
          <p className="text-muted-foreground">Monitor platform performance and key metrics.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {platformMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              description={metric.description}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="dashboard-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Platform Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Service Categories Chart */}
          <Card className="dashboard-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Service Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {serviceCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Share']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div>
            <Card className="dashboard-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Activities</h3>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-success' : 
                        activity.status === 'warning' ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="dashboard-card mt-6">
              <div className="p-6">
                <h3 className="font-semibold mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">API Latency</span>
                    <span className="text-sm font-medium">142 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium text-success">0.21%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Services Status</span>
                    <span className="text-sm font-medium"><span className="inline-block w-2 h-2 rounded-full bg-success mr-2"/> All systems operational</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Registrations */}
            <Card className="dashboard-card mt-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Registrations</h3>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Aisha Al-Zahrani', role: 'Provider' },
                    { name: 'Omar Ali', role: 'Customer' },
                    { name: 'Fatima Noor', role: 'Provider' },
                  ].map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="dashboard-card mt-6">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full btn-hero">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Disputes
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;