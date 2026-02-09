import { usePresets } from '../usePresets';
import type { NotificationConfig, NotificationType } from '../../types/notification';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePresets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save a preset', () => {
    const { savePreset, presets } = usePresets();

    const config: Omit<NotificationConfig, 'id'> = {
      type: 'success' as NotificationType,
      title: 'Success',
      message: 'Success message',
      duration: 3000,
      position: 'top-right',
      animation: 'slide',
      backgroundColor: '#22C55E',
      textColor: '#FFFFFF',
      showIcon: true,
      showCloseButton: true,
    };

    const preset = savePreset('My Preset', config);

    expect(preset).toBeDefined();
    expect(preset!.name).toBe('My Preset');
    expect(presets.value).toHaveLength(1);
    expect(presets.value[0]!.config.title).toBe('Success');
  });

  test('should load a preset by ID', () => {
    const { savePreset, loadPreset } = usePresets();

    const config: Omit<NotificationConfig, 'id'> = {
      type: 'error' as NotificationType,
      title: 'Error',
      message: 'Error message',
      duration: 5000,
      position: 'bottom-left',
      animation: 'slide',
      backgroundColor: '#EF4444',
      textColor: '#FFFFFF',
      showIcon: false,
      showCloseButton: true,
    };

    const preset = savePreset('Error Preset', config);
    const loadedConfig = loadPreset(preset!.id);

    expect(loadedConfig).not.toBeNull();
    expect(loadedConfig?.title).toBe('Error');
    expect(loadedConfig?.showIcon).toBe(false);
  });

  test('should delete a preset', () => {
    const { savePreset, deletePreset, presets } = usePresets();

    const config: Omit<NotificationConfig, 'id'> = {
      type: 'warning' as NotificationType,
      title: 'Warning',
      message: 'Warning message',
      duration: 4000,
      position: 'top-left',
      animation: 'slide',
      backgroundColor: '#F59E0B',
      textColor: '#FFFFFF',
      showIcon: true,
      showCloseButton: true,
    };

    const preset = savePreset('Warning Preset', config);
    expect(presets.value).toHaveLength(1);

    deletePreset(preset!.id);
    expect(presets.value).toHaveLength(0);
  });

  test('should persist presets in localStorage', () => {
    const { savePreset } = usePresets();

    const config: Omit<NotificationConfig, 'id'> = {
      type: 'info' as NotificationType,
      title: 'Info',
      message: 'Info message',
      duration: 2000,
      position: 'bottom-right',
      animation: 'slide',
      backgroundColor: '#6366F1',
      textColor: '#FFFFFF',
      showIcon: true,
      showCloseButton: false,
    };

    savePreset('Info Preset', config);

    const stored = localStorage.getItem('toast-notification-presets');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Info Preset');
  });
});
