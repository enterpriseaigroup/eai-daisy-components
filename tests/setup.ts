import '@testing-library/jest-dom';
import { expect, jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console messages
  // log: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock window.matchMedia for tests that use responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock logging utilities
jest.mock('@/utils/logging', () => ({
  getGlobalLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  }),
  initializeLogging: jest.fn(),
  shutdownLogging: jest.fn(),
  createLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  }),
  createSimpleLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  }),
}));

// Set up testing environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Custom matchers for better testing experience
expect.extend({
  toBeTypeOf(
    received: unknown,
    expectedType: string,
  ): jest.CustomMatcherResult {
    const actualType = typeof received;
    const pass = actualType === expectedType;

    return {
      message: (): string =>
        `expected ${received} to be of type ${expectedType}, but got ${actualType}`,
      pass,
    };
  },
});

// Declare custom matcher types
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeTypeOf(expectedType: string): R;
  }
}

// Export test utilities for reuse
export const createMockComponent = (name: string) => {
  const MockComponent = ({ children, ...props }: any) => {
    return {
      type: 'div',
      props: {
        'data-testid': `mock-${name.toLowerCase()}`,
        ...props,
        children,
      },
    };
  };
  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};

export const createMockFunction = <T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>,
) => {
  return jest.fn().mockReturnValue(returnValue);
};

export const createMockPromise = <T>(resolveValue?: T, rejectValue?: Error) => {
  if (rejectValue) {
    return Promise.reject(rejectValue);
  }
  return Promise.resolve(resolveValue);
};
