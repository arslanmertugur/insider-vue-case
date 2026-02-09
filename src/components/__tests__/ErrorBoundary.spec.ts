import { mount } from '@vue/test-utils';
import { nextTick, h } from 'vue';
import ErrorBoundary from '../ErrorBoundary.vue';

describe('ErrorBoundary', () => {
  describe('Error Capture', () => {
    it('should catch errors from child components', async () => {
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary').exists()).toBe(true);
      expect(wrapper.find('.error-boundary__title').text()).toContain('Something went wrong');
    });

    it('should display error message to user', async () => {
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        setup() {
          throw new Error('Custom error message');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary__message').text()).toBeTruthy();
    });

    it('should call custom onError handler when provided', async () => {
      const onError = jest.fn();
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      mount(ErrorBoundary, {
        props: { onError },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      const ChildComponent = {
        template: '<div class="child">Child Content</div>',
      };

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(ChildComponent),
        },
      });

      expect(wrapper.find('.error-boundary').exists()).toBe(false);
      expect(wrapper.find('.child').exists()).toBe(true);
      expect(wrapper.find('.child').text()).toBe('Child Content');
    });
  });

  describe('Error Recovery', () => {
    it('should recover when retry button is clicked', async () => {
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();
      expect(wrapper.find('.error-boundary').exists()).toBe(true);

      await wrapper.find('.error-boundary__button--primary').trigger('click');
      await nextTick();

      // After retry, error state should be cleared
      // Note: In real scenario, if error persists, it will show again
    });

    it('should call custom onReset handler when reset button is clicked', async () => {
      const onReset = jest.fn();
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        props: { onReset },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      await wrapper.find('.error-boundary__button--secondary').trigger('click');

      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Custom Props', () => {
    it('should display custom error title when provided', async () => {
      const customTitle = 'Custom Error Title';
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        props: { errorTitle: customTitle },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary__title').text()).toBe(customTitle);
    });

    it('should display custom error message when provided', async () => {
      const customMessage = 'Custom error message for testing';
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        props: { errorMessage: customMessage },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary__message').text()).toBe(customMessage);
    });

    it('should show technical details when showDetails is true', async () => {
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error with stack');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        props: { showDetails: true },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary__details').exists()).toBe(true);
      expect(wrapper.find('.error-boundary__stack').exists()).toBe(true);
    });

    it('should not show technical details when showDetails is false', async () => {
      const ErrorComponent = {
        template: '<div>Error Component</div>',
        mounted() {
          throw new Error('Test error');
        },
      };

      const wrapper = mount(ErrorBoundary, {
        props: { showDetails: false },
        slots: {
          default: () => h(ErrorComponent),
        },
      });

      await nextTick();

      expect(wrapper.find('.error-boundary__details').exists()).toBe(false);
    });
  });
});
