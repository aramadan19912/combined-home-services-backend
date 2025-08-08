import { useState, useCallback } from 'react';
import { useServices, useProviders } from '@/hooks/useApi';
import { Service, Provider } from '@/types/api';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  distance: number;
  availability: string;
  sortBy: 'relevance' | 'price' | 'rating' | 'distance';
  location: {
    latitude: number | null;
    longitude: number | null;
  };
}

interface SearchResults {
  services: Service[];
  providers: Provider[];
  totalResults: number;
  loading: boolean;
  error: string | null;
}

const initialFilters: SearchFilters = {
  query: '',
  category: '',
  priceRange: [0, 1000],
  rating: 0,
  distance: 50,
  availability: '',
  sortBy: 'relevance',
  location: {
    latitude: null,
    longitude: null,
  },
};

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<'services' | 'providers'>('services');

  const { 
    data: services = [], 
    isLoading: servicesLoading, 
    error: servicesError 
  } = useServices(filters.query, filters.category);

  const { 
    data: providers = [], 
    isLoading: providersLoading, 
    error: providersError 
  } = useProviders(filters.query, filters.category);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateLocation = useCallback((latitude: number, longitude: number) => {
    setFilters(prev => ({
      ...prev,
      location: { latitude, longitude },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const applyFilters = useCallback((results: any[], type: 'services' | 'providers') => {
    let filtered = [...results];

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(item => (item.rating || 0) >= filters.rating);
    }

    // Apply price range filter for services
    if (type === 'services' && filters.priceRange) {
      filtered = filtered.filter(item => {
        const price = item.price || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply distance filter if location is available
    if (filters.location.latitude && filters.location.longitude && filters.distance > 0) {
      filtered = filtered.filter(item => {
        if (!item.latitude || !item.longitude) return true;
        
        const distance = calculateDistance(
          filters.location.latitude!,
          filters.location.longitude!,
          item.latitude,
          item.longitude
        );
        
        return distance <= filters.distance;
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price':
        if (type === 'services') {
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        }
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        if (filters.location.latitude && filters.location.longitude) {
          filtered.sort((a, b) => {
            const distanceA = calculateDistance(
              filters.location.latitude!,
              filters.location.longitude!,
              a.latitude || 0,
              a.longitude || 0
            );
            const distanceB = calculateDistance(
              filters.location.latitude!,
              filters.location.longitude!,
              b.latitude || 0,
              b.longitude || 0
            );
            return distanceA - distanceB;
          });
        }
        break;
      default:
        // Relevance - no sorting needed as API handles this
        break;
    }

    return filtered;
  }, [filters]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredServices = applyFilters(services, 'services');
  const filteredProviders = applyFilters(providers, 'providers');

  const results: SearchResults = {
    services: filteredServices,
    providers: filteredProviders,
    totalResults: activeTab === 'services' ? filteredServices.length : filteredProviders.length,
    loading: servicesLoading || providersLoading,
    error: servicesError?.message || providersError?.message || null,
  };

  return {
    filters,
    results,
    activeTab,
    setActiveTab,
    updateFilter,
    updateLocation,
    resetFilters,
    calculateDistance,
  };
};