import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LogVisualizationDashboard from '@/components/logging/LogVisualizationDashboard';
import { createLogger } from '@/lib/logging';

// Create a server logger
const logger = createLogger('AdminLogsPage');

export const metadata = {
  title: 'Logs Dashboard | The Story Teller Admin',
  description: 'System logs visualization and management'
};

/**
 * Logs visualization dashboard page for administrators
 */
export default async function LogsPage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logger.warn('Unauthenticated user attempted to access logs dashboard');
    redirect('/auth/signin?callbackUrl=/admin/logs');
  }
  
  // Check if user has admin role
  const isAdmin = session.user.roles?.includes('admin') || false;
  
  if (!isAdmin) {
    logger.warn('Non-admin user attempted to access logs dashboard', {
      userId: session.user.id
    });
    redirect('/dashboard');
  }
  
  logger.info('Admin accessed logs dashboard', {
    userId: session.user.id
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Logs Dashboard</h1>
      </div>
      
      <LogVisualizationDashboard isAdmin={isAdmin} />
    </div>
  );
}
