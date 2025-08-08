import { useState, useEffect } from 'react';

interface OfflineData {
  bookings: any[];
  providers: any[];
  reviews: any[];
  userProfile: any;
  lastSync: string;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    bookings: [],
    providers: [],
    reviews: [],
    userProfile: null,
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data on mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const saved = localStorage.getItem('offline-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setOfflineData(parsed);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = (data: Partial<OfflineData>) => {
    try {
      const updated = {
        ...offlineData,
        ...data,
        lastSync: new Date().toISOString(),
      };
      setOfflineData(updated);
      localStorage.setItem('offline-data', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const cacheBookings = (bookings: any[]) => {
    saveOfflineData({ bookings });
  };

  const cacheProviders = (providers: any[]) => {
    saveOfflineData({ providers });
  };

  const cacheUserProfile = (userProfile: any) => {
    saveOfflineData({ userProfile });
  };

  const addOfflineBooking = (booking: any) => {
    const offlineBookings = getOfflineBookings();
    const updatedBookings = [...offlineBookings, { ...booking, offline: true, id: `offline-${Date.now()}` }];
    saveOfflineData({ bookings: updatedBookings });
  };

  const getOfflineBookings = () => {
    return offlineData.bookings.filter(booking => booking.offline);
  };

  const getCachedBookings = () => {
    return offlineData.bookings;
  };

  const getCachedProviders = () => {
    return offlineData.providers;
  };

  const getCachedUserProfile = () => {
    return offlineData.userProfile;
  };

  const clearOfflineData = () => {
    const emptyData: OfflineData = {
      bookings: [],
      providers: [],
      reviews: [],
      userProfile: null,
      lastSync: new Date().toISOString(),
    };
    setOfflineData(emptyData);
    localStorage.removeItem('offline-data');
  };

  const getStorageInfo = () => {
    try {
      const data = localStorage.getItem('offline-data');
      const sizeInBytes = new Blob([data || '']).size;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      
      return {
        size: sizeInKB,
        lastSync: offlineData.lastSync,
        itemCount: Object.values(offlineData).reduce((count, items) => {
          return count + (Array.isArray(items) ? items.length : items ? 1 : 0);
        }, 0),
      };
    } catch (error) {
      return { size: 0, lastSync: null, itemCount: 0 };
    }
  };

  return {
    isOnline,
    offlineData,
    cacheBookings,
    cacheProviders,
    cacheUserProfile,
    addOfflineBooking,
    getOfflineBookings,
    getCachedBookings,
    getCachedProviders,
    getCachedUserProfile,
    clearOfflineData,
    getStorageInfo,
  };
};