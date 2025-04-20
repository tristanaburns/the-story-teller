import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define which paths require authentication
  const isProtectedPath = path.startsWith('/dashboard') || 
                          path.startsWith('/stories') && !path.startsWith('/stories/public');
  
  // Define public paths where authenticated users should be redirected away from
  const isAuthPath = path === '/auth/signin';
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to sign in page
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  return NextResponse.next();
}