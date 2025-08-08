import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, Star, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardsApi } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/i18n-format";
import { useAuth } from "@/contexts/AuthContext";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['providerDashboard'], queryFn: dashboardsApi.getProviderDashboard });

  const stats = [
    {
      title: "Total Earnings",
      value: isLoading ? '—' : formatCurrency(data?.totalEarnings ?? 0),
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: "Pending Requests",
      value: isLoading ? '—' : String(data?.pendingRequests ?? 0),
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "This Month",
      value: isLoading ? '—' : formatCurrency(data?.monthlyEarnings ?? 0),
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "Rating",
      value: isLoading ? '—' : String((data?.averageRating ?? 0).toFixed(1)),
      icon: <Star className="h-5 w-5" />
    }
  ];

  // Earnings chart demo data (replace with real endpoint if available)
  const earningsData = [
    { day: 'Mon', amount: 220 },
    { day: 'Tue', amount: 180 },
    { day: 'Wed', amount: 260 },
    { day: 'Thu', amount: 300 },
    { day: 'Fri', amount: 280 },
    { day: 'Sat', amount: 340 },
    { day: 'Sun', amount: 210 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userType="provider" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.fullName || 'Provider'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your services today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="dashboard-card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <div className="text-primary">{stat.icon}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Earnings Overview */}
        <Card className="dashboard-card mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Earnings Overview</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `$${v}`}/>
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Earnings']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Today's Schedule</h2>
            </div>
            <div className="space-y-4">
              {(data?.todaysSchedule ?? []).map((o) => (
                <Card key={o.id} className="dashboard-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{o.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">{o.customerName}</p>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(o.totalAmount || 0)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <span>{o.scheduledDate}</span>
                      <span>{o.scheduledTime || '-'}</span>
                      <span>{o.address}</span>
                    </div>
                  </div>
                </Card>
              ))}
              {isLoading && (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              )}
            </div>
          </div>

          {/* Quick Actions and Reviews */}
          <div>
            {/* Quick Actions */}
            <Card className="dashboard-card mb-6">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full btn-hero">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Availability
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    View Reviews
                  </Button>
                  <Button variant="outline" className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Earnings Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Reviews */}
            <Card className="dashboard-card">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {(data?.recentReviews ?? []).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{r.customerName}</p>
                        <span className="text-sm">⭐ {r.rating}</span>
                      </div>
                      {r.serviceName && (
                        <p className="text-xs text-muted-foreground mt-1">{r.serviceName}</p>
                      )}
                    </div>
                  ))}
                  {isLoading && <Skeleton className="h-20 w-full" />}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;