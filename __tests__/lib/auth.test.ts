import { authOptions } from '@/lib/auth';
import { createUserDb } from '@/lib/user-db';

// Mock dependencies
jest.mock('@/lib/mongodb', () => ({
  clientPromise: Promise.resolve({
    connect: jest.fn(),
  }),
}));

jest.mock('@/lib/user-db', () => ({
  createUserDb: jest.fn(),
}));

jest.mock('next-auth/providers/google', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({ id: 'google', name: 'Google' })),
  };
});

jest.mock('next-auth/providers/github', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({ id: 'github', name: 'GitHub' })),
  };
});

jest.mock('@auth/mongodb-adapter', () => ({
  MongoDBAdapter: jest.fn(() => ({ type: 'mongodb' })),
}));

// Set environment variables for testing
beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.GOOGLE_CLIENT_ID = 'google-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
  process.env.GITHUB_ID = 'github-id';
  process.env.GITHUB_SECRET = 'github-secret';
  
  jest.clearAllMocks();
});

describe('Auth Configuration', () => {
  it('should have the correct providers configured', () => {
    expect(authOptions.providers).toHaveLength(2);
    expect(authOptions.providers[0]).toEqual({ id: 'google', name: 'Google' });
    expect(authOptions.providers[1]).toEqual({ id: 'github', name: 'GitHub' });
  });
  
  it('should have MongoDB adapter configured', () => {
    expect(authOptions.adapter).toEqual({ type: 'mongodb' });
  });
  
  it('should have custom pages configured', () => {
    expect(authOptions.pages).toEqual({
      signIn: '/auth/signin',
    });
  });
  
  it('should have secret configured from environment variables', () => {
    expect(authOptions.secret).toBe('test-secret');
  });
  
  it('should create user database on sign in', async () => {
    const user = { id: 'user-123', email: 'test@example.com' };
    const signInCallback = authOptions.callbacks?.signIn;
    
    // Call the signIn callback
    const result = await signInCallback?.({ user, account: null, profile: null } as any);
    
    // Verify createUserDb was called
    expect(createUserDb).toHaveBeenCalledWith('user-123');
    expect(result).toBe(true);
  });
  
  it('should not create user database when email is missing', async () => {
    const user = { id: 'user-123', email: null };
    const signInCallback = authOptions.callbacks?.signIn;
    
    // Call the signIn callback
    const result = await signInCallback?.({ user, account: null, profile: null } as any);
    
    // Verify createUserDb was not called
    expect(createUserDb).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
  
  it('should add user ID to session', async () => {
    const session = { user: { name: 'Test User' } };
    const user = { id: 'user-123' };
    const sessionCallback = authOptions.callbacks?.session;
    
    // Call the session callback
    const result = await sessionCallback?.({ session, user } as any);
    
    // Verify user ID was added to session
    expect(result?.user).toEqual({
      name: 'Test User',
      id: 'user-123',
    });
  });
  
  it('should not modify session when user is missing', async () => {
    const session = { user: null };
    const user = { id: 'user-123' };
    const sessionCallback = authOptions.callbacks?.session;
    
    // Call the session callback
    const result = await sessionCallback?.({ session, user } as any);
    
    // Verify session was returned unchanged
    expect(result).toEqual({ user: null });
  });
}); 