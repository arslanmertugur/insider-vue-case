import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import ToastContainer from '@/components/Toast/ToastContainer.vue';
import Toast from '@/components/Toast/Toast.vue';
import { ToastServiceKey } from '@/types/symbols';
import type { ActiveNotification } from '@/types/notification';

describe('ToastContainer', () => {
  const createMockToastService = (notifications: ActiveNotification[] = []) => {
    const activeNotifications = ref(notifications);
    const groupedByPosition = computed(() => {
      const positions = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ] as const;

      const groups = positions.reduce(
        (acc, pos) => {
          acc[pos] = [] as ActiveNotification[];
          return acc;
        },
        {} as Record<ActiveNotification['position'], ActiveNotification[]>
      );

      activeNotifications.value.forEach(toast => {
        groups[toast.position].push(toast);
      });

      return groups;
    });

    return {
      activeNotifications,
      groupedByPosition,
      addToast: jest.fn(),
      removeToast: jest.fn(),
      getToastsByPosition: jest.fn(),
      clearAllToasts: jest.fn(),
    };
  };

  describe('Rendering', () => {
    test('should render without errors when no toasts exist', () => {
      const mockService = createMockToastService([]);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    test('should render toasts in correct positions', () => {
      const mockToasts: ActiveNotification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Top Left',
          message: 'Message 1',
          duration: 3000,
          position: 'top-left',
          animation: 'slide',
          backgroundColor: '#22C55E',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
        {
          id: '2',
          type: 'error',
          title: 'Bottom Right',
          message: 'Message 2',
          duration: 3000,
          position: 'bottom-right',
          animation: 'slide',
          backgroundColor: '#EF4444',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
      ];

      const mockService = createMockToastService(mockToasts);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      const toastComponents = wrapper.findAllComponents(Toast);
      expect(toastComponents).toHaveLength(2);
    });

    test('should render all 6 position containers', () => {
      const mockService = createMockToastService([]);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      // Should have 6 position containers
      const positionContainers = wrapper.findAll('.toast-container__position');
      expect(positionContainers).toHaveLength(6);
    });
  });

  describe('Toast Grouping', () => {
    test('should place one toast in each position container', () => {
      const positions: ActiveNotification[] = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ].map((pos, idx) => ({
        id: `t-${idx}`,
        type: 'info',
        title: `Toast ${idx}`,
        message: 'Message',
        duration: 3000,
        position: pos as ActiveNotification['position'],
        animation: 'slide',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
        createdAt: Date.now(),
      }));

      const mockService = createMockToastService(positions);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      const containers = [
        '.toast-container__position--top-left',
        '.toast-container__position--top-center',
        '.toast-container__position--top-right',
        '.toast-container__position--bottom-left',
        '.toast-container__position--bottom-center',
        '.toast-container__position--bottom-right',
      ];

      containers.forEach(selector => {
        expect(wrapper.find(selector).findAllComponents(Toast)).toHaveLength(1);
      });
    });
    test('should group toasts by position correctly', () => {
      const mockToasts: ActiveNotification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Toast 1',
          message: 'Message 1',
          duration: 3000,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#22C55E',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
        {
          id: '2',
          type: 'info',
          title: 'Toast 2',
          message: 'Message 2',
          duration: 3000,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#6366F1',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
        {
          id: '3',
          type: 'warning',
          title: 'Toast 3',
          message: 'Message 3',
          duration: 3000,
          position: 'bottom-left',
          animation: 'slide',
          backgroundColor: '#F59E0B',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
      ];

      const mockService = createMockToastService(mockToasts);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      const toastComponents = wrapper.findAllComponents(Toast);
      expect(toastComponents).toHaveLength(3);

      // Verify grouping
      const topRightContainer = wrapper.find('.toast-container__position--top-right');
      expect(topRightContainer.findAllComponents(Toast)).toHaveLength(2);

      const bottomLeftContainer = wrapper.find('.toast-container__position--bottom-left');
      expect(bottomLeftContainer.findAllComponents(Toast)).toHaveLength(1);
    });

    test('should handle multiple toasts in same position', () => {
      const mockToasts: ActiveNotification[] = Array.from({ length: 5 }, (_, i) => ({
        id: `toast-${i}`,
        type: 'success' as const,
        title: `Toast ${i}`,
        message: `Message ${i}`,
        duration: 3000,
        position: 'top-center' as const,
        animation: 'slide',
        backgroundColor: '#22C55E',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
        createdAt: Date.now(),
      }));

      const mockService = createMockToastService(mockToasts);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      const topCenterContainer = wrapper.find('.toast-container__position--top-center');
      expect(topCenterContainer.findAllComponents(Toast)).toHaveLength(5);
    });
  });

  describe('Toast Removal', () => {
    test('should call removeToast when toast emits close event', async () => {
      const mockToasts: ActiveNotification[] = [
        {
          id: 'test-id',
          type: 'success',
          title: 'Test',
          message: 'Test message',
          duration: 3000,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#22C55E',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
      ];

      const mockService = createMockToastService(mockToasts);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      const toastComponent = wrapper.findComponent(Toast);
      await toastComponent.vm.$emit('close', 'test-id');

      expect(mockService.removeToast).toHaveBeenCalledWith('test-id');
    });
  });

  describe('Service Integration', () => {
    test('should throw error if ToastService is not provided', () => {
      expect(() => {
        mount(ToastContainer, {
          global: {
            stubs: {
              Teleport: true,
            },
          },
        });
      }).toThrow('ToastService not provided. Make sure ToastPlugin is installed.');
    });

    test('should use injected toast service', () => {
      const mockService = createMockToastService([]);

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Dynamic Updates', () => {
    test('should reactively update when toasts are added', async () => {
      const notifications = ref<ActiveNotification[]>([]);
      const mockService = {
        activeNotifications: notifications,
        addToast: jest.fn(),
        removeToast: jest.fn(),
        getToastsByPosition: jest.fn(),
        clearAllToasts: jest.fn(),
      };

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      expect(wrapper.findAllComponents(Toast)).toHaveLength(0);

      // Add a toast
      notifications.value.push({
        id: 'new-toast',
        type: 'info',
        title: 'New Toast',
        message: 'New message',
        duration: 3000,
        position: 'top-center',
        animation: 'slide',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
        showIcon: true,
        showCloseButton: true,
        createdAt: Date.now(),
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.findAllComponents(Toast)).toHaveLength(1);
    });

    test('should reactively update when toasts are removed', async () => {
      const notifications = ref<ActiveNotification[]>([
        {
          id: 'toast-1',
          type: 'success',
          title: 'Toast',
          message: 'Message',
          duration: 3000,
          position: 'top-right',
          animation: 'slide',
          backgroundColor: '#22C55E',
          textColor: '#FFFFFF',
          showIcon: true,
          showCloseButton: true,
          createdAt: Date.now(),
        },
      ]);

      const mockService = {
        activeNotifications: notifications,
        addToast: jest.fn(),
        removeToast: jest.fn(),
        getToastsByPosition: jest.fn(),
        clearAllToasts: jest.fn(),
      };

      const wrapper = mount(ToastContainer, {
        global: {
          provide: {
            [ToastServiceKey as symbol]: mockService,
          },
          stubs: {
            Teleport: true,
          },
        },
      });

      expect(wrapper.findAllComponents(Toast)).toHaveLength(1);

      // Remove the toast
      notifications.value = [];

      await wrapper.vm.$nextTick();

      expect(wrapper.findAllComponents(Toast)).toHaveLength(0);
    });
  });
});
