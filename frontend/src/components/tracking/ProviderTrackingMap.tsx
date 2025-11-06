/**
 * ProviderTrackingMap Component
 * Real-time GPS tracking map with route display and ETA
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Navigation,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Maximize2,
  Minimize2,
  RefreshCw,
  Car,
  User,
} from 'lucide-react';
import { ProviderLocation } from '@/types/enhanced-entities';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface ProviderTrackingMapProps {
  orderId: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerPhone?: string;
  customerLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  providerLocation?: ProviderLocation;
  estimatedArrivalTime?: Date;
  onRefresh?: () => Promise<void>;
  onCall?: () => void;
  onMessage?: () => void;
  autoRefreshInterval?: number; // milliseconds
  className?: string;
}

export const ProviderTrackingMap: React.FC<ProviderTrackingMapProps> = ({
  orderId,
  providerId,
  providerName,
  providerAvatar,
  providerPhone,
  customerLocation,
  providerLocation,
  estimatedArrivalTime,
  onRefresh,
  onCall,
  onMessage,
  autoRefreshInterval = 10000, // 10 seconds default
  className = '',
}) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate distance using Haversine formula
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Calculate distance and duration
  useEffect(() => {
    if (providerLocation && providerLocation.isOnline) {
      const dist = calculateDistance(
        providerLocation.latitude,
        providerLocation.longitude,
        customerLocation.latitude,
        customerLocation.longitude
      );
      setDistance(dist);

      // Estimate duration (assuming average speed of 30 km/h in city)
      const estimatedDuration = (dist / 30) * 60; // minutes
      setDuration(estimatedDuration);
    } else {
      setDistance(null);
      setDuration(null);
    }
  }, [providerLocation, customerLocation, calculateDistance]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0 && onRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        onRefresh().catch(() => {
          // Silent fail for auto-refresh
        });
      }, autoRefreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefreshInterval, onRefresh]);

  const handleManualRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success(t('tracking.refreshed'));
    } catch (error) {
      toast.error(t('tracking.refreshFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getMapUrl = () => {
    if (!providerLocation || !providerLocation.isOnline) {
      // Show only customer location
      return `https://maps.googleapis.com/maps/api/staticmap?center=${customerLocation.latitude},${customerLocation.longitude}&zoom=15&size=600x400&markers=color:blue%7Clabel:C%7C${customerLocation.latitude},${customerLocation.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;
    }

    // Show both provider and customer with path
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:green%7Clabel:P%7C${providerLocation.latitude},${providerLocation.longitude}&markers=color:blue%7Clabel:C%7C${customerLocation.latitude},${customerLocation.longitude}&path=color:0x0000ff80%7Cweight:5%7C${providerLocation.latitude},${providerLocation.longitude}%7C${customerLocation.latitude},${customerLocation.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;
  };

  const getETADisplay = () => {
    if (estimatedArrivalTime) {
      return format(new Date(estimatedArrivalTime), 'HH:mm');
    }
    if (duration !== null) {
      const mins = Math.round(duration);
      return `~${mins} ${t('tracking.minutes')}`;
    }
    return t('tracking.calculatingETA');
  };

  const getDistanceDisplay = () => {
    if (distance === null) return '--';
    if (distance < 1) {
      return `${Math.round(distance * 1000)} ${t('tracking.meters')}`;
    }
    return `${distance.toFixed(1)} ${t('tracking.kilometers')}`;
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            {t('tracking.liveTracking')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-8 w-8"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Provider Info Bar */}
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={providerAvatar} />
                <AvatarFallback>
                  {providerName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{providerName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {providerLocation?.isOnline ? (
                    <>
                      <Badge variant="default" className="gap-1">
                        <Car className="h-3 w-3" />
                        {t('tracking.onTheWay')}
                      </Badge>
                      {providerLocation.lastUpdated && (
                        <span className="text-xs">
                          {t('tracking.updated')}{' '}
                          {format(new Date(providerLocation.lastUpdated), 'HH:mm')}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary">{t('tracking.offline')}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex gap-2">
              {onCall && (
                <Button variant="outline" size="sm" onClick={onCall} className="gap-2">
                  <Phone className="h-4 w-4" />
                  {t('tracking.call')}
                </Button>
              )}
              {onMessage && (
                <Button variant="outline" size="sm" onClick={onMessage} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('tracking.message')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ETA and Distance Info */}
        {providerLocation?.isOnline && (
          <div className="p-4 bg-primary/5 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('tracking.estimatedArrival')}
                  </p>
                  <p className="text-lg font-semibold">{getETADisplay()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('tracking.distance')}
                  </p>
                  <p className="text-lg font-semibold">{getDistanceDisplay()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Display */}
        <div className={`relative ${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-96'}`}>
          {providerLocation ? (
            <img
              src={getMapUrl()}
              alt={t('tracking.mapView')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('tracking.waitingForLocation')}</p>
            </div>
          )}

          {/* Map Legends */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {providerLocation?.isOnline && (
              <Badge variant="secondary" className="gap-2 bg-white/90 backdrop-blur">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                {t('tracking.provider')}
              </Badge>
            )}
            <Badge variant="secondary" className="gap-2 bg-white/90 backdrop-blur">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              {t('tracking.customer')}
            </Badge>
          </div>
        </div>

        {/* Customer Address */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                {t('tracking.serviceLocation')}
              </p>
              <p className="text-sm font-medium">
                {customerLocation.address || t('tracking.addressNotAvailable')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {customerLocation.latitude.toFixed(6)}, {customerLocation.longitude.toFixed(6)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `https://www.google.com/maps?q=${customerLocation.latitude},${customerLocation.longitude}`;
                window.open(url, '_blank');
              }}
            >
              {t('tracking.openInMaps')}
            </Button>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefreshInterval > 0 && (
          <div className="px-4 py-2 border-t bg-muted/10 text-xs text-center text-muted-foreground">
            {t('tracking.autoRefresh', {
              seconds: Math.round(autoRefreshInterval / 1000),
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderTrackingMap;
