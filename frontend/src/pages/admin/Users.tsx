import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, User, Star, Calendar, Mail, Phone } from "lucide-react";

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const users = {
    customers: [
      {
        id: "CUST-001",
        name: "Sarah Johnson",
        email: "sarah@email.com",
        phone: "(555) 123-4567",
        joinDate: "Dec 1, 2024",
        totalBookings: 12,
        totalSpent: 1247,
        rating: 4.8,
        status: "active",
        lastActive: "2 hours ago"
      },
      {
        id: "CUST-002", 
        name: "Mike Chen",
        email: "mike@email.com",
        phone: "(555) 234-5678",
        joinDate: "Nov 15, 2024",
        totalBookings: 8,
        totalSpent: 890,
        rating: 4.6,
        status: "active",
        lastActive: "1 day ago"
      },
      {
        id: "CUST-003",
        name: "Lisa Rodriguez",
        email: "lisa@email.com", 
        phone: "(555) 345-6789",
        joinDate: "Oct 20, 2024",
        totalBookings: 15,
        totalSpent: 1560,
        rating: 4.9,
        status: "inactive",
        lastActive: "1 week ago"
      }
    ],
    providers: [
      {
        id: "PROV-001",
        name: "John Smith",
        email: "john@cleanpro.com",
        phone: "(555) 987-6543",
        joinDate: "Sep 10, 2024",
        services: ["Cleaning", "Deep Cleaning"],
        totalEarnings: 4250,
        completedJobs: 85,
        rating: 4.9,
        status: "active",
        verification: "verified",
        lastActive: "30 min ago"
      },
      {
        id: "PROV-002",
        name: "Emma Wilson",
        email: "emma@fastfix.com",
        phone: "(555) 876-5432",
        joinDate: "Aug 5, 2024",
        services: ["Plumbing", "Repairs"],
        totalEarnings: 6800,
        completedJobs: 142,
        rating: 4.7,
        status: "active",
        verification: "verified",
        lastActive: "1 hour ago"
      },
      {
        id: "PROV-003",
        name: "David Brown",
        email: "david@electric.com",
        phone: "(555) 765-4321",
        joinDate: "Jul 12, 2024",
        services: ["Electrical", "Installation"],
        totalEarnings: 3950,
        completedJobs: 67,
        rating: 4.8,
        status: "suspended",
        verification: "pending",
        lastActive: "3 days ago"
      }
    ]
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-completed';
      case 'inactive': return 'status-pending';
      case 'suspended': return 'bg-destructive/10 text-destructive border border-destructive/20';
      default: return 'status-pending';
    }
  };

  const getVerificationClass = (verification: string) => {
    switch (verification) {
      case 'verified': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'rejected': return 'bg-destructive/10 text-destructive border border-destructive/20';
      default: return 'status-pending';
    }
  };

  const filteredUsers = (userType: 'customers' | 'providers') => {
    return users[userType].filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="admin" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage customers and service providers on the platform.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all-status">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* User Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Users ({users.customers.length + users.providers.length})
            </TabsTrigger>
            <TabsTrigger value="customers">
              Customers ({users.customers.length})
            </TabsTrigger>
            <TabsTrigger value="providers">
              Providers ({users.providers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {/* Customers Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customers</h3>
                <div className="grid gap-4">
                  {users.customers.map((customer) => (
                    <Card key={customer.id} className="dashboard-card">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{customer.name}</h4>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {customer.totalBookings} bookings
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ${customer.totalSpent} spent
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-warning text-warning" />
                                  <span className="text-xs">{customer.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusClass(customer.status)}>
                              {customer.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Providers Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Providers</h3>
                <div className="grid gap-4">
                  {users.providers.map((provider) => (
                    <Card key={provider.id} className="dashboard-card">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-success/10 w-12 h-12 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-success" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{provider.name}</h4>
                              <p className="text-sm text-muted-foreground">{provider.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {provider.completedJobs} jobs
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ${provider.totalEarnings} earned
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-warning text-warning" />
                                  <span className="text-xs">{provider.rating}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {provider.services.map((service, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={getVerificationClass(provider.verification)}>
                              {provider.verification}
                            </Badge>
                            <Badge className={getStatusClass(provider.status)}>
                              {provider.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                   ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-6">
            <div className="grid gap-4">
              {users.customers.filter(customer =>
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((customer) => (
                <Card key={customer.id} className="dashboard-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{customer.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Joined {customer.joinDate}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Last active {customer.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{customer.totalBookings} bookings</p>
                            <p className="text-xs text-muted-foreground">${customer.totalSpent} total</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-medium">{customer.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusClass(customer.status)}>
                            {customer.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="providers" className="mt-6">
            <div className="grid gap-4">
              {users.providers.filter(provider =>
                provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.id.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((provider) => (
                <Card key={provider.id} className="dashboard-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-success/10 w-12 h-12 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{provider.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{provider.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{provider.phone}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.services.map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Joined {provider.joinDate}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Last active {provider.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">{provider.completedJobs} jobs</p>
                            <p className="text-xs text-muted-foreground">${provider.totalEarnings} earned</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-medium">{provider.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getVerificationClass(provider.verification)}>
                            {provider.verification}
                          </Badge>
                          <Badge className={getStatusClass(provider.status)}>
                            {provider.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUsers;