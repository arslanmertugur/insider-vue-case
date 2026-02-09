import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage,
  setStorageErrorCallback,
} from '../storage';

// Helper to mock localStorage availability and errors
const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(k => delete store[k]);
    }),
  } as unknown as Storage;

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

const createQuotaError = () =>
  new DOMException('Quota exceeded', 'QuotaExceededError') as unknown as DOMException;

describe('storage utils', () => {
  const originalLocalStorage = window.localStorage;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setStorageErrorCallback(null);
    consoleErrorSpy.mockRestore();
  });

  test('returns default when storage unavailable and invokes callback', () => {
    const errorSpy = jest.fn();
    setStorageErrorCallback(errorSpy);
    const unavailable = {
      setItem: jest.fn(() => {
        throw new Error('unavailable');
      }),
      removeItem: jest.fn(),
      getItem: jest.fn(),
      clear: jest.fn(),
    } as unknown as Storage;

    Object.defineProperty(window, 'localStorage', {
      value: unavailable,
      writable: true,
    });

    const result = getFromStorage('key', 'fallback');

    expect(result).toBe('fallback');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'unavailable', key: 'key' })
    );
  });

  test('handles quota exceeded error on set', () => {
    const ls = mockLocalStorage();
    const errorSpy = jest.fn();
    setStorageErrorCallback(errorSpy);

    let call = 0;
    ls.setItem = jest.fn(() => {
      call += 1;
      // first call used by availability check, second is real set
      if (call > 1) {
        throw createQuotaError();
      }
    });

    const success = setToStorage('key', { foo: 'bar' });

    expect(success).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'quota_exceeded', key: 'key' })
    );
  });

  test('handles parse error on get', () => {
    const ls = mockLocalStorage();
    const errorSpy = jest.fn();
    setStorageErrorCallback(errorSpy);

    ls.getItem = jest.fn(() => '{bad json');

    const result = getFromStorage('key', { fallback: true });

    expect(result).toEqual({ fallback: true });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'parse_error', key: 'key' })
    );
  });

  test('removeFromStorage returns false when unavailable', () => {
    setStorageErrorCallback(jest.fn());
    const unavailable = {
      setItem: jest.fn(() => {
        throw new Error('unavailable');
      }),
      removeItem: jest.fn(() => {
        throw new Error('unavailable');
      }),
      clear: jest.fn(),
      getItem: jest.fn(),
    } as unknown as Storage;

    Object.defineProperty(window, 'localStorage', {
      value: unavailable,
      writable: true,
    });

    const success = removeFromStorage('key');
    expect(success).toBe(false);
  });

  test('clearStorage returns true when clear succeeds', () => {
    const ls = mockLocalStorage();
    const success = clearStorage();

    expect(success).toBe(true);
    expect(ls.clear).toHaveBeenCalled();
  });
});
