import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar, 
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
  sortBy: string;
  verified: boolean;
  serviceTypes: string[];
  distance: number;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const serviceCategories = [
  'All Categories',
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Gardening',
  'Painting',
  'Carpentry',
  'HVAC',
  'Moving',
  'Repairs',
  'Installation'
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'newest', label: 'Newest First' }
];

const availabilityOptions = [
  { value: 'any', label: 'Any Time' },
  { value: 'today', label: 'Available Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'next_week', label: 'Next Week' },
  { value: 'weekend', label: 'Weekends Only' }
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleServiceType = (type: string) => {
    const currentTypes = filters.serviceTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    updateFilter('serviceTypes', newTypes);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.location) count++;
    if (filters.category !== 'All Categories') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++;
    if (filters.rating > 0) count++;
    if (filters.availability !== 'any') count++;
    if (filters.verified) count++;
    if (filters.serviceTypes.length > 0) count++;
    if (filters.distance < 50) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search-query">What service do you need?</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search-query"
                placeholder="e.g., kitchen sink repair"
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="location"
                placeholder="City, state, or zip code"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t">
            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4" />
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            {/* Rating & Distance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  Minimum Rating: {filters.rating > 0 ? `${filters.rating} stars` : 'Any'}
                </Label>
                <Slider
                  value={[filters.rating]}
                  onValueChange={(value) => updateFilter('rating', value[0])}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="mb-3 block">
                  Distance: {filters.distance < 50 ? `${filters.distance} miles` : 'Any distance'}
                </Label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value) => updateFilter('distance', value[0])}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Availability & Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Availability
                </Label>
                <Select value={filters.availability} onValueChange={(value) => updateFilter('availability', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort-by" className="mb-2 block">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Verified Providers */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => updateFilter('verified', checked)}
              />
              <Label htmlFor="verified" className="text-sm font-medium">
                Show only verified providers
              </Label>
            </div>

            {/* Service Types */}
            {filters.serviceTypes.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected Services</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.serviceTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleServiceType(type)}
                    >
                      {type}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            Clear All Filters
          </Button>
          
          <Button
            onClick={onSearch}
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Searching...' : 'Search Services'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;