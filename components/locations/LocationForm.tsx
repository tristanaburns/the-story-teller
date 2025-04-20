'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, MapPinned, Map } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Trash2, ArrowLeft } from 'lucide-react';
import MapSelector from '@/components/locations/MapSelector';
import TagInput from '@/components/TagInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Represents a location in a story
 */
export interface Location {
  id?: string;
  name: string;
  description: string;
  important: boolean;
  coordinates?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };
  tags: string[];
  image_url?: string;
  address?: string;
  city?: string;
  country?: string;
  region?: string;
  postal_code?: string;
  established_year?: number;
  fictional: boolean;
  historical_significance?: string;
  climate?: string;
  terrain?: string;
  population?: number;
  notes?: string;
  related_locations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Props for the LocationForm component
 */
interface LocationFormProps {
  storyId: string;
  locationId?: string;
  initialData?: Partial<Location>;
  onSuccess?: (location: Location) => void;
  onCancel?: () => void;
}

// Form schema using Zod
const locationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  coordinates: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function LocationForm({
  storyId,
  locationId,
  initialData,
  onSuccess,
  onCancel
}: LocationFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(locationId ? true : false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [mapDialogOpen, setMapDialogOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [relatedLocationsInput, setRelatedLocationsInput] = useState<string>('');
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      coordinates: {
        lat: undefined,
        lng: undefined,
      },
      tags: [],
    },
  });

  // Fetch location data if in edit mode
  useEffect(() => {
    const fetchLocationData = async () => {
      if (!locationId) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stories/${storyId}/locations/${locationId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        
        // Set form values from fetched data
        form.reset({
          name: data.location.name || '',
          description: data.location.description || '',
          address: data.location.address || '',
          coordinates: {
            lat: data.location.coordinates?.lat,
            lng: data.location.coordinates?.lng,
          },
          tags: data.location.tags || [],
        });
      } catch (error) {
        console.error('Error fetching location data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load location data',
          variant: 'destructive',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    // If initialData is provided, use it instead of fetching
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        address: initialData.address || '',
        coordinates: {
          lat: initialData.coordinates?.lat,
          lng: initialData.coordinates?.lng,
        },
        tags: initialData.tags || [],
      });
      setInitialLoading(false);
    } else if (locationId) {
      fetchLocationData();
    }
  }, [storyId, locationId, initialData, form, toast]);

  // Handle form submission
  const onSubmit = async (values: LocationFormValues) => {
    try {
      setLoading(true);
      
      const locationData: Location = {
        name: values.name,
        description: values.description || "",
        address: values.address,
        coordinates: values.coordinates,
        tags: values.tags || [],
        important: false,
        fictional: false,
      };
      
      const url = locationId
        ? `/api/stories/${storyId}/locations/${locationId}`
        : `/api/stories/${storyId}/locations`;
      
      const method = locationId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save location');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Success',
        description: locationId ? 'Location updated successfully' : 'Location created successfully',
      });
      
      if (onSuccess) {
        onSuccess(result.location);
      } else {
        // Navigate to location detail page
        router.push(`/stories/${storyId}/locations/${result.location.id || locationId}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: 'Error',
        description: 'Failed to save location',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelect = (lat: number, lng: number, address?: string) => {
    form.setValue('coordinates.lat', lat);
    form.setValue('coordinates.lng', lng);
    
    if (address) {
      form.setValue('address', address);
    }
    
    setMapDialogOpen(false);
  };

  const handleDeleteLocation = async () => {
    if (!locationId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/stories/${storyId}/locations/${locationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
      
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
      
      // Navigate back to locations list
      router.push(`/stories/${storyId}/locations`);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete location',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-primary" />
          {locationId ? 'Edit Location' : 'Create New Location'}
        </CardTitle>
        <CardDescription>
          {locationId
            ? 'Update the details of this location in your story'
            : 'Add a new location to your story world'}
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of this location in your story world
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this location..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about this location, its significance, and appearance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Location address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4 md:mt-0 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMapDialogOpen(true)}
                    className="w-full md:w-auto"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Select on Map
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="coordinates.lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Latitude"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value?.toString() || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex-1 mt-4 md:mt-0">
                  <FormField
                    control={form.control}
                    name="coordinates.lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value?.toString() || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value || []}
                      setTags={(newTags) => field.onChange(newTags)}
                      placeholder="Add tags..."
                      maxTags={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to categorize this location (e.g., urban, historic, dangerous)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <div>
              {locationId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Location
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
      
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Location on Map</DialogTitle>
            <DialogDescription>
              Click on the map to set the coordinates for this location
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-[500px] overflow-hidden">
            <MapSelector
              initialLat={form.getValues('coordinates.lat')}
              initialLng={form.getValues('coordinates.lng')}
              onSelectLocation={handleMapSelect}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setMapDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDeleteLocation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Location'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}