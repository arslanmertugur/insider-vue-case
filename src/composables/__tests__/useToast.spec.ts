import type { NotificationType, AnimationType } from '../../types/notification';
import { setActivePinia, createPinia, storeToRefs } from 'pinia';
import { useToastStore } from '../../stores/useToastStore';

// Mock nanoid to return predictable IDs
// Mock nanoid to return predictable IDs
// Using __mocks__/nanoid.ts instead for better control

describe('useToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Clear all toasts before each test to ensure isolation
    const store = useToastStore();
    store.clearAllToasts();
  });

  describe('Basic Operations', () => {
    test('should add a toast notification', () => {
      const store = useToastStore();

      const id = store.addToast({
        type: 'success' as NotificationType,
        title: 'Test',
        message: 'Test message',
        duration: 0, // persistent
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(store.activeNotifications).toHaveLength(1);
      expect(store.activeNotifications[0]!.title).toBe('Test');
      expect(store.activeNotifications[0]!.message).toBe('Test message');
      expect(store.activeNotifications[0]!.id).toBe(id);
    });

    test('should remove a toast notification by ID', () => {
      const store = useToastStore();

      const id = store.addToast({
        type: 'error' as NotificationType,
        title: 'Error',
        message: 'Error message',
        duration: 0,
        position: 'bottom-left',
        animation: 'slide',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      expect(store.activeNotifications).toHaveLength(1);

      store.removeToast(id);

      expect(store.activeNotifications).toHaveLength(0);
    });

    test('should handle removing non-existent toast gracefully', () => {
      const store = useToastStore();

      // Try to remove a toast that doesn't exist
      expect(() => store.removeToast('non-existent-id')).not.toThrow();
      expect(store.activeNotifications).toHaveLength(0);
    });

    test('should clear all toasts', () => {
      const store = useToastStore();

      // Add multiple toasts
      store.addToast({
        type: 'success' as NotificationType,
        title: 'Toast 1',
        message: 'Message 1',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      store.addToast({
        type: 'error' as NotificationType,
        title: 'Toast 2',
        message: 'Message 2',
        duration: 0,
        position: 'bottom-left',
        animation: 'slide',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      expect(store.activeNotifications).toHaveLength(2);

      store.clearAllToasts();

      expect(store.activeNotifications).toHaveLength(0);
    });
  });

  describe('Position Filtering', () => {
    test('should filter toasts by position', () => {
      const store = useToastStore();

      store.addToast({
        type: 'success' as NotificationType,
        title: 'Toast 1',
        message: 'Message 1',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      store.addToast({
        type: 'error' as NotificationType,
        title: 'Toast 2',
        message: 'Message 2',
        duration: 0,
        position: 'bottom-left',
        animation: 'slide',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      store.addToast({
        type: 'info' as NotificationType,
        title: 'Toast 3',
        message: 'Message 3',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      const topRightToasts = store.getToastsByPosition('top-right');
      const bottomLeftToasts = store.getToastsByPosition('bottom-left');
      const topCenterToasts = store.getToastsByPosition('top-center');

      expect(topRightToasts).toHaveLength(2);
      expect(bottomLeftToasts).toHaveLength(1);
      expect(topCenterToasts).toHaveLength(0);
      expect(topRightToasts[0]!.title).toBe('Toast 1');
      expect(topRightToasts[1]!.title).toBe('Toast 3');
      expect(bottomLeftToasts[0]!.title).toBe('Toast 2');
    });

    test('should return empty array for position with no toasts', () => {
      const store = useToastStore();

      const toasts = store.getToastsByPosition('bottom-center');

      expect(toasts).toEqual([]);
      expect(Array.isArray(toasts)).toBe(true);
    });
  });

  describe('Toast Properties', () => {
    test('should include createdAt timestamp', () => {
      const store = useToastStore();
      const beforeTime = Date.now();

      store.addToast({
        type: 'info' as NotificationType,
        title: 'Test',
        message: 'Test message',
        duration: 0,
        position: 'top-center',
        animation: 'slide',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      const afterTime = Date.now();
      const toast = store.activeNotifications[0]!;

      expect(toast.createdAt).toBeDefined();
      expect(typeof toast.createdAt).toBe('number');
      expect(toast.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(toast.createdAt).toBeLessThanOrEqual(afterTime);
    });

    test('should preserve all config properties', () => {
      const store = useToastStore();

      const config = {
        type: 'warning' as NotificationType,
        title: 'Warning Title',
        message: 'Warning message',
        duration: 5000,
        position: 'bottom-right' as const,
        animation: 'slide' as AnimationType,
        backgroundColor: '#F59E0B',
        textColor: '#000000',
        showIcon: false,
        showCloseButton: false,
      };

      store.addToast(config);

      const toast = store.activeNotifications[0]!;

      expect(toast.type).toBe(config.type);
      expect(toast.title).toBe(config.title);
      expect(toast.message).toBe(config.message);
      expect(toast.duration).toBe(config.duration);
      expect(toast.position).toBe(config.position);
      expect(toast.backgroundColor).toBe(config.backgroundColor);
      expect(toast.textColor).toBe(config.textColor);
      expect(toast.showIcon).toBe(config.showIcon);
      expect(toast.showCloseButton).toBe(config.showCloseButton);
    });
  });

  describe('State Management', () => {
    test('should maintain singleton state across multiple useToast calls', () => {
      const instance1 = useToastStore();
      const instance2 = useToastStore();

      instance1.addToast({
        type: 'success' as NotificationType,
        title: 'Test',
        message: 'Test message',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      // Both instances should see the same notification
      expect(instance1.activeNotifications).toHaveLength(1);
      expect(instance2.activeNotifications).toHaveLength(1);
      expect(instance1.activeNotifications[0]).toBe(instance2.activeNotifications[0]);
    });

    test('should return readonly activeNotifications', () => {
      const { activeNotifications } = useToastStore();

      // Attempting to directly modify should not be possible (TypeScript check)
      // At runtime, Vue's readonly prevents mutation
      expect(activeNotifications).toBeDefined();
      expect(Array.isArray(activeNotifications)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle adding many toasts', () => {
      const store = useToastStore();
      const { addToast } = store;
      const { activeNotifications } = storeToRefs(store);

      const count = 100;
      for (let i = 0; i < count; i++) {
        addToast({
          type: 'info' as NotificationType,
          title: `Toast ${i}`,
          message: `Message ${i}`,
          duration: 0,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#6366F1',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
        });
      }

      // capped at MAX_TOASTS = 10
      expect(activeNotifications.value).toHaveLength(10);
      // should keep the most recent toasts
      expect(activeNotifications.value[0]!.title).toBe('Toast 90');
      expect(activeNotifications.value[9]!.title).toBe('Toast 99');
    });

    test('should handle removing toasts in different orders', () => {
      const store = useToastStore();
      const { addToast, removeToast } = store;
      const { activeNotifications } = storeToRefs(store);

      const id1 = addToast({
        type: 'success' as NotificationType,
        title: 'First',
        message: 'Message',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      const id2 = addToast({
        type: 'error' as NotificationType,
        title: 'Second',
        message: 'Message',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      const id3 = addToast({
        type: 'info' as NotificationType,
        title: 'Third',
        message: 'Message',
        duration: 0,
        position: 'top-right',
        animation: 'slide',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
      });

      // Remove middle toast
      removeToast(id2);
      expect(activeNotifications.value).toHaveLength(2);
      expect(activeNotifications.value[0]!.title).toBe('First');
      expect(activeNotifications.value[1]!.title).toBe('Third');

      // Remove first toast
      removeToast(id1);
      expect(activeNotifications.value).toHaveLength(1);
      expect(activeNotifications.value[0]!.title).toBe('Third');

      // Remove last toast
      removeToast(id3);
      expect(activeNotifications.value).toHaveLength(0);
    });

    test('should generate unique IDs for each toast', () => {
      const store = useToastStore();
      const { addToast } = store;
      const { activeNotifications } = storeToRefs(store);

      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        const id = addToast({
          type: 'success' as NotificationType,
          title: 'Test',
          message: 'Message',
          duration: 0,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#22C55E',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
        });
        ids.add(id);
      }

      // All IDs should be unique
      expect(ids.size).toBe(10);
      expect(activeNotifications.value).toHaveLength(10);
    });
  });
});
