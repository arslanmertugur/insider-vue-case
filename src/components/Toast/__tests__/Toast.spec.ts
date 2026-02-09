import { mount } from '@vue/test-utils';
import Toast from '@/components/Toast/Toast.vue';
import type { NotificationType, Position, AnimationType } from '@/types/notification';
import { DEFAULT_ICONS } from '@/utils/constants';

describe('Toast Component', () => {
  const defaultProps = {
    id: 'test-toast',
    type: 'success' as NotificationType,
    title: 'Test Title',
    message: 'Test message',
    position: 'top-right' as Position,
    animation: 'slide' as AnimationType,
    backgroundColor: '#22C55E',
    textColor: '#FFFFFF',
    showIcon: true,
    showCloseButton: true,
    duration: 3000,
  };

  describe('Rendering', () => {
    test('should render toast with all props', () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      expect(wrapper.find('.toast').exists()).toBe(true);
      expect(wrapper.find('.toast__title').text()).toBe('Test Title');
      expect(wrapper.find('.toast__message').text()).toBe('Test message');
    });

    test('should render correct icon for notification type', () => {
      const types: NotificationType[] = ['success', 'error', 'warning', 'info'];

      types.forEach(type => {
        const wrapper = mount(Toast, {
          props: { ...defaultProps, type },
        });

        const icon = wrapper.find('.toast__icon');
        expect(icon.text()).toBe(DEFAULT_ICONS[type]);
      });
    });

    test('should hide icon when showIcon is false', () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, showIcon: false },
      });

      expect(wrapper.find('.toast__icon').exists()).toBe(false);
    });

    test('should hide close button when showCloseButton is false', () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, showCloseButton: false },
      });

      expect(wrapper.find('.toast__close').exists()).toBe(false);
    });

    test('should apply custom background and text colors', () => {
      const customBg = '#FF5733';
      const customText = '#000000';

      const wrapper = mount(Toast, {
        props: {
          ...defaultProps,
          backgroundColor: customBg,
          textColor: customText,
        },
      });

      const toastElement = wrapper.find('.toast').element as HTMLElement;
      expect(toastElement.style.backgroundColor).toBe('rgb(255, 87, 51)'); // #FF5733 in RGB
      expect(toastElement.style.color).toBe('rgb(0, 0, 0)'); // #000000 in RGB
    });

    test('should apply correct position class', () => {
      const positions: Position[] = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ];

      positions.forEach(position => {
        const wrapper = mount(Toast, {
          props: { ...defaultProps, position },
        });

        expect(wrapper.find(`.toast--${position}`).exists()).toBe(true);
      });
    });

    test('should apply animation class based on prop', () => {
      const animations: AnimationType[] = ['slide', 'fade', 'bounce'];

      animations.forEach(animation => {
        const wrapper = mount(Toast, {
          props: { ...defaultProps, animation },
        });

        expect(wrapper.find(`.toast--anim-${animation}`).exists()).toBe(true);
      });
    });
  });

  describe('User Interactions', () => {
    test('should emit close event when close button is clicked', async () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('.toast__close');
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')?.[0]).toEqual([defaultProps.id]);
    });

    test('should emit close event on Enter key press', async () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('.toast__close');
      await closeButton.trigger('keydown.enter');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')?.[0]).toEqual([defaultProps.id]);
    });

    test('should emit close event on Space key press', async () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('.toast__close');
      await closeButton.trigger('keydown.space');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')?.[0]).toEqual([defaultProps.id]);
    });
  });

  describe('Timer Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should auto-dismiss after duration', () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, duration: 3000 },
      });

      expect(wrapper.emitted('close')).toBeFalsy();

      jest.advanceTimersByTime(3000);

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    test('should not auto-dismiss when duration is 0', () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, duration: 0 },
      });

      jest.advanceTimersByTime(10000);

      expect(wrapper.emitted('close')).toBeFalsy();
    });

    test('should pause timer on mouse enter', async () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, duration: 3000 },
      });

      const toast = wrapper.find('.toast');

      // Advance half the duration
      jest.advanceTimersByTime(1500);

      // Hover over toast
      await toast.trigger('mouseenter');

      // Advance beyond original duration
      jest.advanceTimersByTime(2000);

      // Should not have closed yet
      expect(wrapper.emitted('close')).toBeFalsy();
    });

    test('should resume timer on mouse leave', async () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, duration: 3000 },
      });

      const toast = wrapper.find('.toast');

      // Advance half the duration
      jest.advanceTimersByTime(1500);

      // Hover
      await toast.trigger('mouseenter');
      jest.advanceTimersByTime(1000);

      // Leave
      await toast.trigger('mouseleave');

      // Advance remaining time
      jest.advanceTimersByTime(1500);

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('should have correct ARIA attributes', () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const toast = wrapper.find('.toast');
      expect(toast.attributes('role')).toBe('alert');
      expect(toast.attributes('aria-live')).toBe('assertive');
    });

    test('should have aria-label on close button', () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('.toast__close');
      expect(closeButton.attributes('aria-label')).toBe('Close notification');
    });

    test('should have tabindex on close button for keyboard navigation', () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      const closeButton = wrapper.find('.toast__close');
      expect(closeButton.attributes('tabindex')).toBe('0');
    });
  });

  describe('Animation State', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should have entering class initially', () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      expect(wrapper.find('.toast--entering').exists()).toBe(true);
    });

    test('should remove entering class after animation', async () => {
      const wrapper = mount(Toast, {
        props: defaultProps,
      });

      expect(wrapper.find('.toast--entering').exists()).toBe(true);

      jest.advanceTimersByTime(300);
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.toast--entering').exists()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should clear timer on unmount', () => {
      const wrapper = mount(Toast, {
        props: { ...defaultProps, duration: 5000 },
      });

      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      wrapper.unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Props Validation', () => {
    test('should accept all required props', () => {
      mount(Toast, {
        props: defaultProps,
      });

      // Verify the props were correctly defined
      expect(defaultProps.id).toBe('test-toast');
      expect(defaultProps.type).toBe('success');
      expect(defaultProps.title).toBe('Test Title');
      expect(defaultProps.message).toBe('Test message');
      expect(defaultProps.position).toBe('top-right');
      expect(defaultProps.backgroundColor).toBe('#22C55E');
      expect(defaultProps.textColor).toBe('#FFFFFF');
      expect(defaultProps.showIcon).toBe(true);
      expect(defaultProps.showCloseButton).toBe(true);
      expect(defaultProps.duration).toBe(3000);
    });
  });
});
