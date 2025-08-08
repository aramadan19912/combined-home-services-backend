import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const ProviderEarnings = () => {
  const weeklyData = [
    { day: "Mon", earnings: 120 },
    { day: "Tue", earnings: 180 },
    { day: "Wed", earnings: 95 },
    { day: "Thu", earnings: 240 },
    { day: "Fri", earnings: 165 },
    { day: "Sat", earnings: 320 },
    { day: "Sun", earnings: 280 }
  ];

  const monthlyData = [
    { month: "Aug", earnings: 2400 },
    { month: "Sep", earnings: 2800 },
    { month: "Oct", earnings: 3200 },
    { month: "Nov", earnings: 2900 },
    { month: "Dec", earnings: 3400 }
  ];

  const recentTransactions = [
    {
      id: "TXN-001",
      date: "Dec 15, 2024",
      service: "House Cleaning",
      customer: "Sarah Johnson",
      amount: 89,
      fee: 8.90,
      net: 80.10,
      status: "completed"
    },
    {
      id: "TXN-002",
      date: "Dec 14, 2024", 
      service: "Deep Cleaning",
      customer: "Mike Chen",
      amount: 150,
      fee: 15.00,
      net: 135.00,
      status: "completed"
    },
    {
      id: "TXN-003",
      date: "Dec 13, 2024",
      service: "Bathroom Cleaning",
      customer: "Lisa Rodriguez", 
      amount: 75,
      fee: 7.50,
      net: 67.50,
      status: "completed"
    },
    {
      id: "TXN-004",
      date: "Dec 12, 2024",
      service: "Kitchen Cleaning",
      customer: "David Wilson",
      amount: 95,
      fee: 9.50,
      net: 85.50,
      status: "pending_payout"
    }
  ];

  const stats = [
    {
      title: "Total Earnings",
      value: "$3,247",
      change: 12,
      changeType: "increase" as const,
      icon: <DollarSign className="h-5 w-5" />,
      description: "This month"
    },
    {
      title: "Available Balance",
      value: "$847",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Ready for payout"
    },
    {
      title: "Pending Earnings",
      value: "$285",
      icon: <Clock className="h-5 w-5" />,
      description: "Processing"
    },
    {
      title: "Average per Job",
      value: "$108",
      change: 8,
      changeType: "increase" as const,
      icon: <TrendingUp className="h-5 w-5" />,
      description: "This month"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userType="provider" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Earnings</h1>
            <p className="text-muted-foreground">Track your income and manage payouts.</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="btn-hero">
              <CreditCard className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="dashboard-card">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                      {stat.description && (
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <div className="text-primary">{stat.icon}</div>
                    </div>
                    
                    {stat.change && (
                      <div className="flex items-center space-x-1 text-xs text-success">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{stat.change}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Earnings Chart */}
          <Card className="dashboard-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Weekly Earnings</h3>
                <Select defaultValue="this-week">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Earnings']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly Trend Chart */}
          <Card className="dashboard-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Monthly Trend</h3>
                <Select defaultValue="6-months">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="12-months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Earnings']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="dashboard-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="outline">View All</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Service</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Fee</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Net</th>
                    <th className="text-center py-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border">
                      <td className="py-4 text-sm">{transaction.date}</td>
                      <td className="py-4 text-sm font-medium">{transaction.service}</td>
                      <td className="py-4 text-sm text-muted-foreground">{transaction.customer}</td>
                      <td className="py-4 text-sm text-right">${transaction.amount}</td>
                      <td className="py-4 text-sm text-right text-muted-foreground">${transaction.fee}</td>
                      <td className="py-4 text-sm text-right font-semibold">${transaction.net}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'status-completed' 
                            : 'status-pending'
                        }`}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProviderEarnings;