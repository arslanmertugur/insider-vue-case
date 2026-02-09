import ToastPlugin, { createToastPlugin } from './plugins/toast';
export { useToastStore } from './stores/useToastStore';
export { useToastConfig, createToastConfigService } from './composables/useToastConfig';
export { usePresets } from './composables/usePresets';
export * from './types/notification';
export * from './types/symbols';

export default ToastPlugin;
export { createToastPlugin };
