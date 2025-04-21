/**
 * API Test Helpers
 * 
 * This file contains helper functions for API testing
 */

import { NextRequest } from 'next/server';
import { type RouteMatcher } from 'next/dist/server/future/route-matcher/route-matcher';
import supertest from 'supertest';
import { getServerSession } from 'next-auth/next';

/**
 * Creates a mock NextRequest for testing API routes
 * @param method HTTP method
 * @param url Request URL
 * @param body Request body
 * @param headers Request headers
 * @returns Mock NextRequest
 */
export function createMockRequest(
  method: string,
  url: string,
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  const bodyText = body ? JSON.stringify(body) : undefined;
  
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: bodyText ? bodyText : undefined,
  });
}

/**
 * Mock session for testing authenticated API routes
 * @param authenticated Whether to return an authenticated session
 * @param email Custom email for the user
 * @returns Mock session or null
 */
export function mockSession(authenticated = true, email = 'test@example.com') {
  // Mock the getServerSession result
  (getServerSession as jest.Mock).mockImplementation(() => {
    if (authenticated) {
      return Promise.resolve({
        user: {
          name: 'Test User',
          email,
          image: 'https://example.com/avatar.png',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    return Promise.resolve(null);
  });
}

/**
 * Creates a mock MongoDB document with an _id field
 * @param data Document data
 * @returns Document with _id
 */
export function createMockDocument<T>(data: T): T & { _id: string } {
  return {
    ...data,
    _id: Math.random().toString(36).substring(2, 15),
  };
}

/**
 * Creates an array of mock documents
 * @param count Number of documents to create
 * @param factory Factory function to create each document
 * @returns Array of mock documents
 */
export function createMockDocuments<T>(
  count: number,
  factory: (index: number) => T
): Array<T & { _id: string }> {
  return Array.from({ length: count }).map((_, index) => createMockDocument(factory(index)));
}

/**
 * Type for testing API routes
 */
export type ApiRouteTest = {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: (req: NextRequest) => Promise<Response>;
  matcher?: RouteMatcher;
};

/**
 * Utility to test a Next.js API route handler with Supertest-like interface
 * 
 * This allows us to test API handlers directly without spinning up a server
 */
export function testApiRoute(routeTest: ApiRouteTest) {
  const { handler, method } = routeTest;
  
  return {
    /**
     * Send a request to the route handler
     * @param url URL to send request to
     * @param body Optional request body
     * @param headers Optional request headers
     * @returns Promise that resolves to the handler's response
     */
    async send(url: string, body?: any, headers: Record<string, string> = {}) {
      const req = createMockRequest(method.toUpperCase(), url, body, headers);
      const res = await handler(req);
      
      let responseBody: any;
      try {
        responseBody = await res.json();
      } catch (e) {
        responseBody = null;
      }
      
      return {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseBody,
      };
    },
  };
}
