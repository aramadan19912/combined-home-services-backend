import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = '';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while retrieving location.';
          break;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 600000, // 10 minutes
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  const getCurrentPosition = (): Promise<GeolocationState> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            loading: false,
          };
          setState(result);
          resolve(result);
        },
        (error) => {
          const errorState = {
            latitude: null,
            longitude: null,
            accuracy: null,
            error: error.message,
            loading: false,
          };
          setState(errorState);
          reject(errorState);
        }
      );
    });
  };

  const calculateDistance = (lat2: number, lon2: number): number | null => {
    if (!state.latitude || !state.longitude) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - state.latitude) * Math.PI / 180;
    const dLon = (lon2 - state.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(state.latitude * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    ...state,
    getCurrentPosition,
    calculateDistance,
    isAvailable: !!navigator.geolocation,
  };
};