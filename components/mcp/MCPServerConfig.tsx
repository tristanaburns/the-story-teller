/**
 * MCP Server Configuration Component
 * 
 * Allows users to configure MCP server settings.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, ServerOff, Server, Check, X, XCircle, ServerCrash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

/**
 * Service type options for MCP servers
 */
export type ServiceType = 'memory' | 'generation' | 'embeddings' | 'image' | 'search' | 'other';

/**
 * Server status options
 */
export type ServerStatus = 'online' | 'offline' | 'unknown';

/**
 * Interface for MCP server configuration
 */
interface ServerConfig {
  id?: string;
  url: string;
  api_key: string;
  enabled: boolean;
  service_type: ServiceType;
  description?: string;
  status?: ServerStatus;
  lastChecked?: Date;
  name?: string;
  timeout?: number;
  type?: ServiceType;
  // Add any other specific properties here rather than using Record<string, any>
}

/**
 * Type for mapping server IDs to their configurations
 */
type ServerConfigs = Record<string, ServerConfig>;

/**
 * Interface for the MCPServerConfig component props
 */
interface MCPServerConfigProps {
  initialConfigs?: ServerConfigs;
}

/**
 * Props for the server configuration dialog
 */
interface EditServerDialogProps {
  serverConfig?: ServerConfig;
  serverType: ServiceType;
  onSave: (config: ServerConfig) => void;
  onCancel: () => void;
}

/**
 * Service type definition
 */
interface ServiceTypeOption {
  id: ServiceType;
  name: string;
}

export default function MCPServerConfig({ initialConfigs = {} }: MCPServerConfigProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [configs, setConfigs] = useState<ServerConfigs>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>('general');
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editingServer, setEditingServer] = useState<ServerConfig | undefined>(undefined);
  const [selectedServerType, setSelectedServerType] = useState<ServiceType>('memory');

  // Service types available for MCP servers
  const serviceTypes: ServiceTypeOption[] = [
    { id: 'memory', name: 'Memory Service' },
    { id: 'generation', name: 'Text Generation' },
    { id: 'embeddings', name: 'Embeddings' },
    { id: 'image', name: 'Image Generation' },
    { id: 'search', name: 'Search & Retrieval' },
    { id: 'other', name: 'Other Service' },
  ];
  
  // Load configurations on component mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true);
        
        if (Object.keys(initialConfigs).length > 0) {
          setConfigs(initialConfigs);
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/mcp/servers');
        
        if (!response.ok) {
          throw new Error('Failed to load server configurations');
        }
        
        const data = await response.json();
        setConfigs(data.servers || {});
      } catch (error) {
        console.error('Error loading configurations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load server configurations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadConfigs();
  }, [initialConfigs, toast]);
  
  // Save configurations to the backend
  const saveConfigs = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ servers: configs }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save server configurations');
      }
      
      toast({
        title: 'Success',
        description: 'Server configurations saved successfully',
      });
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to save server configurations',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Add a new server configuration
  const addServer = (type: ServiceType) => {
    const newId = `${type}_${Date.now()}`;
    setConfigs((prev) => ({
      ...prev,
      [newId]: {
        url: '',
        api_key: '',
        enabled: true,
        service_type: type,
        status: 'unknown',
      },
    }));
    
    // Switch to the tab for the new server type
    setActiveTab(type);
  };
  
  // Remove a server configuration
  const removeServer = (id: string) => {
    setConfigs((prev) => {
      const newConfigs = { ...prev };
      delete newConfigs[id];
      return newConfigs;
    });
  };
  
  // Update a server configuration field
  const updateServerField = (
    id: string, 
    field: keyof ServerConfig, 
    value: string | boolean | number
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };
  
  // Check if a server is online
  const checkServerStatus = async (id: string) => {
    try {
      setCheckingStatus((prev) => ({ ...prev, [id]: true }));
      
      const response = await fetch('/api/mcp/servers/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          server_id: id,
          url: configs[id].url,
          api_key: configs[id].api_key,
          service_type: configs[id].service_type,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Server check failed');
      }
      
      const result = await response.json();
      
      setConfigs((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: result.online ? 'online' : 'offline',
          lastChecked: new Date(),
        },
      }));
      
      toast({
        title: result.online ? 'Server Online' : 'Server Offline',
        description: result.message || `Server is ${result.online ? 'online' : 'offline'}`,
        variant: result.online ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error checking server status:', error);
      
      setConfigs((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'offline',
          lastChecked: new Date(),
        },
      }));
      
      toast({
        title: 'Error',
        description: 'Failed to check server status',
        variant: 'destructive',
      });
    } finally {
      setCheckingStatus((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Open the edit dialog for a server
  const editServer = (type: ServiceType, id: string) => {
    const typeConfigs = configs[type] || [];
    const serverConfig = typeConfigs.find(config => config.id === id);
    
    if (serverConfig) {
      setEditingServer(serverConfig);
      setSelectedServerType(type);
      setShowDialog(true);
    }
  };

  // Add a new server dialog trigger
  const openAddServerDialog = (type: ServiceType) => {
    setEditingServer(undefined);
    setSelectedServerType(type);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Server Configuration</CardTitle>
        <CardDescription>
          Configure MCP (Model Control Protocol) servers for AI services
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            {serviceTypes.map((type) => (
              <TabsTrigger 
                key={type.id}
                value={type.id}
                className="relative"
              >
                {type.name}
                {Object.entries(configs)
                  .filter(([_, config]) => config.service_type === type.id)
                  .length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Server Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                {serviceTypes.map((type) => {
                  const serversOfType = Object.entries(configs).filter(
                    ([_, config]) => config.service_type === type.id
                  );
                  
                  return (
                    <Card key={type.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{type.name}</CardTitle>
                        <CardDescription>
                          {serversOfType.length} server{serversOfType.length !== 1 ? 's' : ''} configured
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {serversOfType.filter(([_, cfg]) => cfg.enabled).length} active
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => addServer(type.id)}
                          >
                            Add Server
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          {serviceTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{type.name} Servers</h3>
                <Button onClick={() => addServer(type.id)}>Add New {type.name}</Button>
              </div>
              
              {Object.entries(configs)
                .filter(([_, config]) => config.service_type === type.id)
                .map(([id, config]) => (
                  <Card key={id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        {config.status === 'online' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {config.status === 'offline' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeServer(id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <CardTitle className="text-base truncate max-w-[70%]">
                        {config.url || 'New Server'}
                      </CardTitle>
                      <CardDescription>
                        {config.description || `Configure this ${type.name} server`}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${id}-url`}>Server URL</Label>
                          <Input
                            id={`${id}-url`}
                            value={config.url}
                            onChange={(e) => 
                              updateServerField(id, 'url', e.target.value)
                            }
                            placeholder="https://api.example.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${id}-api-key`}>API Key</Label>
                          <Input
                            id={`${id}-api-key`}
                            type="password"
                            value={config.api_key}
                            onChange={(e) => 
                              updateServerField(id, 'api_key', e.target.value)
                            }
                            placeholder="sk-xxxxxxxxxxxx"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${id}-description`}>Description (Optional)</Label>
                          <Input
                            id={`${id}-description`}
                            value={config.description || ''}
                            onChange={(e) => 
                              updateServerField(id, 'description', e.target.value)
                            }
                            placeholder="Production server"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-6">
                          <Label 
                            htmlFor={`${id}-enabled`}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              id={`${id}-enabled`}
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              checked={config.enabled}
                              onChange={(e) => 
                                updateServerField(id, 'enabled', e.target.checked)
                              }
                            />
                            <span>Enabled</span>
                          </Label>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => checkServerStatus(id)}
                            disabled={checkingStatus[id]}
                          >
                            {checkingStatus[id] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              'Check Connection'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="text-sm text-muted-foreground pt-0">
                      {config.lastChecked && (
                        <span>
                          Last checked: {new Date(config.lastChecked).toLocaleString()}
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              
              {Object.entries(configs).filter(
                ([_, config]) => config.service_type === type.id
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    No {type.name} servers configured yet
                  </p>
                  <Button onClick={() => addServer(type.id)}>
                    Add {type.name} Server
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveConfigs} 
          disabled={saving}
          className="ml-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configurations'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Server Configuration Item Component
interface ServerConfigItemProps {
  config: ServerConfig;
  type: ServiceType;
  onToggle: (type: ServiceType, id: string) => void;
  onEdit: (type: ServiceType, id: string) => void;
  onRemove: (type: ServiceType, id: string) => void;
}

function ServerConfigItem({ config, type, onToggle, onEdit, onRemove }: ServerConfigItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium">{config.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{config.url}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={`enabled-${config.id}`} className="text-sm">
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id={`enabled-${config.id}`}
                checked={config.enabled}
                onCheckedChange={() => onToggle(type, config.id)}
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(type, config.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(type, config.id)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Server Configuration Dialog Component
function ServerConfigDialog({ serverConfig, serverType, onSave, onCancel }: EditServerDialogProps) {
  const [config, setConfig] = useState<ServerConfig>({
    id: serverConfig?.id || '',
    name: serverConfig?.name || '',
    url: serverConfig?.url || '',
    api_key: serverConfig?.api_key || '',
    timeout: serverConfig?.timeout || 30000, // Default timeout: 30 seconds
    enabled: serverConfig?.enabled ?? true,   // Default enabled: true
    service_type: serverType,
    type: serverType,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {serverConfig ? 'Edit Server' : 'Add New Server'}
        </DialogTitle>
        <DialogDescription>
          {serverConfig 
            ? 'Update the configuration for this server'
            : `Configure a new ${serverType} server`
          }
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              name="name"
              value={config.name}
              onChange={handleChange}
              placeholder="Enter server name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">Server URL</Label>
            <Input
              id="url"
              name="url"
              value={config.url}
              onChange={handleChange}
              placeholder="https://example.com/api"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (ms)</Label>
            <Input
              id="timeout"
              name="timeout"
              type="number"
              min="1000"
              step="1000"
              value={config.timeout}
              onChange={handleChange}
              placeholder="30000"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              name="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, enabled: checked }))
              }
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </>
  );
}
