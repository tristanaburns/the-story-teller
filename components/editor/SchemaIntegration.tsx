'use client';

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Label } from '@/components/ui/label';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Input } from '@/components/ui/input';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useToast } from '@/components/ui/use-toast';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Separator } from '@/components/ui/separator';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, PlusCircle, Trash } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the types for our entities and schema
export interface EntityField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  options?: string[];
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  fields: EntityField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Schema {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SchemaIntegrationProps {
  storyId?: string;
  initialSchema?: Schema;
  onSchemaChange?: (schema: Schema) => void;
  readOnly?: boolean;
}

export default function SchemaIntegration({
  storyId,
  initialSchema,
  onSchemaChange,
  readOnly = false
}: SchemaIntegrationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [selectedEntityIndex, setSelectedEntityIndex] = useState<number>(0);
  const [showAddEntityDialog, setShowAddEntityDialog] = useState<boolean>(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Fetch schemas when component mounts
  useEffect(() => {
    const fetchSchemas = async () => {
      if (initialSchema) {
        setSchemas([initialSchema]);
        setSelectedSchema(initialSchema);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/schemas');
        
        if (!response.ok) {
          throw new Error('Failed to fetch schemas');
        }
        
        const data = await response.json();
        setSchemas(data.schemas || []);
        
        // If there's a storyId, try to get the specific schema for this story
        if (storyId) {
          const storyResponse = await fetch(`/api/stories/${storyId}/schema`);
          
          if (storyResponse.ok) {
            const storyData = await storyResponse.json();
            if (storyData.schema) {
              setSelectedSchema(storyData.schema);
            } else {
              // Default to the first schema if available
              setSelectedSchema(data.schemas?.[0] || null);
            }
          }
        } else if (data.schemas && data.schemas.length > 0) {
          // Default to the first schema if no storyId
          setSelectedSchema(data.schemas[0]);
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
        toast({
          title: 'Error',
          description: 'Failed to load schemas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchemas();
  }, [initialSchema, storyId, toast]);

  useEffect(() => {
    // Notify parent component when selected schema changes
    if (onSchemaChange && selectedSchema) {
      onSchemaChange(selectedSchema);
    }
  }, [selectedSchema, onSchemaChange]);

  // Handle schema selection
  const handleSchemaSelect = (schemaId: string) => {
    const schema = schemas.find(s => s.id === schemaId);
    if (schema) {
      setSelectedSchema(schema);
      setSelectedEntityIndex(0);
    }
  };

  // Save the selected schema for this story
  const saveSchemaForStory = async () => {
    if (!storyId || !selectedSchema) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/stories/${storyId}/schema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId: selectedSchema.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save schema for story');
      }
      
      toast({
        title: 'Success',
        description: 'Schema saved for this story',
      });
    } catch (error) {
      console.error('Error saving schema:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schema for this story',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new entity handlers
  const [newEntity, setNewEntity] = useState<Entity>({
    id: '',
    name: '',
    description: '',
    fields: []
  });

  const handleAddEntity = () => {
    if (!selectedSchema) return;
    
    // Validate entity
    if (!newEntity.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Entity name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const entityWithId: Entity = {
      ...newEntity,
      id: Date.now().toString(),
      fields: []
    };
    
    // Update the selected schema with the new entity
    const updatedSchema: Schema = {
      ...selectedSchema,
      entities: [...selectedSchema.entities, entityWithId],
    };
    
    // Update schemas state
    setSchemas(prev => 
      prev.map(schema => 
        schema.id === selectedSchema.id ? updatedSchema : schema
      )
    );
    
    // Update selected schema
    setSelectedSchema(updatedSchema);
    
    // Update selectedEntityIndex to the new entity
    setSelectedEntityIndex(updatedSchema.entities.length - 1);
    
    // Reset new entity form
    setNewEntity({
      id: '',
      name: '',
      description: '',
      fields: []
    });
    
    // Close dialog
    setShowAddEntityDialog(false);
    
    toast({
      title: 'Success',
      description: `Entity "${entityWithId.name}" added successfully`,
    });
  };

  // Add new field handlers
  const [newField, setNewField] = useState<EntityField>({
    id: '',
    name: '',
    type: 'string',
    required: false
  });

  const handleAddField = () => {
    if (!selectedSchema || selectedEntityIndex === null || selectedEntityIndex < 0) return;
    
    // Validate field
    if (!newField.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Field name is required',
        variant: 'destructive',
      });
      return;
    }
    
    const fieldWithId: EntityField = {
      ...newField,
      id: Date.now().toString(),
    };
    
    // Create a copy of the selected schema
    const updatedSchema = { ...selectedSchema };
    
    // Add the new field to the selected entity
    updatedSchema.entities[selectedEntityIndex].fields.push(fieldWithId);
    
    // Update schemas state
    setSchemas(prev => 
      prev.map(schema => 
        schema.id === selectedSchema.id ? updatedSchema : schema
      )
    );
    
    // Update selected schema
    setSelectedSchema(updatedSchema);
    
    // Reset new field form
    setNewField({
      id: '',
      name: '',
      type: 'string',
      required: false
    });
    
    // Close dialog
    setShowAddFieldDialog(false);
    
    toast({
      title: 'Success',
      description: `Field "${fieldWithId.name}" added successfully`,
    });
  };

  // Remove entity handler
  const handleRemoveEntity = (entityIndex: number) => {
    if (!selectedSchema) return;
    
    const updatedEntities = [...selectedSchema.entities];
    updatedEntities.splice(entityIndex, 1);
    
    const updatedSchema: Schema = {
      ...selectedSchema,
      entities: updatedEntities,
    };
    
    // Update schemas state
    setSchemas(prev => 
      prev.map(schema => 
        schema.id === selectedSchema.id ? updatedSchema : schema
      )
    );
    
    // Update selected schema
    setSelectedSchema(updatedSchema);
    
    // Update selectedEntityIndex if necessary
    if (entityIndex === selectedEntityIndex) {
      setSelectedEntityIndex(0);
    } else if (entityIndex < selectedEntityIndex) {
      setSelectedEntityIndex(selectedEntityIndex - 1);
    }
    
    toast({
      title: 'Success',
      description: 'Entity removed successfully',
    });
  };

  // Remove field handler
  const handleRemoveField = (entityIndex: number, fieldIndex: number) => {
    if (!selectedSchema) return;
    
    const updatedSchema = { ...selectedSchema };
    updatedSchema.entities[entityIndex].fields.splice(fieldIndex, 1);
    
    // Update schemas state
    setSchemas(prev => 
      prev.map(schema => 
        schema.id === selectedSchema.id ? updatedSchema : schema
      )
    );
    
    // Update selected schema
    setSelectedSchema(updatedSchema);
    
    toast({
      title: 'Success',
      description: 'Field removed successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema Integration</CardTitle>
          <CardDescription>
            Define the structure of your story entities like characters, locations, and events
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {schemas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No schemas available</p>
              {!readOnly && (
                <Button variant="outline" onClick={() => setShowAddEntityDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Schema
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 space-y-4">
                  <Label htmlFor="schema-select">Select Schema</Label>
                  <Select
                    value={selectedSchema?.id}
                    onValueChange={handleSchemaSelect}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSchema && (
                  <div className="col-span-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedSchema.name}</h3>
                        <p className="text-muted-foreground">{selectedSchema.description}</p>
                      </div>
                      
                      {storyId && !readOnly && (
                        <Button
                          onClick={saveSchemaForStory}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save for This Story'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedSchema && (
                <div className="mt-6">
                  <Tabs 
                    value={selectedSchema.entities[selectedEntityIndex]?.id || ''}
                    onValueChange={(value: string) => {
                      const index = selectedSchema.entities.findIndex(e => e.id === value);
                      if (index >= 0) {
                        setSelectedEntityIndex(index);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        {selectedSchema.entities.map((entity, index) => (
                          <TabsTrigger key={entity.id} value={entity.id}>
                            {entity.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {!readOnly && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddEntityDialog(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Entity
                        </Button>
                      )}
                    </div>
                    
                    {selectedSchema.entities.map((entity, entityIndex) => (
                      <TabsContent key={entity.id} value={entity.id}>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>{entity.name}</CardTitle>
                                <CardDescription>{entity.description}</CardDescription>
                              </div>
                              
                              {!readOnly && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRemoveEntity(entityIndex)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Remove Entity
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Fields</h4>
                                
                                {!readOnly && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEntity(entity);
                                      setShowAddFieldDialog(true);
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Field
                                  </Button>
                                )}
                              </div>
                              
                              {entity.fields.length === 0 ? (
                                <p className="text-muted-foreground italic">No fields defined</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {entity.fields.map((field, fieldIndex) => (
                                    <Card key={field.id}>
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center space-x-2">
                                              <h5 className="font-medium">{field.name}</h5>
                                              {field.required && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                  Required
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              Type: {field.type}
                                            </p>
                                            {field.description && (
                                              <p className="text-sm mt-1">{field.description}</p>
                                            )}
                                          </div>
                                          
                                          {!readOnly && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveField(entityIndex, fieldIndex)}
                                            >
                                              <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Entity Dialog */}
      <Dialog open={showAddEntityDialog} onOpenChange={setShowAddEntityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Entity</DialogTitle>
            <DialogDescription>
              Define a new entity for your story schema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Entity Name</Label>
              <Input
                id="entity-name"
                value={newEntity.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntity({ ...newEntity, name: e.target.value })}
                placeholder="Character, Location, Event, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entity-description">Description</Label>
              <Input
                id="entity-description"
                value={newEntity.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntity({ ...newEntity, description: e.target.value })}
                placeholder="Describe this entity type"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddEntityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntity}>Add Entity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Field Dialog */}
      <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>
              Define a new field for the {selectedEntity?.name} entity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                value={newField.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewField({ ...newField, name: e.target.value })}
                placeholder="name, age, description, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select
                value={newField.type}
                onValueChange={(value: string) => setNewField({ ...newField, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field-description">Description (optional)</Label>
              <Input
                id="field-description"
                value={newField.description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewField({ ...newField, description: e.target.value })}
                placeholder="Describe this field"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-required"
                checked={newField.required}
                onCheckedChange={(checked: boolean) => 
                  setNewField({ ...newField, required: checked })
                }
              />
              <Label htmlFor="field-required">Required Field</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
