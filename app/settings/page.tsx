'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useLogger } from '@/lib/hooks/useLogger';

interface UserSettings {
  displayName: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
  editorFontSize: number;
  enableAIFeatures: boolean;
  enableEmailNotifications: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  mcpServers: {
    memory: boolean;
    art: boolean;
    thinking: boolean;
    database: boolean;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const logger = useLogger('UserSettings');
  
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    theme: 'system',
    editorFontSize: 16,
    enableAIFeatures: true,
    enableEmailNotifications: false,
    logLevel: 'info',
    mcpServers: {
      memory: true,
      art: true,
      thinking: true,
      database: true,
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user) {
      // Fetch user settings from API
      const fetchSettings = async () => {
        try {
          logger.info('Loading user settings');
          setIsLoading(true);
          
          // Normally we would fetch from API
          // const response = await fetch('/api/settings');
          // const data = await response.json();
          
          // For now, use mock data
          const data: UserSettings = {
            displayName: session?.user?.name || 'User',
            email: session?.user?.email || 'user@example.com',
            theme: 'system', // Use a valid theme value from the enum
            editorFontSize: 16,
            enableAIFeatures: true,
            enableEmailNotifications: false,
            logLevel: 'info',
            mcpServers: {
              memory: true,
              art: true,
              thinking: true,
              database: true,
            }
          };
          
          setSettings(data);
          logger.info('Settings loaded successfully');
        } catch (error) {
          logger.error('Failed to load settings', { error });
          toast.error('Failed to load settings');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSettings();
    }
  }, [session, status, router, logger]);
  
  const handleSaveSettings = async () => {
    try {
      logger.info('Saving user settings');
      setIsSaving(true);
      
      // This would be replaced with an actual API call
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
      logger.info('Settings saved successfully');
    } catch (error) {
      logger.error('Failed to save settings', { error });
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (key: keyof UserSettings, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };
  
  const handleMCPToggle = (server: keyof UserSettings['mcpServers'], value: boolean) => {
    setSettings({
      ...settings,
      mcpServers: {
        ...settings.mcpServers,
        [server]: value,
      },
    });
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="mcp">MCP Integration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={settings.email}
                  disabled
                  placeholder="Your email address"
                />
                <p className="text-sm text-muted-foreground">
                  Email is managed by your authentication provider.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how The Story Teller looks for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex items-center space-x-4">
                  <TabsList>
                    <TabsTrigger
                      value="light"
                      onClick={() => handleInputChange('theme', 'light')}
                      className={settings.theme === 'light' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Light
                    </TabsTrigger>
                    <TabsTrigger
                      value="dark"
                      onClick={() => handleInputChange('theme', 'dark')}
                      className={settings.theme === 'dark' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Dark
                    </TabsTrigger>
                    <TabsTrigger
                      value="system"
                      onClick={() => handleInputChange('theme', 'system')}
                      className={settings.theme === 'system' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      System
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Editor Settings</CardTitle>
              <CardDescription>
                Customize your writing environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editorFontSize">Font Size</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="editorFontSize"
                    type="number"
                    min={12}
                    max={24}
                    value={settings.editorFontSize}
                    onChange={(e) => handleInputChange('editorFontSize', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span>pixels</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAIFeatures">Enable AI Features</Label>
                  <Switch
                    id="enableAIFeatures"
                    checked={settings.enableAIFeatures}
                    onCheckedChange={(checked) => handleInputChange('enableAIFeatures', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable AI-assisted writing suggestions and tools.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                  <Switch
                    id="enableEmailNotifications"
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleInputChange('enableEmailNotifications', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="mcp">
          <Card>
            <CardHeader>
              <CardTitle>MCP Server Integration</CardTitle>
              <CardDescription>
                Configure which Model Context Protocol servers to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mcpMemory">Memory MCP Server</Label>
                    <p className="text-sm text-muted-foreground">
                      Provides contextual memory and information retrieval.
                    </p>
                  </div>
                  <Switch
                    id="mcpMemory"
                    checked={settings.mcpServers.memory}
                    onCheckedChange={(checked) => handleMCPToggle('memory', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mcpArt">Everart MCP Server</Label>
                    <p className="text-sm text-muted-foreground">
                      Provides artwork generation and styling capabilities.
                    </p>
                  </div>
                  <Switch
                    id="mcpArt"
                    checked={settings.mcpServers.art}
                    onCheckedChange={(checked) => handleMCPToggle('art', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mcpThinking">Sequential Thinking MCP Server</Label>
                    <p className="text-sm text-muted-foreground">
                      Provides step-by-step reasoning capabilities.
                    </p>
                  </div>
                  <Switch
                    id="mcpThinking"
                    checked={settings.mcpServers.thinking}
                    onCheckedChange={(checked) => handleMCPToggle('thinking', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mcpDatabase">MongoDB Atlas MCP Server</Label>
                    <p className="text-sm text-muted-foreground">
                      Provides advanced database operations.
                    </p>
                  </div>
                  <Switch
                    id="mcpDatabase"
                    checked={settings.mcpServers.database}
                    onCheckedChange={(checked) => handleMCPToggle('database', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced settings for The Story Teller.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <div className="flex items-center space-x-4">
                  <TabsList>
                    <TabsTrigger
                      value="error"
                      onClick={() => handleInputChange('logLevel', 'error')}
                      className={settings.logLevel === 'error' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Error
                    </TabsTrigger>
                    <TabsTrigger
                      value="warn"
                      onClick={() => handleInputChange('logLevel', 'warn')}
                      className={settings.logLevel === 'warn' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Warning
                    </TabsTrigger>
                    <TabsTrigger
                      value="info"
                      onClick={() => handleInputChange('logLevel', 'info')}
                      className={settings.logLevel === 'info' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="debug"
                      onClick={() => handleInputChange('logLevel', 'debug')}
                      className={settings.logLevel === 'debug' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Debug
                    </TabsTrigger>
                  </TabsList>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set the level of detail for application logs. Higher levels may impact performance.
                </p>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Data Management</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button variant="outline">Export All Data</Button>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
