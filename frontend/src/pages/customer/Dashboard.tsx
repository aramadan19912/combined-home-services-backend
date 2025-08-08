import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { CalendarDays, Clock, Star, Search, ArrowRight, Heart, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardsApi } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/i18n-format";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['customerDashboard'], queryFn: dashboardsApi.getCustomerDashboard });
  const { t } = useTranslation();


  const recommendedServices = [
    {
      id: "1",
      title: "Weekly House Cleaning",
      provider: "CleanPro Services",
      image: "/api/placeholder/300/200",
      price: 89,
      rating: 4.8,
      reviewCount: 124,
      duration: "2-3 hours",
      location: "Downtown",
      category: "Cleaning"
    },
    {
      id: "2",
      title: "Garden Maintenance",
      provider: "GreenThumb Gardens", 
      image: "/api/placeholder/300/200",
      price: 75,
      rating: 4.6,
      reviewCount: 92,
      duration: "2-4 hours",
      location: "Suburban",
      category: "Gardening"
    }
  ];

  const upcomingAppointments = (data?.recentBookings ?? [])
    .filter((b) => b.status !== 'Completed' && b.status !== 'Cancelled')
    .slice(0, 5)
    .map((b) => ({ id: b.id, service: b.serviceName, provider: b.providerName, date: b.scheduledDate, time: b.scheduledTime || '-' }));

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('dashboard.welcomeBack')}, {user?.fullName || 'User'}!</h1>
          <p className="text-muted-foreground">{t('dashboard.manageBookings')}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="dashboard-card text-center">
            <div className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '—' : (data?.totalBookings ?? 0)}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.totalBookings')}</p>
            </div>
          </Card>

          <Card className="dashboard-card text-center">
            <div className="p-6">
              <div className="bg-accent/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '—' : (data?.favoriteServices?.length ?? 0)}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.favorites')}</p>
            </div>
          </Card>

          <Card className="dashboard-card text-center">
            <div className="p-6">
              <div className="bg-warning/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '—' : (data?.pendingReviews ?? 0)}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.pendingReviews')}</p>
            </div>
          </Card>

          <Card className="dashboard-card text-center">
            <div className="p-6">
              <div className="bg-success/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{isLoading ? '—' : (data?.upcomingBookings ?? 0)}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.upcoming')}</p>
            </div>
          </Card>

          <Card className="dashboard-card">
            <div className="p-6 text-center space-y-3">
              <Link to="/customer/book">
                <Button className="w-full btn-hero">
                  <Search className="h-4 w-4 mr-2" />
                  {t('dashboard.bookService')}
                </Button>
              </Link>
              <Link to="/customer/bookings">
                <Button variant="outline" className="w-full">
                  <History className="h-4 w-4 mr-2" />
                  {t('dashboard.viewHistory')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">{t('dashboard.recentBookings')}</h2>
              <Link to="/customer/bookings">
                <Button variant="outline">
                  {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {(data?.recentBookings ?? []).map((booking) => (
                <Card key={booking.id} className="dashboard-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">{t('dashboard.with')} {booking.providerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ['Confirmed','InProgress','Completed'].includes(booking.status) ? 'status-completed' : 'status-pending'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>{booking.scheduledDate}</span>
                        <span>{booking.scheduledTime || '-'}</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatCurrency(booking.totalAmount || 0)}</span>
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

          {/* Sidebar: Upcoming + Recommendations */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t('dashboard.upcomingAppointments')}</h2>
            <Card className="dashboard-card mb-8">
              <div className="p-6 space-y-4">
                {upcomingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{a.service}</p>
                      <p className="text-xs text-muted-foreground">{t('dashboard.with')} {a.provider}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{a.date}</div>
                      <div>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <h2 className="text-2xl font-semibold text-foreground mb-6">{t('dashboard.recommendedForYou')}</h2>
            <div className="space-y-6">
              {recommendedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;