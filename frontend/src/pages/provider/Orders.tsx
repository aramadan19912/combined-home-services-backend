import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { OrderCard } from "@/components/provider/OrderCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar } from "lucide-react";

const ProviderOrders = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = {
    pending: [
      {
        id: "ORD-001",
        customerName: "Sarah Johnson",
        service: "House Cleaning",
        date: "Dec 15, 2024",
        time: "2:00 PM",
        location: "123 Main St, Downtown",
        price: 89,
        status: "pending" as const,
        description: "Standard house cleaning service. Please focus on kitchen and bathrooms. Keys will be under the doormat."
      },
      {
        id: "ORD-004",
        customerName: "David Wilson",
        service: "Carpet Cleaning",
        date: "Dec 16, 2024",
        time: "11:00 AM",
        location: "321 Elm St, Westside",
        price: 95,
        status: "pending" as const,
        description: "Living room and bedroom carpets need deep cleaning. Pet-friendly products preferred."
      }
    ],
    accepted: [
      {
        id: "ORD-002",
        customerName: "Mike Chen",
        service: "Plumbing Repair",
        date: "Dec 15, 2024",
        time: "4:00 PM",
        location: "456 Oak Ave, Midtown",
        price: 120,
        status: "accepted" as const,
        description: "Kitchen sink is leaking. Customer mentioned it started 2 days ago. Tools needed: wrench set, pipe putty."
      },
      {
        id: "ORD-005",
        customerName: "Jennifer Lee",
        service: "Window Cleaning",
        date: "Dec 17, 2024",
        time: "9:00 AM",
        location: "555 Maple Dr, Northside",
        price: 65,
        status: "accepted" as const,
        description: "Interior and exterior windows for 2-story house. Ladder will be provided."
      }
    ],
    inProgress: [
      {
        id: "ORD-003",
        customerName: "Lisa Rodriguez",
        service: "Deep Cleaning",
        date: "Dec 15, 2024",
        time: "10:00 AM",
        location: "789 Pine St, Uptown",
        price: 150,
        status: "in-progress" as const,
        description: "Move-out cleaning required. Property needs to be spotless for inspection. Extra attention to kitchen and bathrooms."
      }
    ],
    completed: [
      {
        id: "ORD-006",
        customerName: "Robert Brown",
        service: "Bathroom Cleaning",
        date: "Dec 14, 2024",
        time: "1:00 PM",
        location: "222 Cedar Ave, Downtown",
        price: 75,
        status: "completed" as const,
        description: "Deep clean master bathroom including tile scrubbing and grout cleaning."
      },
      {
        id: "ORD-007",
        customerName: "Amanda Davis",
        service: "Kitchen Cleaning",
        date: "Dec 13, 2024",
        time: "3:00 PM",
        location: "888 Birch St, Eastside",
        price: 85,
        status: "completed" as const,
        description: "Post-party kitchen cleanup including appliances, counters, and floor mopping."
      }
    ]
  };

  const filteredOrders = (orderList: any[]) => {
    return orderList.filter((order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getTabCount = (tab: string) => {
    return orders[tab as keyof typeof orders].length;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userType="provider" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
          <p className="text-muted-foreground">Manage all your service requests and track progress.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by customer, service, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Order Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({getTabCount("pending")})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({getTabCount("accepted")})
            </TabsTrigger>
            <TabsTrigger value="inProgress">
              In Progress ({getTabCount("inProgress")})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getTabCount("completed")})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <div className="space-y-6">
              {filteredOrders(orders.pending).length > 0 ? (
                filteredOrders(orders.pending).map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order}
                    onAccept={() => console.log("Accept order:", order.id)}
                    onReject={() => console.log("Reject order:", order.id)}
                  />
                ))
              ) : (
                <Card className="dashboard-card text-center py-12">
                  <div className="space-y-4">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold text-foreground">No pending orders</h3>
                    <p className="text-muted-foreground">
                      New service requests will appear here when customers book your services.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="accepted" className="mt-6">
            <div className="space-y-6">
              {filteredOrders(orders.accepted).map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  onUpdateStatus={(status) => console.log("Update status:", order.id, status)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="inProgress" className="mt-6">
            <div className="space-y-6">
              {filteredOrders(orders.inProgress).map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  onUpdateStatus={(status) => console.log("Update status:", order.id, status)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              {filteredOrders(orders.completed).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderOrders;