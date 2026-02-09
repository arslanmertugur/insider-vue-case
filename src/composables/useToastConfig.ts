import { ref, computed } from 'vue';
import type { NotificationType, Position } from '../types/notification';
import { DEFAULT_COLORS, DEFAULT_ANIMATION } from '../utils/constants';
import type { AnimationType } from '../types/notification';

export function createToastConfigService() {
  const configModel = ref({
    type: 'success' as NotificationType,
    title: 'Success!',
    message: 'Your changes have been saved successfully.',
    duration: 3000,
    position: 'top-center' as Position,
    animation: DEFAULT_ANIMATION as AnimationType,
  });

  const styleModel = ref({
    backgroundColor: DEFAULT_COLORS.success.bg,
    textColor: DEFAULT_COLORS.success.text,
    showIcon: true,
    showCloseButton: true,
  });

  // Full configuration combining both models
  const fullConfig = computed(() => ({
    ...configModel.value,
    ...styleModel.value,
  }));

  const updateConfig = (newConfig: Partial<typeof configModel.value>) => {
    configModel.value = { ...configModel.value, ...newConfig };
  };

  const updateStyle = (newStyle: Partial<typeof styleModel.value>) => {
    styleModel.value = { ...styleModel.value, ...newStyle };
  };

  const resetColors = (type: NotificationType) => {
    styleModel.value.backgroundColor = DEFAULT_COLORS[type].bg;
    styleModel.value.textColor = DEFAULT_COLORS[type].text;
  };

  return {
    configModel,
    styleModel,
    fullConfig,
    updateConfig,
    updateStyle,
    resetColors,
  };
}

// Backward-compatible helper that returns a fresh service instance
export function useToastConfig() {
  return createToastConfigService();
}
