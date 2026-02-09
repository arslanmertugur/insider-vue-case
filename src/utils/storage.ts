/**
 * Type-safe localStorage wrapper utilities with enhanced error handling
 */

export interface StorageError {
  type: 'quota_exceeded' | 'unavailable' | 'parse_error' | 'unknown';
  message: string;
  key: string;
  originalError?: Error;
}

export type StorageErrorCallback = (error: StorageError) => void;

let errorCallback: StorageErrorCallback | null = null;

/**
 * Set a global error callback for storage operations
 * This allows components to show user-friendly error messages
 */
export function setStorageErrorCallback(callback: StorageErrorCallback | null): void {
  errorCallback = callback;
}

/**
 * Create a storage error object
 */
function createStorageError(type: StorageError['type'], key: string, error: Error): StorageError {
  return {
    type,
    message: error.message,
    key,
    originalError: error,
  };
}

/**
 * Handle storage errors consistently
 */
function handleStorageError(error: StorageError): void {
  console.error(`[Storage Error] ${error.type} for key "${error.key}":`, error.originalError);

  if (errorCallback) {
    errorCallback(error);
  }
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item from localStorage with type safety and error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) {
    const error = createStorageError(
      'unavailable',
      key,
      new Error('localStorage is not available (private browsing mode?)')
    );
    handleStorageError(error);
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    const storageError = createStorageError(
      'parse_error',
      key,
      error instanceof Error ? error : new Error(String(error))
    );
    handleStorageError(storageError);
    return defaultValue;
  }
}

/**
 * Set item to localStorage with error handling
 * Returns true if successful, false otherwise
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) {
    const error = createStorageError(
      'unavailable',
      key,
      new Error('localStorage is not available (private browsing mode?)')
    );
    handleStorageError(error);
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    // Check if it's a quota exceeded error
    const isQuotaError =
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    const storageError = createStorageError(
      isQuotaError ? 'quota_exceeded' : 'unknown',
      key,
      error instanceof Error ? error : new Error(String(error))
    );
    handleStorageError(storageError);
    return false;
  }
}

/**
 * Remove item from localStorage with error handling
 * Returns true if successful, false otherwise
 */
export function removeFromStorage(key: string): boolean {
  if (!isStorageAvailable()) {
    const error = createStorageError(
      'unavailable',
      key,
      new Error('localStorage is not available (private browsing mode?)')
    );
    handleStorageError(error);
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    const storageError = createStorageError(
      'unknown',
      key,
      error instanceof Error ? error : new Error(String(error))
    );
    handleStorageError(storageError);
    return false;
  }
}

/**
 * Clear all items from localStorage with error handling
 * Returns true if successful, false otherwise
 */
export function clearStorage(): boolean {
  if (!isStorageAvailable()) {
    const error = createStorageError(
      'unavailable',
      '',
      new Error('localStorage is not available (private browsing mode?)')
    );
    handleStorageError(error);
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    const storageError = createStorageError(
      'unknown',
      '',
      error instanceof Error ? error : new Error(String(error))
    );
    handleStorageError(storageError);
    return false;
  }
}
