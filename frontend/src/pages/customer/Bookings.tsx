import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, Star, MessageSquare, Phone, WifiOff } from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

const CustomerBookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { isOnline, cacheBookings, getCachedBookings } = useOfflineStorage();
  const bookings = {
    upcoming: [
      {
        id: "1",
        service: "House Cleaning",
        provider: "CleanPro Services",
        providerPhone: "(555) 123-4567",
        date: "Dec 15, 2024",
        time: "2:00 PM - 5:00 PM",
        location: "123 Main St, Downtown",
        price: 89,
        status: "confirmed",
        notes: "Please focus on kitchen and bathrooms. Keys under doormat."
      },
      {
        id: "2",
        service: "Plumbing Repair", 
        provider: "FastFix Plumbers",
        providerPhone: "(555) 234-5678",
        date: "Dec 18, 2024",
        time: "10:00 AM - 12:00 PM",
        location: "123 Main St, Downtown",
        price: 120,
        status: "pending",
        notes: "Kitchen sink is leaking. Issue started 2 days ago."
      }
    ],
    inProgress: [
      {
        id: "3",
        service: "Garden Maintenance",
        provider: "GreenThumb Gardens",
        providerPhone: "(555) 345-6789",
        date: "Dec 12, 2024",
        time: "9:00 AM - 1:00 PM",
        location: "123 Main St, Downtown",
        price: 75,
        status: "in-progress",
        notes: "Trim hedges and plant new flowers in front yard."
      }
    ],
    completed: [
      {
        id: "4",
        service: "Electrical Repair",
        provider: "PowerPro Electric",
        providerPhone: "(555) 456-7890",
        date: "Dec 8, 2024",
        time: "1:00 PM - 3:00 PM",
        location: "123 Main St, Downtown",
        price: 95,
        status: "completed",
        rating: 5,
        notes: "Fixed outlet in bedroom. Great service!"
      },
      {
        id: "5",
        service: "Deep Cleaning",
        provider: "CleanPro Services",
        providerPhone: "(555) 123-4567",
        date: "Dec 5, 2024",
        time: "10:00 AM - 2:00 PM", 
        location: "123 Main St, Downtown",
        price: 150,
        status: "completed",
        rating: 4,
        notes: "Excellent work. House looks amazing!"
      }
    ]
  };

  const [displayBookings, setDisplayBookings] = useState(bookings);

  useEffect(() => {
    const all = [
      ...bookings.upcoming,
      ...bookings.inProgress,
      ...bookings.completed,
    ];

    if (isOnline) {
      cacheBookings(all);
      setDisplayBookings(bookings);
    } else {
      const cached = getCachedBookings();
      if (cached.length) {
        const grouped = {
          upcoming: cached.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'),
          inProgress: cached.filter((b: any) => b.status === 'in-progress'),
          completed: cached.filter((b: any) => b.status === 'completed'),
        };
        setDisplayBookings(grouped as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-active';
      case 'in-progress': return 'status-active';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="dashboard-card">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{booking.service}</h3>
            <p className="text-sm text-muted-foreground">with {booking.provider}</p>
          </div>
          <Badge className={getStatusClass(booking.status)}>
            {booking.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{booking.date}</span>
            <Clock className="h-4 w-4 ml-4" />
            <span>{booking.time}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{booking.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-foreground">${booking.price}</span>
          </div>
          
          {booking.notes && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              {booking.notes}
            </p>
          )}
          
          {booking.rating && (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Your rating:</span>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < booking.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {booking.status === 'upcoming' || booking.status === 'confirmed' && (
            <>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </>
          )}
          
          {booking.status === 'pending' && (
            <Button variant="outline" className="flex-1">
              Cancel Request
            </Button>
          )}
          
          {booking.status === 'in-progress' && (
            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Provider
            </Button>
          )}
          
          {booking.status === 'completed' && !booking.rating && (
            <Button className="flex-1 btn-hero">
              <Star className="h-4 w-4 mr-2" />
              Leave Review
            </Button>
          )}
          
          {booking.status === 'completed' && (
            <Button variant="outline" className="flex-1">
              Book Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Track and manage all your service bookings.</p>
        </div>

        {/* Booking Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({bookings.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="inProgress">
              In Progress ({bookings.inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({bookings.completed.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            <div className="space-y-6">
              {bookings.upcoming.length > 0 ? (
                bookings.upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="dashboard-card text-center py-12">
                  <div className="space-y-4">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold text-foreground">No upcoming bookings</h3>
                    <p className="text-muted-foreground">
                      Book a service to see it appear here.
                    </p>
                    <Button className="btn-hero">Browse Services</Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="inProgress" className="mt-6">
            <div className="space-y-6">
              {bookings.inProgress.length > 0 ? (
                bookings.inProgress.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="dashboard-card text-center py-12">
                  <div className="space-y-4">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold text-foreground">No services in progress</h3>
                    <p className="text-muted-foreground">
                      Active services will appear here.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              {bookings.completed.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerBookings;