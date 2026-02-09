import type { NotificationType } from '../types/notification';
import type { AnimationType } from '../types/notification';

/**
 * Default colors for each notification type
 */
export const DEFAULT_COLORS: Record<NotificationType, { bg: string; text: string }> = {
  success: {
    bg: '#10B981',
    text: '#FFFFFF',
  },
  error: {
    bg: '#EF4444',
    text: '#FFFFFF',
  },
  warning: {
    bg: '#F59E0B',
    text: '#FFFFFF',
  },
  info: {
    bg: '#6366F1',
    text: '#FFFFFF',
  },
};

/**
 * Default icons for each notification type
 */
export const DEFAULT_ICONS: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'i',
};

/**
 * Animation duration in milliseconds
 */
export const ANIMATION_DURATION = 300;

/**
 * Default toast duration in milliseconds
 */
export const DEFAULT_DURATION = 3000;

/**
 * LocalStorage key for presets
 */
export const PRESETS_STORAGE_KEY = 'toast-notification-presets';

/**
 * Available toast positions
 */
export const POSITIONS: (
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
)[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

/**
 * Default animation
 */
export const DEFAULT_ANIMATION: AnimationType = 'slide';
