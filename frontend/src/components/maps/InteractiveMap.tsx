import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    type?: 'service' | 'provider' | 'customer';
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  allowLocationSelection?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude = 40.7128,
  longitude = -74.0060,
  zoom = 12,
  markers = [],
  onLocationSelect,
  height = '400px',
  allowLocationSelection = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // For now, using a placeholder token. In production, this should come from Supabase secrets
    const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ1dDk2dGEwMDFuMmlzN2R3YzF4cHFhIn0.placeholder';
    
    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [longitude, latitude],
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Handle location selection
      if (allowLocationSelection && onLocationSelect) {
        map.current.on('click', (e) => {
          onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Add markers
      markers.forEach(marker => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        
        // Set marker color based on type
        switch (marker.type) {
          case 'service':
            el.style.backgroundColor = '#3b82f6';
            break;
          case 'provider':
            el.style.backgroundColor = '#10b981';
            break;
          case 'customer':
            el.style.backgroundColor = '#f59e0b';
            break;
          default:
            el.style.backgroundColor = '#6b7280';
        }

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(map.current!);

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-3">
              <h3 class="font-semibold">${marker.title}</h3>
              ${marker.description ? `<p class="text-sm text-gray-600 mt-1">${marker.description}</p>` : ''}
            </div>
          `);

        mapboxMarker.setPopup(popup);
        markersRef.current.push(mapboxMarker);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, markers, onLocationSelect, allowLocationSelection]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          style={{ height }} 
          className="w-full"
        />
        {!mapboxgl.accessToken.includes('placeholder') ? null : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Map Integration</h3>
              <p className="text-sm text-gray-600 mb-4">
                To enable interactive maps, add your Mapbox public token to Supabase secrets.
              </p>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Configure Mapbox
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;