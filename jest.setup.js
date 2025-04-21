// Add Jest specific setup code
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  }
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: { user: { id: 'test-user-id', name: 'Test User' } },
      status: 'authenticated'
    };
  },
  signIn: jest.fn(),
  signOut: jest.fn()
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  map: jest.fn().mockReturnValue({
    setView: jest.fn().mockReturnThis(),
    on: jest.fn(),
    invalidateSize: jest.fn(),
    remove: jest.fn()
  }),
  tileLayer: jest.fn().mockReturnValue({
    addTo: jest.fn()
  }),
  marker: jest.fn().mockReturnValue({
    addTo: jest.fn(),
    setLatLng: jest.fn()
  })
}), { virtual: true });

// Mock fetch
global.fetch = jest.fn();

// Mock performance
global.performance = {
  ...global.performance,
  now: jest.fn().mockReturnValue(123456789)
};

// Create a mock for ResizeObserver
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserverMock; 