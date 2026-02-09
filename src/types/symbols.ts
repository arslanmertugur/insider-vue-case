import type { InjectionKey } from 'vue';
import type { createToastConfigService } from '../composables/useToastConfig';
import type { usePresets } from '../composables/usePresets';
import type { useToastStore } from '../stores/useToastStore';

/**
 * Injection keys for dependency injection
 * Using symbols ensures uniqueness and prevents naming collisions
 */

export type ToastService = ReturnType<typeof useToastStore>;
export type ToastConfigService = ReturnType<typeof createToastConfigService>;
export type PresetsService = ReturnType<typeof usePresets>;

export const ToastServiceKey: InjectionKey<ToastService> = Symbol('ToastService');
export const ToastConfigServiceKey: InjectionKey<ToastConfigService> = Symbol('ToastConfigService');
export const PresetsServiceKey: InjectionKey<PresetsService> = Symbol('PresetsService');
