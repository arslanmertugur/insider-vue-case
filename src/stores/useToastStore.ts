import { defineStore } from 'pinia';
import { shallowRef, computed, readonly } from 'vue';
import { nanoid } from 'nanoid';
import type {
  ActiveNotification,
  NotificationConfig,
  Position,
  NotificationType,
  AnimationType,
} from '../types/notification';
import { DEFAULT_COLORS, DEFAULT_DURATION, DEFAULT_ANIMATION } from '../utils/constants';

const MAX_TOASTS = 10;
const PERSISTENT_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export const useToastStore = defineStore('toast', () => {
  const activeNotifications = shallowRef<ActiveNotification[]>([]);

  const pruneToasts = () => {
    const now = Date.now();

    // Drop stale persistent toasts
    let next = activeNotifications.value.filter(toast => {
      const isPersistentExpired =
        toast.duration === 0 && now - toast.createdAt > PERSISTENT_MAX_AGE_MS;
      return !isPersistentExpired;
    });

    // Enforce max queue length (oldest first)
    if (next.length > MAX_TOASTS) {
      next = next.slice(next.length - MAX_TOASTS);
    }

    activeNotifications.value = next;
  };

  const addToast = (config: Omit<NotificationConfig, 'id'>): string => {
    pruneToasts();

    // Normalize config with defaults
    const type: NotificationType = config.type ?? 'info';
    const normalized: Omit<NotificationConfig, 'id'> = {
      type,
      title: config.title ?? '',
      message: config.message ?? '',
      duration: typeof config.duration === 'number' ? config.duration : DEFAULT_DURATION,
      position: config.position ?? 'top-center',
      animation: (config.animation as AnimationType) ?? DEFAULT_ANIMATION,
      backgroundColor: config.backgroundColor ?? DEFAULT_COLORS[type].bg,
      textColor: config.textColor ?? DEFAULT_COLORS[type].text,
      showIcon: config.showIcon ?? true,
      showCloseButton: config.showCloseButton ?? true,
    };

    const id = nanoid();
    const notification: ActiveNotification = {
      ...normalized,
      id,
      createdAt: Date.now(),
    };

    activeNotifications.value = [...activeNotifications.value, notification];
    pruneToasts();

    return id;
  };

  const removeToast = (id: string): void => {
    activeNotifications.value = activeNotifications.value.filter(n => n.id !== id);
  };

  const getToastsByPosition = (position: Position): ActiveNotification[] => {
    return activeNotifications.value.filter(n => n.position === position);
  };

  const clearAllToasts = (): void => {
    activeNotifications.value = [];
  };

  const groupedByPosition = computed(() => {
    const groups: Record<Position, ActiveNotification[]> = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': [],
    };

    activeNotifications.value.forEach(toast => {
      if (groups[toast.position]) {
        groups[toast.position].push(toast);
      }
    });

    return groups;
  });

  return {
    activeNotifications: readonly(activeNotifications),
    groupedByPosition,
    addToast,
    removeToast,
    getToastsByPosition,
    clearAllToasts,
  };
});
