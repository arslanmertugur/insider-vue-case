<template>
  <div
    class="toast"
    :class="[`toast--${position}`, animationClass, { 'toast--entering': isEntering }]"
    :style="toastStyle"
    role="alert"
    aria-live="assertive"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="toast__content">
      <div class="toast__header">
        <div class="toast__header-left">
          <span v-if="showIcon" class="toast__icon">{{ icon }}</span>
          <h4 class="toast__title">{{ title }}</h4>
        </div>
        <button
          v-if="showCloseButton"
          class="toast__close"
          tabindex="0"
          aria-label="Close notification"
          @click="handleClose"
          @keydown.enter="handleClose"
          @keydown.space.prevent="handleClose"
        >
          ✕
        </button>
      </div>
      <p class="toast__message">{{ message }}</p>
    </div>
    <div v-if="duration > 0" class="toast__progress-container">
      <div
        class="toast__progress-bar"
        :style="progressBarStyle"
        :class="{ 'toast__progress-bar--paused': isPaused }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { NotificationType, Position, AnimationType } from '../../types/notification';
import { DEFAULT_ICONS } from '../../utils/constants';

interface Props {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  position: Position;
  animation: AnimationType;
  backgroundColor: string;
  textColor: string;
  showIcon: boolean;
  showCloseButton: boolean;
  duration: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [id: string];
}>();

const ANIMATION_DURATIONS: Record<AnimationType, number> = {
  slide: 300,
  fade: 250,
  bounce: 450,
};

const isEntering = ref(true);
const isPaused = ref(false);

const icon = computed(() => DEFAULT_ICONS[props.type]);

const toastStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.textColor,
}));

const animationClass = computed(() => `toast--anim-${props.animation}`);

const progressBarStyle = computed(() => ({
  animationDuration: `${props.duration}ms`,
}));

const handleClose = () => {
  emit('close', props.id);
};

// Timer management
let timer: ReturnType<typeof setTimeout> | null = null;
let remainingTime = props.duration;
let startTime = 0;

const startTimer = () => {
  if (remainingTime <= 0) return;

  startTime = Date.now();
  timer = window.setTimeout(() => {
    handleClose();
  }, remainingTime);
};

const pauseTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    remainingTime -= Date.now() - startTime;
  }
};

const resumeTimer = () => {
  if (remainingTime > 0) {
    startTimer();
  }
};

const handleMouseEnter = () => {
  if (props.duration > 0) {
    isPaused.value = true;
    pauseTimer();
  }
};

const handleMouseLeave = () => {
  if (props.duration > 0) {
    isPaused.value = false;
    resumeTimer();
  }
};

onMounted(() => {
  const clearEntering = setTimeout(() => {
    isEntering.value = false;
  }, ANIMATION_DURATIONS[props.animation] ?? 300);

  if (props.duration > 0) {
    startTimer();
  }
  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer);
    }
    clearTimeout(clearEntering);
  });
});
</script>

<style scoped lang="scss">
@use '../../styles/variables.scss' as *;
@use '../../styles/mixins.scss' as *;
@use '../../styles/animations.scss' as *;

.toast {
  position: relative;
  min-width: 20rem;
  max-width: 25rem;
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  margin-bottom: $spacing-md;
  overflow: hidden;

  @include mobile {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    margin-bottom: $spacing-sm;
  }

  &--entering.toast--anim-slide {
    &.toast--top-left,
    &.toast--top-center,
    &.toast--top-right {
      animation: slideInFromTop 300ms ease-out;
    }

    &.toast--bottom-left,
    &.toast--bottom-center,
    &.toast--bottom-right {
      animation: slideInFromBottom 300ms ease-out;
    }
  }

  &--entering.toast--anim-fade {
    animation: fadeIn 250ms ease-out;
  }

  &--entering.toast--anim-bounce {
    animation: bounceIn 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.toast__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.toast__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.toast__header-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.toast__icon {
  font-size: $font-size-lg;
  font-weight: 600;
  flex-shrink: 0;
}

.toast__title {
  font-size: $font-size-base;
  font-weight: 600;
  margin: 0;
}

.toast__message {
  font-size: $font-size-sm;
  margin: 0;
  padding-left: calc(#{$font-size-lg} + #{$spacing-sm});
  opacity: 0.95;
}

.toast__close {
  color: inherit;
  opacity: 0.7;
  font-size: $font-size-lg;
  padding: 0;
  line-height: 1;
  transition: opacity $transition-base;

  &:hover {
    opacity: 1;
  }
}

.toast__progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 0 0 $radius-lg $radius-lg;
  overflow: hidden;
}

.toast__progress-bar {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  animation: progress-shrink linear forwards;
  transform-origin: left;

  &--paused {
    animation-play-state: paused;
  }
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

// Respect user's motion preferences for accessibility
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none;
    transition: none;

    &--entering {
      animation: none;
    }
  }

  .toast__progress-bar {
    animation: none;
  }
}
</style>
