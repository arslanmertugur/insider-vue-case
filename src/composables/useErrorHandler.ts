import { ref, computed, readonly } from 'vue';
import type { Ref } from 'vue';
import type { NotificationType } from '../types/notification';
import { createPinia, getActivePinia, setActivePinia } from 'pinia';
import { useToastStore } from '../stores/useToastStore';
import type { ToastService } from '../types/symbols';
import { DEFAULT_COLORS, DEFAULT_ANIMATION } from '../utils/constants';

export interface ErrorInfo {
  message: string;
  type: 'user' | 'system' | 'network' | 'storage';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface ErrorHandler {
  handleError: (error: Error | string, type?: ErrorInfo['type']) => void;
  showUserError: (message: string, title?: string) => void;
  showSystemError: (error: Error, context?: Record<string, unknown>) => void;
  clearErrors: () => void;
  errors: Readonly<Ref<ErrorInfo[]>>;
  hasErrors: Readonly<Ref<boolean>>;
}

/**
 * Centralized error handling composable with toast integration
 * Provides consistent error handling and user notifications across the app
 */
export function useErrorHandler(toastService?: ToastService): ErrorHandler {
  const errors = ref<ErrorInfo[]>([]);
  const hasErrors = computed(() => errors.value.length > 0);
  let resolvedToastService: ToastService;

  if (toastService) {
    resolvedToastService = toastService;
  } else {
    if (!getActivePinia()) {
      setActivePinia(createPinia());
    }
    resolvedToastService = useToastStore();
  }

  const { addToast } = resolvedToastService;

  /**
   * Convert error severity to notification type
   */
  const severityToNotificationType = (severity: ErrorInfo['severity']): NotificationType => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'error';
    }
  };

  /**
   * Get user-friendly error messages based on error type
   */
  const getUserFriendlyMessage = (error: Error | string, type: ErrorInfo['type']): string => {
    const errorMessage = typeof error === 'string' ? error : error.message;

    switch (type) {
      case 'storage':
        if (errorMessage.includes('QuotaExceededError') || errorMessage.includes('quota')) {
          return 'Storage is full. Please clear some space or delete old presets.';
        }
        return 'Unable to save data. Please check your browser settings.';

      case 'network':
        return 'Network error. Please check your connection and try again.';

      case 'user':
        return errorMessage; // User errors are already user-friendly

      case 'system':
      default:
        return 'An unexpected error occurred. Please try again or refresh the page.';
    }
  };

  /**
   * Determine error severity based on type and message
   */
  const determineErrorSeverity = (
    error: Error | string,
    type: ErrorInfo['type']
  ): ErrorInfo['severity'] => {
    if (type === 'user') return 'low';
    if (type === 'storage' || type === 'network') return 'medium';

    const errorMessage = typeof error === 'string' ? error : error.message;
    if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
      return 'high';
    }

    return 'medium';
  };

  /**
   * Core error handler - processes and displays errors
   */
  const handleError = (error: Error | string, type: ErrorInfo['type'] = 'system'): void => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const severity = determineErrorSeverity(error, type);

    const errorInfo: ErrorInfo = {
      message: errorMessage,
      type,
      severity,
      timestamp: Date.now(),
      context: typeof error === 'object' ? { stack: error.stack } : undefined,
    };

    errors.value.push(errorInfo);

    // Log to console for debugging
    if (severity === 'high') {
      console.error('[Error Handler - High Severity]', error);
    } else {
      console.warn('[Error Handler]', error);
    }

    // Show user-friendly notification via toast system
    // We'll use a dynamic import to avoid circular dependencies
    const userFriendlyMessage = getUserFriendlyMessage(error, type);

    const toastType = severityToNotificationType(severity);
    addToast({
      type: toastType,
      title: type === 'user' ? 'Notice' : 'Error',
      message: userFriendlyMessage,
      duration: severity === 'high' ? 0 : 5000, // Persistent for high severity
      position: 'top-center',
      animation: DEFAULT_ANIMATION,
      showIcon: true,
      showCloseButton: true,
      backgroundColor: DEFAULT_COLORS[toastType].bg,
      textColor: DEFAULT_COLORS[toastType].text,
    });
  };

  /**
   * Show user-facing error (e.g., validation errors)
   */
  const showUserError = (message: string, title: string = 'Notice'): void => {
    const toastType: NotificationType = 'warning';
    addToast({
      type: toastType,
      title,
      message,
      duration: 4000,
      position: 'top-center',
      animation: DEFAULT_ANIMATION,
      showIcon: true,
      showCloseButton: true,
      backgroundColor: DEFAULT_COLORS[toastType].bg,
      textColor: DEFAULT_COLORS[toastType].text,
    });
  };

  /**
   * Show system error with context
   */
  const showSystemError = (error: Error, context?: Record<string, unknown>): void => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      type: 'system',
      severity: 'high',
      timestamp: Date.now(),
      context: { ...context, stack: error.stack },
    };

    errors.value.push(errorInfo);
    console.error('[System Error]', error, context);

    addToast({
      type: 'error',
      title: 'System Error',
      message: 'An unexpected error occurred. Please refresh the page.',
      duration: 0, // Persistent
      position: 'top-center',
      animation: DEFAULT_ANIMATION,
      showIcon: true,
      showCloseButton: true,
      backgroundColor: DEFAULT_COLORS.error.bg,
      textColor: DEFAULT_COLORS.error.text,
    });
  };

  /**
   * Clear all errors
   */
  const clearErrors = (): void => {
    errors.value = [];
  };

  return {
    handleError,
    showUserError,
    showSystemError,
    clearErrors,
    errors: readonly(errors) as Readonly<Ref<ErrorInfo[]>>,
    hasErrors: readonly(hasErrors) as Readonly<Ref<boolean>>,
  };
}
