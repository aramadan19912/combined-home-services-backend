import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, DollarSign, Star, Clock, SlidersHorizontal, X } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

const AdvancedSearchInterface: React.FC = () => {
  const {
    filters,
    results,
    activeTab,
    setActiveTab,
    updateFilter,
    updateLocation,
    resetFilters,
  } = useAdvancedSearch();

  const [showFilters, setShowFilters] = useState(false);

  const serviceCategories = [
    'All Categories', 'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Painting', 'Handyman', 'HVAC', 'Carpentry',
  ];

  const getActiveFilters = () => {
    const active = [];
    if (filters.category && filters.category !== 'All Categories') {
      active.push({ type: 'category', label: filters.category });
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      active.push({ type: 'priceRange', label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}` });
    }
    if (filters.rating > 0) {
      active.push({ type: 'rating', label: `${filters.rating}+ stars` });
    }
    return active;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for services"
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter location"
                  value=""
                  onChange={(e) => {}}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="h-12 px-8">Search</Button>
          </div>

          {getActiveFilters().length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
              {getActiveFilters().map((filter, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {filter.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value)}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search Results ({results.totalResults} found)</CardTitle>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'providers')}>
              <TabsList>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'providers')}>
            <TabsContent value="services" className="space-y-4">
              {results.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.services.map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${service.price}</span>
                        </div>
                        <Button className="w-full" size="sm">Book Now</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="providers">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Provider search results will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearchInterface;