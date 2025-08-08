import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { Search, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import cleaningService from "@/assets/cleaning-service.jpg";
import plumbingService from "@/assets/plumbing-service.jpg";
import electricalService from "@/assets/electrical-service.jpg";
import gardeningService from "@/assets/gardening-service.jpg";

const Index = () => {
  const featuredServices = [
    {
      id: "1",
      title: "Professional Home Cleaning",
      provider: "CleanPro Services",
      image: cleaningService,
      price: 89,
      rating: 4.8,
      reviewCount: 124,
      duration: "2-3 hours",
      location: "Downtown",
      category: "Cleaning"
    },
    {
      id: "2", 
      title: "Emergency Plumbing Repair",
      provider: "FastFix Plumbers",
      image: plumbingService,
      price: 120,
      rating: 4.9,
      reviewCount: 89,
      duration: "1-2 hours",
      location: "Citywide",
      category: "Plumbing"
    },
    {
      id: "3",
      title: "Electrical Installation & Repair",
      provider: "PowerPro Electric",
      image: electricalService,
      price: 95,
      rating: 4.7,
      reviewCount: 156,
      duration: "1-4 hours",
      location: "Metro Area",
      category: "Electrical"
    },
    {
      id: "4",
      title: "Garden Maintenance & Landscaping",
      provider: "GreenThumb Gardens",
      image: gardeningService,
      price: 75,
      rating: 4.6,
      reviewCount: 92,
      duration: "2-4 hours",
      location: "Suburban",
      category: "Gardening"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Trusted Home<br />
            <span className="text-primary-glow">Service Professionals</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Book verified experts for cleaning, plumbing, electrical work, and more. 
            Quality service guaranteed, right to your door.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link to="/customer/browse" className="flex-1">
              <Button className="btn-hero w-full text-lg py-6">
                Find Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/provider/register" className="flex-1">
              <Button className="btn-hero-outline w-full text-lg py-6">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ServiceHub?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We connect you with verified professionals who deliver quality service every time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="dashboard-card text-center">
              <div className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Professionals</h3>
                <p className="text-muted-foreground">
                  All service providers are background-checked and verified for your safety and peace of mind.
                </p>
              </div>
            </Card>
            
            <Card className="dashboard-card text-center">
              <div className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Booking</h3>
                <p className="text-muted-foreground">
                  Book services in minutes with our simple interface. Same-day and emergency services available.
                </p>
              </div>
            </Card>
            
            <Card className="dashboard-card text-center">
              <div className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
                <p className="text-muted-foreground">
                  Money-back guarantee if you're not satisfied. Read real reviews from verified customers.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most requested home services from top-rated professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/customer/browse">
              <Button className="btn-hero text-lg px-8 py-4">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ServiceHub for their home service needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link to="/customer/register" className="flex-1">
              <Button className="w-full bg-white text-primary hover:bg-white/90 text-lg py-4">
                Book a Service
              </Button>
            </Link>
            <Link to="/provider/register" className="flex-1">
              <Button className="w-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary text-lg py-4">
                Join as Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
