'use client';

import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface Location {
  _id: string;
  id?: string;
  name: string;
  geographical_data?: {
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    terrain?: {
      dominant_features?: string[];
      biome?: string;
    };
  };
}

interface LocationVisualizationProps {
  location: Location;
  height?: string;
  width?: string;
}

export default function LocationVisualization({ 
  location, 
  height = '400px', 
  width = '100%' 
}: LocationVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasCoordinates = location.geographical_data?.coordinates?.latitude !== undefined && 
                         location.geographical_data?.coordinates?.longitude !== undefined;
  
  // Draw a simple map visualization
  useEffect(() => {
    if (!canvasRef.current || !hasCoordinates) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get DPI for better canvas resolution
    const dpi = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpi;
    canvas.height = rect.height * dpi;
    ctx.scale(dpi, dpi);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw world map (simplified)
    drawSimplifiedWorldMap(ctx, rect.width, rect.height);
    
    // Draw location pin
    if (hasCoordinates && location.geographical_data?.coordinates) {
      const lat = location.geographical_data.coordinates.latitude as number;
      const lng = location.geographical_data.coordinates.longitude as number;
      
      // Convert lat/lng to canvas coordinates
      const x = (lng + 180) * (rect.width / 360);
      const y = (90 - lat) * (rect.height / 180);
      
      // Draw pin
      ctx.fillStyle = '#3b82f6'; // Blue
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pin shadow
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw location name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(location.name, x, y - 15);
    }
  }, [location, hasCoordinates]);
  
  // Draw a very simplified world map
  const drawSimplifiedWorldMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = '#1f2937'; // Dark blue-gray
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Draw longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng + 180) * (width / 360);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (90 - lat) * (height / 180);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw equator with slightly brighter line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    const equatorY = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, equatorY);
    ctx.lineTo(width, equatorY);
    ctx.stroke();
    
    // Draw prime meridian with slightly brighter line
    const meridianX = width / 2;
    ctx.beginPath();
    ctx.moveTo(meridianX, 0);
    ctx.lineTo(meridianX, height);
    ctx.stroke();
    
    // Draw simplified continents (very basic)
    ctx.fillStyle = 'rgba(107, 114, 128, 0.7)'; // Gray for land
    
    // North America (simplified)
    ctx.beginPath();
    ctx.moveTo((180 + 230) * width / 360, (90 - 60) * height / 180);
    ctx.lineTo((180 + 190) * width / 360, (90 - 30) * height / 180);
    ctx.lineTo((180 + 240) * width / 360, (90 - 15) * height / 180);
    ctx.lineTo((180 + 280) * width / 360, (90 - 45) * height / 180);
    ctx.closePath();
    ctx.fill();
    
    // South America (simplified)
    ctx.beginPath();
    ctx.moveTo((180 + 210) * width / 360, (90 + 10) * height / 180);
    ctx.lineTo((180 + 195) * width / 360, (90 + 40) * height / 180);
    ctx.lineTo((180 + 220) * width / 360, (90 + 55) * height / 180);
    ctx.lineTo((180 + 230) * width / 360, (90 + 10) * height / 180);
    ctx.closePath();
    ctx.fill();
    
    // Europe and Africa (simplified)
    ctx.beginPath();
    ctx.moveTo((180 + 0) * width / 360, (90 - 40) * height / 180);
    ctx.lineTo((180 + 40) * width / 360, (90 - 40) * height / 180);
    ctx.lineTo((180 + 50) * width / 360, (90 + 35) * height / 180);
    ctx.lineTo((180 + 10) * width / 360, (90 + 35) * height / 180);
    ctx.closePath();
    ctx.fill();
    
    // Asia (simplified)
    ctx.beginPath();
    ctx.moveTo((180 + 40) * width / 360, (90 - 30) * height / 180);
    ctx.lineTo((180 + 140) * width / 360, (90 - 65) * height / 180);
    ctx.lineTo((180 + 140) * width / 360, (90 + 10) * height / 180);
    ctx.lineTo((180 + 80) * width / 360, (90 + 0) * height / 180);
    ctx.closePath();
    ctx.fill();
    
    // Australia (simplified)
    ctx.beginPath();
    ctx.ellipse(
      (180 + 135) * width / 360, 
      (90 + 25) * height / 180, 
      20, 15, 0, 0, Math.PI * 2
    );
    ctx.fill();
  };
  
  if (!hasCoordinates) {
    return (
      <div 
        className="w-full rounded-lg bg-gray-800/60 flex flex-col items-center justify-center p-6"
        style={{ height, width }}
      >
        <MapPin className="h-12 w-12 text-gray-500 mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">No Coordinates Available</h3>
        <p className="text-gray-400 text-center max-w-md">
          This location doesn't have geographic coordinates defined.
          Edit the location to add latitude and longitude.
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height, width }}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Coordinate display */}
      {hasCoordinates && location.geographical_data?.coordinates && (
        <div className="absolute bottom-3 left-3 bg-gray-800/80 text-white px-3 py-2 rounded-md text-sm">
          {location.geographical_data.coordinates.latitude?.toFixed(6)}°, {location.geographical_data.coordinates.longitude?.toFixed(6)}°
        </div>
      )}
    </div>
  );
}
