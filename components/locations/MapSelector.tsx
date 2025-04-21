'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface MapSelectorProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation?: (lat: number, lng: number, address?: string) => void;
  
  initialPosition?: [number, number];
  onPositionChange?: (position: [number, number]) => void;
}

/**
 * A component for selecting locations on a map.
 * Uses Leaflet for map functionality.
 */
export default function MapSelector({ 
  initialLat, 
  initialLng, 
  onSelectLocation,
  initialPosition,
  onPositionChange
}: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default coordinates (centered on US if no initial coordinates)
  // Use initialPosition if provided (for test compatibility)
  const defaultLat = initialLat || (initialPosition ? initialPosition[0] : 40.7128);
  const defaultLng = initialLng || (initialPosition ? initialPosition[1] : -74.0060);
  
  // Handle map selection
  const handleMapSelection = (lat: number, lng: number, address?: string) => {
    // Support both callback patterns
    if (onSelectLocation) {
      onSelectLocation(lat, lng, address);
    }
    
    if (onPositionChange) {
      onPositionChange([lat, lng]);
    }
  };
  
  useEffect(() => {
    // Dynamic import to avoid SSR issues with Leaflet
    const initializeMap = async () => {
      try {
        setLoading(true);
        
        // Only import leaflet on client side
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        
        if (!mapRef.current) return;
        
        // Initialize map
        const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker if initial coordinates exist
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let marker: L.Marker | null = null;
        if (initialLat && initialLng) {
          marker = L.marker([initialLat, initialLng]).addTo(map);
        } else if (initialPosition) {
          marker = L.marker(initialPosition).addTo(map);
        }
        
        // Handle map click
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          
          // Update marker
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng]).addTo(map);
          }
          
          try {
            // Optional: Reverse geocode to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.display_name;
              handleMapSelection(lat, lng, address);
            } else {
              handleMapSelection(lat, lng);
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            handleMapSelection(lat, lng);
          }
        });
        
        // Ensure map redraws properly
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
        setLoading(false);
        
        return () => {
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load map. Please try again later.');
        setLoading(false);
      }
    };
    
    initializeMap();
  }, [defaultLat, defaultLng, initialLat, initialLng, initialPosition]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-muted/20 rounded-md">
        <div className="text-center p-4">
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please ensure you have an internet connection and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-md" 
        style={{ minHeight: '400px' }}
        data-testid="map-container"
      />
      <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-2 rounded-md text-xs text-muted-foreground">
        Click anywhere on the map to select a location.
      </div>
    </div>
  );
} 