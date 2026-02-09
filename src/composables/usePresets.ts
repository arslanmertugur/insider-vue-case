import { ref } from 'vue';
import { nanoid } from 'nanoid';
import type { Preset, NotificationConfig } from '../types/notification';
import { getFromStorage, setToStorage, setStorageErrorCallback } from '../utils/storage';
import { PRESETS_STORAGE_KEY } from '../utils/constants';
import type { ErrorHandler } from './useErrorHandler';
import { useErrorHandler } from './useErrorHandler';

export function usePresets(errorHandler: ErrorHandler = useErrorHandler()) {
  const presets = ref<Preset[]>([]);
  const isLoading = ref(true);
  const hasError = ref(false);

  /**
   * Initialize storage error callback (runs immediately, not tied to component lifecycle)
   */
  const initializeStorageHandling = (): void => {
    setStorageErrorCallback(error => {
      hasError.value = true;

      // Show user-friendly error based on error type
      if (error.type === 'quota_exceeded') {
        errorHandler.showUserError(
          'Storage is full. Please delete some presets to free up space.',
          'Storage Full'
        );
      } else if (error.type === 'unavailable') {
        errorHandler.showUserError(
          'Unable to access browser storage. Presets cannot be saved.',
          'Storage Unavailable'
        );
      } else {
        errorHandler.handleError(new Error(error.message), 'storage');
      }
    });
  };

  /**
   * Load presets from storage
   */
  const loadPresets = (): void => {
    try {
      isLoading.value = true;
      hasError.value = false;
      presets.value = getFromStorage<Preset[]>(PRESETS_STORAGE_KEY, []);
    } catch (error) {
      hasError.value = true;
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to load presets'),
        'storage'
      );
      presets.value = []; // Fallback to empty array
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Save current configuration as a preset
   * Returns the created preset on success, null on failure
   */
  const savePreset = (name: string, config: Omit<NotificationConfig, 'id'>): Preset | null => {
    try {
      const preset: Preset = {
        id: nanoid(),
        name,
        config,
        createdAt: new Date().toISOString(),
      };

      const updatedPresets = [...presets.value, preset];
      const success = setToStorage(PRESETS_STORAGE_KEY, updatedPresets);

      if (success) {
        presets.value = updatedPresets;
        return preset;
      } else {
        // Error was already handled by storage callback
        return null;
      }
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to save preset'),
        'storage'
      );
      return null;
    }
  };

  /**
   * Load a preset by ID
   * Returns the preset config on success, null if not found or on error
   */
  const loadPreset = (id: string): Omit<NotificationConfig, 'id'> | null => {
    try {
      const preset = presets.value.find(p => p.id === id);

      if (!preset) {
        errorHandler.showUserError('Preset not found.', 'Load Error');
        return null;
      }

      return preset.config;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to load preset'),
        'storage'
      );
      return null;
    }
  };

  /**
   * Delete a preset
   * Returns true on success, false on failure
   */
  const deletePreset = (id: string): boolean => {
    try {
      const index = presets.value.findIndex(p => p.id === id);

      if (index === -1) {
        errorHandler.showUserError('Preset not found.', 'Delete Error');
        return false;
      }

      const updatedPresets = presets.value.filter(p => p.id !== id);
      const success = setToStorage(PRESETS_STORAGE_KEY, updatedPresets);

      if (success) {
        presets.value = updatedPresets;
        return true;
      } else {
        // Error was already handled by storage callback
        return false;
      }
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to delete preset'),
        'storage'
      );
      return false;
    }
  };

  /**
   * Get all presets
   */
  const getAllPresets = (): Preset[] => {
    return presets.value;
  };

  /**
   * Retry loading presets after an error
   */
  const retryLoad = (): void => {
    loadPresets();
  };

  // Eagerly initialize storage handling and load presets without waiting for component mount
  initializeStorageHandling();
  loadPresets();

  return {
    presets,
    isLoading,
    hasError,
    savePreset,
    loadPreset,
    deletePreset,
    getAllPresets,
    retryLoad,
  };
}
