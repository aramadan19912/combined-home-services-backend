import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Filter, MapPin, Star } from "lucide-react";
import cleaningService from "@/assets/cleaning-service.jpg";
import plumbingService from "@/assets/plumbing-service.jpg";
import electricalService from "@/assets/electrical-service.jpg";
import gardeningService from "@/assets/gardening-service.jpg";

const CustomerBrowse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All Services" },
    { id: "cleaning", name: "Cleaning" },
    { id: "plumbing", name: "Plumbing" },
    { id: "electrical", name: "Electrical" },
    { id: "gardening", name: "Gardening" },
    { id: "handyman", name: "Handyman" },
    { id: "painting", name: "Painting" }
  ];

  const services = [
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
    },
    {
      id: "5",
      title: "Deep Carpet Cleaning",
      provider: "CleanPro Services",
      image: cleaningService,
      price: 150,
      rating: 4.7,
      reviewCount: 67,
      duration: "3-4 hours",
      location: "Downtown",
      category: "Cleaning"
    },
    {
      id: "6",
      title: "Bathroom Renovation",
      provider: "FastFix Plumbers",
      image: plumbingService,
      price: 300,
      rating: 4.8,
      reviewCount: 43,
      duration: "1-2 days",
      location: "Metro Area",
      category: "Plumbing"
    }
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           service.category.toLowerCase() === selectedCategory;
    const matchesPrice = priceRange === "all" ||
                        (priceRange === "low" && service.price < 100) ||
                        (priceRange === "medium" && service.price >= 100 && service.price < 200) ||
                        (priceRange === "high" && service.price >= 200);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Services</h1>
          <p className="text-muted-foreground">Find the perfect service provider for your needs.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for services or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Cards */}
          <div className="flex flex-wrap gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-foreground">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-foreground">Price Range</h3>
                <div className="flex gap-2">
                  <Button
                    variant={priceRange === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceRange("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={priceRange === "low" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceRange("low")}
                  >
                    Under $100
                  </Button>
                  <Button
                    variant={priceRange === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceRange("medium")}
                  >
                    $100-$200
                  </Button>
                  <Button
                    variant={priceRange === "high" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceRange("high")}
                  >
                    $200+
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredServices.length} Services Found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Within 25 miles</span>
            </div>
          </div>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onBook={() => navigate('/customer/book', { state: { service } })} />
            ))}
          </div>
        ) : (
          <Card className="dashboard-card text-center py-12">
            <div className="space-y-4">
              <Search className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">No services found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all categories.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
              }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerBrowse;