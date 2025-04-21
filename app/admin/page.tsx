import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createLogger } from '@/lib/logging';

// Create a server logger
const logger = createLogger('AdminDashboardPage');

export const metadata = {
  title: 'Admin Dashboard | The Story Teller',
  description: 'Administrative dashboard for The Story Teller application'
};

/**
 * Admin dashboard page
 */
export default async function AdminDashboardPage() {
  // Session check is handled by the layout, but we need it here for user information
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logger.warn('Unauthenticated user attempted to access admin dashboard');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  // Check if user has admin role
  const isAdmin = session.user.roles?.includes('admin') || false;
  
  if (!isAdmin) {
    logger.warn('Non-admin user attempted to access admin dashboard', {
      userId: session.user.id
    });
    redirect('/dashboard');
  }
  
  logger.info('Admin accessed admin dashboard', {
    userId: session.user.id
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Logs Card */}
        <Link href="/admin/logs">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                View and analyze application logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Monitor system performance, track errors, and diagnose issues through comprehensive logging.</p>
              <div className="mt-4 text-sm text-blue-600">Access logs →</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* User Management Card */}
        <Link href="/admin/users">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>View, edit, and manage user accounts, roles, and permissions across the application.</p>
              <div className="mt-4 text-sm text-blue-600">Manage users →</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* System Settings Card */}
        <Link href="/admin/settings">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Adjust system configuration, manage feature flags, and control global application settings.</p>
              <div className="mt-4 text-sm text-blue-600">Adjust settings →</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* MCP Servers Card */}
        <Link href="/admin/mcp">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>MCP Servers</CardTitle>
              <CardDescription>
                Manage Model Context Protocol servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Monitor, configure, and manage MCP servers including Memory, Everart, Sequential Thinking, and MongoDB Atlas.</p>
              <div className="mt-4 text-sm text-blue-600">Manage MCP servers →</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Database Management Card */}
        <Link href="/admin/database">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage MongoDB Atlas databases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Monitor database performance, manage indexes, and perform maintenance operations on MongoDB Atlas.</p>
              <div className="mt-4 text-sm text-blue-600">Manage databases →</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* System Analytics Card */}
        <Link href="/admin/analytics">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                View application performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analyze application usage, performance metrics, and user engagement statistics.</p>
              <div className="mt-4 text-sm text-blue-600">View analytics →</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
