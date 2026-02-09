import type { App } from 'vue';
import { ref, computed, shallowRef, readonly } from 'vue';
import { createPinia, type Pinia } from 'pinia';
import { useToastStore } from '../stores/useToastStore';
import { createToastConfigService } from '../composables/useToastConfig';
import { usePresets } from '../composables/usePresets';
import { useErrorHandler } from '../composables/useErrorHandler';
import { ToastServiceKey, ToastConfigServiceKey, PresetsServiceKey } from '../types/symbols';
import type { ActiveNotification, Position, NotificationType, AnimationType } from '../types/notification';
import { DEFAULT_ANIMATION, DEFAULT_COLORS } from '../utils/constants';

interface ToastPluginOptions {
  pinia?: Pinia;
}

/**
 * Vue plugin for Toast Notification system
 * Provides services via dependency injection for better testability
 */
export function createToastPlugin(options: ToastPluginOptions = {}) {
  return {
    install(app: App) {
      try {
        const providedPinia = options.pinia;
        const existingPinia = (app as any)._context?.provides?.pinia as Pinia | undefined;
        const pinia = providedPinia ?? existingPinia ?? createPinia();

        if (!providedPinia && !existingPinia) {
          app.use(pinia);
        }

        // Create per-app instances of services
        const toastService = useToastStore(pinia);
        const errorHandler = useErrorHandler(toastService);
        const toastConfigService = createToastConfigService();
        const presetsService = usePresets(errorHandler);

        // Provide services to all components
        app.provide(ToastServiceKey, toastService);
        app.provide(ToastConfigServiceKey, toastConfigService);
        app.provide(PresetsServiceKey, presetsService);
      } catch (error) {
        console.error('[Toast Plugin] Failed to initialize services:', error);

        // Provide minimal fallback implementations to prevent crashes
        const fallbackActive = shallowRef<ActiveNotification[]>([]);
        const emptyGroups: Record<Position, ActiveNotification[]> = {
          'top-left': [],
          'top-center': [],
          'top-right': [],
          'bottom-left': [],
          'bottom-center': [],
          'bottom-right': [],
        };

        const fallbackToastService = {
          activeNotifications: readonly(fallbackActive),
          groupedByPosition: computed(() => emptyGroups),
          addToast: () => {
            console.warn('[Toast Plugin] Using fallback toast service - functionality limited');
            return '';
          },
          removeToast: () => {},
          getToastsByPosition: () => [],
          clearAllToasts: () => {
            fallbackActive.value = [];
          },
        } as unknown as ReturnType<typeof useToastStore>;

        const fallbackConfigModel = ref<{
          type: NotificationType;
          title: string;
          message: string;
          duration: number;
          position: Position;
          animation: AnimationType;
        }>({
          type: 'info',
          title: '',
          message: '',
          duration: 3000,
          position: 'top-center',
          animation: DEFAULT_ANIMATION,
        });

        const fallbackStyleModel = ref({
          backgroundColor: DEFAULT_COLORS.info.bg,
          textColor: DEFAULT_COLORS.info.text,
          showIcon: true,
          showCloseButton: true,
        });

        const fallbackConfigService = {
          configModel: fallbackConfigModel,
          styleModel: fallbackStyleModel,
          fullConfig: computed(() => ({
            ...fallbackConfigModel.value,
            ...fallbackStyleModel.value,
          })),
          updateConfig: (newConfig: Partial<typeof fallbackConfigModel.value>) => {
            fallbackConfigModel.value = { ...fallbackConfigModel.value, ...newConfig };
          },
          updateStyle: (newStyle: Partial<typeof fallbackStyleModel.value>) => {
            fallbackStyleModel.value = { ...fallbackStyleModel.value, ...newStyle };
          },
          resetColors: (type: NotificationType) => {
            fallbackStyleModel.value.backgroundColor = DEFAULT_COLORS[type].bg;
            fallbackStyleModel.value.textColor = DEFAULT_COLORS[type].text;
          },
        } as unknown as ReturnType<typeof createToastConfigService>;

        const fallbackPresetsService = {
          presets: ref([]),
          isLoading: ref(false),
          hasError: ref(true),
          savePreset: () => null,
          loadPreset: () => null,
          deletePreset: () => false,
          getAllPresets: () => [],
          retryLoad: () => {},
        };

        app.provide(ToastServiceKey, fallbackToastService);
        app.provide(ToastConfigServiceKey, fallbackConfigService);
        app.provide(PresetsServiceKey, fallbackPresetsService);

        // Show error in console for developers
        console.error(
          '[Toast Plugin] Services initialized with fallback implementations. Some features may not work correctly.'
        );
      }
    },
  };
}

// Default plugin instance for convenience
const ToastPlugin = createToastPlugin();

export default ToastPlugin;
