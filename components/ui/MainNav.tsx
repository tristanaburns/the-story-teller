'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLogger } from '@/lib/hooks';

export default function MainNav() {
  const logger = useLogger('MainNav');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Log component initialization
  useEffect(() => {
    logger.debug('MainNav initialized');
    
    return () => {
      logger.debug('MainNav unmounted');
    };
  }, [logger]);
  
  // Log path changes
  useEffect(() => {
    logger.debug(`Path changed to: ${pathname}`);
  }, [pathname, logger]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
    { name: 'My Stories', href: '/stories', active: pathname.startsWith('/stories') && pathname !== '/stories/new' },
    { name: 'Create New', href: '/stories/new', active: pathname === '/stories/new' },
    { name: 'MCP Status', href: '/dashboard/mcp', active: pathname === '/dashboard/mcp' }
  ];

  const toggleMenu = () => {
    logger.debug(`Mobile menu toggle: ${!isMenuOpen ? 'open' : 'close'}`);
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleSignOut = () => {
    logger.info('User signing out');
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-gray-900 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-white text-xl font-bold">The Story Teller</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    item.active
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="flex flex-col mr-3 text-right">
                  <span className="text-sm font-medium text-white">{session?.user?.name}</span>
                  <span className="text-xs text-gray-400">{session?.user?.email}</span>
                </div>
                {session?.user?.image && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                  />
                )}
                <Link
                  href="/settings"
                  className={`ml-4 px-3 py-1 text-sm rounded-md ${
                    pathname === '/settings'
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-3 py-1 text-sm text-gray-300 rounded-md hover:bg-white/10"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  item.active
                    ? 'bg-blue-900/30 border-blue-500 text-blue-100'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              {session?.user?.image && (
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                  />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-white">{session?.user?.name}</div>
                <div className="text-sm font-medium text-gray-400">{session?.user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/settings"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/settings'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                } w-full text-left`}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 w-full text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}