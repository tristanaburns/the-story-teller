/**
 * Extension for NextRequest type
 * 
 * Extends the NextRequest interface from Next.js to include additional properties
 * used in our application.
 */

import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    /**
     * IP address of the request
     * This is used in logging to track client origins
     */
    ip?: string;
  }
} 