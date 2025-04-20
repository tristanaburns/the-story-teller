'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, MapPin, Compass, Cloud, Mountain, TreeDeciduous, Bird, Building, Wind } from 'lucide-react';
import LocationVisualization from './LocationVisualization';

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
      elevation?: string;
    };
    area?: {
      value?: number;
      unit?: 'square meters' | 'square kilometers' | 'hectares' | 'square miles' | 'acres';
    };
    terrain?: {
      dominant_features?: string[];
      biome?: string;
      notable_topography?: string;
    };
    climate?: {
      classification?: string;
      temperature_range?: string;
      seasons?: string;
      notable_weather?: string;
    };
  };
  environment?: {
    natural_elements?: {
      integration?: string;
      flora?: Array<{
        species: string;
        prevalence?: 'dominant' | 'common' | 'scattered' | 'rare' | 'unique';
        significance?: string;
      }>;
      fauna?: Array<{
        species: string;
        behavior?: string;
        relationship_to_inhabitants?: string;
      }>;
    };
    sensory_experience?: {
      sights?: string[];
      sounds?: string[];
      smells?: string[];
      atmosphere?: string;
    };
  };
  features?: {
    landmarks?: Array<{
      name: string;
      description: string;
      significance?: string;
    }>;
    districts?: Array<{
      name: string;
      character?: string;
      primary_function?: string;
    }>;
    infrastructure?: {
      transportation?: Array<{
        system_name: string;
        description: string;
      }>;
      communication?: Array<{
        system_name?: string;
        description: string;
      }>;
    };
  };
}

interface LocationDetailProps {
  location: Location;
}

export default function LocationDetail({ location }: LocationDetailProps) {
  const hasCoordinates = location.geographical_data?.coordinates?.latitude !== undefined && 
                        location.geographical_data?.coordinates?.longitude !== undefined;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{location.name}</h1>
          {location.description && (
            <p className="mt-3 text-gray-300">{location.description}</p>
          )}
        </div>
        
        <Link
          href={`/stories/${location.storyId}/locations/${location._id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Location</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Map and Geographic Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/40 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-400" />
              Location Visualization
            </h2>
            
            <LocationVisualization location={location} height="400px" />
          </div>
          
          <div className="bg-gray-800/40 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <Compass className="mr-2 h-5 w-5 text-blue-400" />
              Geographic Data
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coordinates */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Coordinates</h3>
                
                {hasCoordinates ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Latitude:</span>
                      <span className="text-white font-mono">
                        {location.geographical_data?.coordinates?.latitude?.toFixed(6)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Longitude:</span>
                      <span className="text-white font-mono">
                        {location.geographical_data?.coordinates?.longitude?.toFixed(6)}°
                      </span>
                    </div>
                    {location.geographical_data?.coordinates?.elevation && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Elevation:</span>
                        <span className="text-white">
                          {location.geographical_data.coordinates.elevation}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No coordinates defined</p>
                )}
              </div>
              
              {/* Area */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Area</h3>
                
                {location.geographical_data?.area?.value ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">
                        {location.geographical_data.area.value.toLocaleString()} {location.geographical_data.area.unit}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No area information defined</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Terrain & Climate</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {location.geographical_data?.terrain?.dominant_features && location.geographical_data.terrain.dominant_features.length > 0 && (
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                      <Mountain className="mr-2 h-4 w-4 text-gray-400" />
                      Dominant Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {location.geographical_data.terrain.dominant_features.map((feature, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {location.geographical_data?.terrain?.biome && (
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                      <TreeDeciduous className="mr-2 h-4 w-4 text-gray-400" />
                      Biome
                    </h4>
                    <p className="text-white">{location.geographical_data.terrain.biome}</p>
                  </div>
                )}
                
                {location.geographical_data?.climate?.classification && (
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                      <Cloud className="mr-2 h-4 w-4 text-gray-400" />
                      Climate
                    </h4>
                    <p className="text-white">{location.geographical_data.climate.classification}</p>
                  </div>
                )}
                
                {location.geographical_data?.climate?.temperature_range && (
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Temperature Range</h4>
                    <p className="text-white">{location.geographical_data.climate.temperature_range}</p>
                  </div>
                )}
              </div>
              
              {location.geographical_data?.terrain?.notable_topography && (
                <div className="mt-4">
                  <h4 className="text-gray-300 font-medium mb-2">Notable Topography</h4>
                  <p className="text-white">{location.geographical_data.terrain.notable_topography}</p>
                </div>
              )}
              
              {location.geographical_data?.climate?.notable_weather && (
                <div className="mt-4">
                  <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                    <Wind className="mr-2 h-4 w-4 text-gray-400" />
                    Notable Weather
                  </h4>
                  <p className="text-white">{location.geographical_data.climate.notable_weather}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Environment and Features */}
        <div className="space-y-6">
          {/* Sensory Experience */}
          {location.environment?.sensory_experience && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Sensory Experience</h2>
              
              {location.environment.sensory_experience.atmosphere && (
                <div className="mb-4">
                  <h3 className="text-gray-300 font-medium mb-2">Atmosphere</h3>
                  <p className="text-white">{location.environment.sensory_experience.atmosphere}</p>
                </div>
              )}
              
              {location.environment.sensory_experience.sights && location.environment.sensory_experience.sights.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-300 font-medium mb-2">Sights</h3>
                  <ul className="list-disc pl-5 text-white">
                    {location.environment.sensory_experience.sights.map((sight, index) => (
                      <li key={index}>{sight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {location.environment.sensory_experience.sounds && location.environment.sensory_experience.sounds.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-300 font-medium mb-2">Sounds</h3>
                  <ul className="list-disc pl-5 text-white">
                    {location.environment.sensory_experience.sounds.map((sound, index) => (
                      <li key={index}>{sound}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {location.environment.sensory_experience.smells && location.environment.sensory_experience.smells.length > 0 && (
                <div>
                  <h3 className="text-gray-300 font-medium mb-2">Smells</h3>
                  <ul className="list-disc pl-5 text-white">
                    {location.environment.sensory_experience.smells.map((smell, index) => (
                      <li key={index}>{smell}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Natural Elements */}
          {location.environment?.natural_elements && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <TreeDeciduous className="mr-2 h-5 w-5 text-green-400" />
                Natural Elements
              </h2>
              
              {location.environment.natural_elements.flora && location.environment.natural_elements.flora.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Flora</h3>
                  <div className="space-y-3">
                    {location.environment.natural_elements.flora.map((flora, index) => (
                      <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-white">{flora.species}</h4>
                          {flora.prevalence && (
                            <span className={`text-sm px-2 py-0.5 rounded ${
                              flora.prevalence === 'dominant' ? 'bg-green-600/70 text-white' :
                              flora.prevalence === 'common' ? 'bg-green-500/60 text-white' :
                              flora.prevalence === 'scattered' ? 'bg-yellow-500/60 text-white' :
                              flora.prevalence === 'rare' ? 'bg-orange-500/60 text-white' :
                              'bg-purple-500/60 text-white'
                            }`}>
                              {flora.prevalence}
                            </span>
                          )}
                        </div>
                        {flora.significance && (
                          <p className="text-gray-300 text-sm mt-1">{flora.significance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {location.environment.natural_elements.fauna && location.environment.natural_elements.fauna.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Bird className="mr-2 h-4 w-4 text-gray-400" />
                    Fauna
                  </h3>
                  <div className="space-y-3">
                    {location.environment.natural_elements.fauna.map((fauna, index) => (
                      <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="font-medium text-white">{fauna.species}</h4>
                        {fauna.behavior && (
                          <div className="mt-1">
                            <span className="text-gray-400 text-sm">Behavior: </span>
                            <span className="text-gray-300 text-sm">{fauna.behavior}</span>
                          </div>
                        )}
                        {fauna.relationship_to_inhabitants && (
                          <div className="mt-1">
                            <span className="text-gray-400 text-sm">Relationship: </span>
                            <span className="text-gray-300 text-sm">{fauna.relationship_to_inhabitants}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Landmarks */}
          {location.features?.landmarks && location.features.landmarks.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <Building className="mr-2 h-5 w-5 text-yellow-400" />
                Landmarks
              </h2>
              
              <div className="space-y-4">
                {location.features.landmarks.map((landmark, index) => (
                  <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-medium text-white text-lg">{landmark.name}</h3>
                    <p className="text-gray-300 mt-2">{landmark.description}</p>
                    {landmark.significance && (
                      <div className="mt-3 pt-2 border-t border-gray-600">
                        <span className="text-gray-400 text-sm">Significance: </span>
                        <span className="text-gray-300">{landmark.significance}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Districts */}
          {location.features?.districts && location.features.districts.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Districts & Areas</h2>
              
              <div className="space-y-4">
                {location.features.districts.map((district, index) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="font-medium text-white">{district.name}</h3>
                    {district.character && (
                      <div className="mt-1">
                        <span className="text-gray-400 text-sm">Character: </span>
                        <span className="text-gray-300">{district.character}</span>
                      </div>
                    )}
                    {district.primary_function && (
                      <div className="mt-1">
                        <span className="text-gray-400 text-sm">Function: </span>
                        <span className="text-gray-300">{district.primary_function}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Infrastructure */}
          {location.features?.infrastructure?.transportation && 
           location.features.infrastructure.transportation.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Transportation</h2>
              
              <div className="space-y-4">
                {location.features.infrastructure.transportation.map((transport, index) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <h3 className="font-medium text-white">{transport.system_name}</h3>
                    <p className="text-gray-300 text-sm mt-1">{transport.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
