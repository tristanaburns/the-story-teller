'use client';

import React from 'react';
import LocationCard from './LocationCard';
import Link from 'next/link';
import { PlusCircle, MapPin } from 'lucide-react';

interface Location {
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
}

interface LocationsGridProps {
  locations: Location[];
  storyId: string;
  isLoading?: boolean;
}

export default function LocationsGrid({ locations, storyId, isLoading = false }: LocationsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700 p-6 animate-pulse"
          >
            <div className="h-7 bg-gray-600 rounded-md w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded-md w-1/2 mb-3"></div>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 bg-gray-600 rounded-md w-16"></div>
              <div className="h-6 bg-gray-600 rounded-md w-20"></div>
            </div>
            <div className="h-4 bg-gray-600 rounded-md w-full mb-2"></div>
            <div className="h-4 bg-gray-600 rounded-md w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded-md w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
        <MapPin className="mx-auto h-12 w-12 text-gray-500 mb-3" />
        <h3 className="text-xl font-medium text-white mb-2">No Locations Yet</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Create locations to populate your story world and bring your narrative to life.
        </p>
        <Link
          href={`/stories/${storyId}/locations/new`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create First Location
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <LocationCard key={location._id} location={location} />
      ))}
      <Link
        href={`/stories/${storyId}/locations/new`}
        className="flex flex-col items-center justify-center p-6 bg-gray-800/20 rounded-xl border border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/30 transition-all duration-200 min-h-[200px]"
      >
        <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
        <span className="text-gray-300 font-medium">Add New Location</span>
      </Link>
    </div>
  );
}
