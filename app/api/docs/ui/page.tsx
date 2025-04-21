'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogger } from '@/lib/hooks';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false }
);

// Import Swagger CSS
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const { data: session, status } = useSession();
  const [apiSpec, setApiSpec] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger('ApiDocs');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      logger.warn('Unauthenticated user attempted to access API docs');
      redirect('/auth/signin');
    }

    // Fetch API specification
    const fetchApiSpec = async () => {
      try {
        logger.info('Fetching API specification');
        setIsLoading(true);
        const response = await fetch('/api/docs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API specification: ${response.statusText}`);
        }
        
        const data = await response.json();
        setApiSpec(data);
        logger.info('API specification fetched successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching API spec';
        logger.error('Failed to fetch API specification', { error: errorMessage });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchApiSpec();
    }
  }, [status, logger]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading API Documentation...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading API Documentation</CardTitle>
            <CardDescription className="text-red-600">
              There was a problem fetching the API specification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">The Story Teller API Documentation</h1>
      
      <Tabs defaultValue="swagger">
        <TabsList className="mb-8">
          <TabsTrigger value="swagger">Swagger UI</TabsTrigger>
          <TabsTrigger value="overview">API Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="swagger">
          {apiSpec && (
            <div className="swagger-container border rounded-lg overflow-hidden">
              <SwaggerUI spec={apiSpec} />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                The Story Teller API provides programmatic access to all features of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Base URL</h3>
                <p className="text-sm text-muted-foreground">
                  All API endpoints are relative to the base URL:
                </p>
                <div className="bg-muted p-2 rounded-lg">
                  <code>https://thestoryteller.vercel.app/api</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Available Resources</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-medium">/stories</span> - Manage story metadata and content
                  </li>
                  <li>
                    <span className="font-medium">/stories/{'{storyId}'}/characters</span> - Manage characters within stories
                  </li>
                  <li>
                    <span className="font-medium">/stories/{'{storyId}'}/locations</span> - Manage locations within stories
                  </li>
                  <li>
                    <span className="font-medium">/stories/{'{storyId}'}/timeline</span> - Manage timeline events within stories
                  </li>
                  <li>
                    <span className="font-medium">/settings</span> - Manage user settings
                  </li>
                  <li>
                    <span className="font-medium">/ai</span> - Generate content using AI
                  </li>
                  <li>
                    <span className="font-medium">/mcp</span> - Interact with MCP servers
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Response Format</h3>
                <p className="text-sm text-muted-foreground">
                  All API responses are returned in JSON format. Successful responses typically include:
                </p>
                <div className="bg-muted p-2 rounded-lg">
                  <pre>
{`{
  "data": { /* Response data */ },
  "success": true
}`}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Error responses include:
                </p>
                <div className="bg-muted p-2 rounded-lg">
                  <pre>
{`{
  "error": "Error message",
  "details": { /* Optional additional error details */ }
}`}
                  </pre>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  API requests are limited to 100 requests per minute per user. If you exceed this limit,
                  you will receive a 429 Too Many Requests response.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                The Story Teller API uses NextAuth.js for authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Session-Based Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Authentication is handled through HTTP cookies. When you sign in to the application,
                  a session cookie is set that is automatically included with all API requests.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Authentication Flow</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>User signs in via Google or GitHub OAuth</li>
                  <li>NextAuth.js sets a secure session cookie</li>
                  <li>API requests include this cookie automatically</li>
                  <li>The server validates the session for each API request</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Unauthorized Access</h3>
                <p className="text-sm text-muted-foreground">
                  If you attempt to access an API endpoint without a valid session, you will receive a 401 Unauthorized response:
                </p>
                <div className="bg-muted p-2 rounded-lg">
                  <pre>
{`{
  "error": "Unauthorized"
}`}
                  </pre>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Session Expiration</h3>
                <p className="text-sm text-muted-foreground">
                  Sessions expire after 30 days of inactivity. If your session expires, you will need to sign in again.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">API Key Authentication (MCP Servers)</h3>
                <p className="text-sm text-muted-foreground">
                  When integrating with MCP servers, API key authentication is used. The API key must be included in the
                  Authorization header of the request.
                </p>
                <div className="bg-muted p-2 rounded-lg">
                  <pre>
{`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
