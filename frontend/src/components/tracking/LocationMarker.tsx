/**
 * LocationMarker Component
 * Simple location marker display with static map
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
  markerColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  showCoordinates?: boolean;
  showOpenInMaps?: boolean;
  zoom?: number;
  height?: string;
  className?: string;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  latitude,
  longitude,
  label,
  address,
  markerColor = 'red',
  showCoordinates = false,
  showOpenInMaps = true,
  zoom = 15,
  height = '300px',
  className = '',
}) => {
  const { t } = useTranslation();

  const getMapUrl = () => {
    const markerLabel = label ? `label:${label.charAt(0).toUpperCase()}` : '';
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=600x400&markers=color:${markerColor}%7C${markerLabel}%7C${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`;
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Map Image */}
        <div
          className="relative w-full overflow-hidden cursor-pointer group"
          style={{ height }}
          onClick={openInMaps}
        >
          <img
            src={getMapUrl()}
            alt={label || t('tracking.location')}
            className="w-full h-full object-cover transition group-hover:scale-105"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Label Badge */}
          {label && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white/90 backdrop-blur gap-2"
            >
              <MapPin className="h-3 w-3" />
              {label}
            </Badge>
          )}
        </div>

        {/* Location Details */}
        {(address || showCoordinates || showOpenInMaps) && (
          <div className="p-4 border-t space-y-3">
            {/* Address */}
            {address && (
              <div>
                <p className="text-sm font-medium">{address}</p>
              </div>
            )}

            {/* Coordinates */}
            {showCoordinates && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Navigation className="h-3 w-3" />
                <span>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>
            )}

            {/* Open in Maps Button */}
            {showOpenInMaps && (
              <Button
                variant="outline"
                size="sm"
                onClick={openInMaps}
                className="w-full gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t('tracking.openInMaps')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMarker;
