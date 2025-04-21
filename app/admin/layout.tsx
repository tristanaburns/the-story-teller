import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { createLogger } from '@/lib/logging';

// Create a server logger
const logger = createLogger('AdminLayout');

/**
 * Admin section layout with navigation
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logger.warn('Unauthenticated user attempted to access admin section');
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  // Check if user has admin role
  const isAdmin = session.user.roles?.includes('admin') || false;
  
  if (!isAdmin) {
    logger.warn('Non-admin user attempted to access admin section', {
      userId: session.user.id
    });
    redirect('/dashboard');
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Admin Header */}
      <header className="border-b bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-sm hover:text-gray-300"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold">Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">
                Logged in as {session.user.name || session.user.email}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Admin Navigation and Content */}
      <div className="flex flex-grow">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r p-4 bg-slate-50">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="block p-2 rounded hover:bg-slate-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/logs" 
                className="block p-2 rounded hover:bg-slate-200"
              >
                System Logs
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="block p-2 rounded hover:bg-slate-200"
              >
                User Management
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className="block p-2 rounded hover:bg-slate-200"
              >
                System Settings
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/mcp" 
                className="block p-2 rounded hover:bg-slate-200"
              >
                MCP Servers
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Main Content */}
        <main className="flex-grow p-6 bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
