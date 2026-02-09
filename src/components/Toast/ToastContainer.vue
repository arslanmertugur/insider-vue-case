<template>
  <Teleport to="body">
    <div class="toast-container">
      <div
        v-for="position in positions"
        :key="position"
        :class="`toast-container__position toast-container__position--${position}`"
      >
        <TransitionGroup name="toast-list">
          <ToastNotification
            v-for="toast in groupedToasts[position]"
            :key="toast.id"
            v-bind="toast"
            @close="removeToast"
          />
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, computed, unref } from 'vue';
import ToastNotification from './Toast.vue';
import type { Position, ActiveNotification as ToastType } from '../../types/notification';
import { ToastServiceKey } from '../../types/symbols';
import type { ToastService } from '../../types/symbols';
import { POSITIONS } from '../../utils/constants';

// Inject toast service
const toastService = inject<ToastService>(ToastServiceKey);

if (!toastService) {
  throw new Error('ToastService not provided. Make sure ToastPlugin is installed.');
}

const positions = POSITIONS;

const groupedToasts = computed(() => {
  const providedGroups = (toastService as any).groupedByPosition;
  if (providedGroups) {
    return unref(providedGroups) as Record<Position, ToastType[]>;
  }

  const groups: Record<Position, ToastType[]> = {
    'top-left': [],
    'top-center': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-center': [],
    'bottom-right': [],
  };

  const toasts = unref((toastService as any).activeNotifications) ?? [];
  toasts.forEach((toast: ToastType) => {
    groups[toast.position]?.push(toast);
  });

  return groups;
});

const removeToast = (toastService as any).removeToast ?? (() => {});
</script>

<style scoped lang="scss">
@use '../../styles/variables.scss' as *;
@use '../../styles/mixins.scss' as *;

.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: $z-toast;
}

.toast-container__position {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @include mobile {
    left: 0 !important;
    right: 0 !important;
    width: 100%;
    transform: none !important;
    padding: $spacing-md;
    align-items: center;
  }

  &--top-left {
    top: 0;
    left: 0;
  }

  &--top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &--top-right {
    top: 0;
    right: 0;
  }

  &--bottom-left {
    bottom: 0;
    left: 0;
    flex-direction: column-reverse;
  }

  &--bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column-reverse;
  }

  &--bottom-right {
    bottom: 0;
    right: 0;
    flex-direction: column-reverse;
  }
}

.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: opacity 0.2s ease;
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
}

.toast-list-leave-from,
.toast-list-enter-to {
  opacity: 1;
}

// Respect user's motion preferences for accessibility
@media (prefers-reduced-motion: reduce) {
  .toast-list-move,
  .toast-list-enter-active {
    transition: none;
  }

  .toast-list-enter-from {
    opacity: 1;
    transform: none;
  }
}
</style>
