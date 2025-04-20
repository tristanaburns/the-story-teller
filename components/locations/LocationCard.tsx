'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LocationCardProps {
  location: {
    _id: string;
    id?: string;
    storyId: string;
    name: string;
    description?: string;
    geographical_data?: {
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
      terrain?: {
        dominant_features?: string[];
        biome?: string;
      };
      climate?: {
        classification?: string;
      };
    };
    environment?: {
      sensory_experience?: {
        atmosphere?: string;
      };
    };
  };
}

export default function LocationCard({ location }: LocationCardProps) {
  const locationId = location._id || location.id;
  
  // Extract location data with fallbacks for missing properties
  const terrain = location.geographical_data?.terrain;
  const coordinates = location.geographical_data?.coordinates;
  const climate = location.geographical_data?.climate;
  const atmosphere = location.environment?.sensory_experience?.atmosphere;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors duration-200"
    >
      <Link href={`/stories/${location.storyId}/locations/${locationId}`} className="block h-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 truncate">{location.name}</h3>
          
          {coordinates && (coordinates.latitude || coordinates.longitude) && (
            <div className="text-sm text-gray-400 mb-3">
              {coordinates.latitude !== undefined && coordinates.longitude !== undefined ? (
                <span>Coordinates: {coordinates.latitude.toFixed(2)}°, {coordinates.longitude.toFixed(2)}°</span>
              ) : (
                <span>Has partial coordinates</span>
              )}
            </div>
          )}
          
          {terrain?.dominant_features && terrain.dominant_features.length > 0 && (
            <div className="mb-3">
              <span className="text-sm text-gray-400">Terrain: </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {terrain.dominant_features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {feature}
                  </span>
                ))}
                {terrain.dominant_features.length > 3 && (
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    +{terrain.dominant_features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {climate?.classification && (
                <span className="bg-gray-700 text-blue-300 px-2 py-1 rounded-md text-xs">
                  {climate.classification}
                </span>
              )}
              {terrain?.biome && (
                <span className="bg-gray-700 text-green-300 px-2 py-1 rounded-md text-xs">
                  {terrain.biome}
                </span>
              )}
              {atmosphere && (
                <span className="bg-gray-700 text-purple-300 px-2 py-1 rounded-md text-xs">
                  {atmosphere}
                </span>
              )}
            </div>
          </div>
          
          {location.description && (
            <p className="text-gray-300 text-sm line-clamp-3">{location.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
