<template>
  <div class="preview-panel">
    <h3 class="preview-panel__title">Preview</h3>

    <div
      class="preview-panel__toast-preview"
      :class="`preview-panel__toast-preview--${config.position}`"
    >
      <div
        class="preview-toast"
        :style="{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
        }"
      >
        <div class="preview-toast__header">
          <div class="preview-toast__header-left">
            <span v-if="config.showIcon" class="preview-toast__icon">{{ icon }}</span>
            <h4 class="preview-toast__title">{{ config.title }}</h4>
          </div>
          <button
            v-if="config.showCloseButton"
            class="preview-toast__close"
            aria-label="Close button preview"
          >
            ✕
          </button>
        </div>
        <p class="preview-toast__message">{{ config.message }}</p>
      </div>
    </div>

    <button class="preview-panel__show-button" @click="showNotification">Show Notification</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NotificationConfig } from '../types/notification';
import { DEFAULT_ICONS } from '../utils/constants';

interface Props {
  config: Omit<NotificationConfig, 'id'>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  show: [];
}>();

const icon = computed(() => DEFAULT_ICONS[props.config.type]);

const showNotification = () => {
  emit('show');
};
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.preview-panel {
  background: var(--card-bg);
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: background $transition-base;

  @include mobile {
    padding: $spacing-md;
    border-radius: $radius-md;
  }
}

.preview-panel__title {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  color: var(--title-color);
  transition: color $transition-base;

  @include mobile {
    font-size: $font-size-base;
    margin-bottom: $spacing-md;
  }
}

.preview-panel__toast-preview {
  background: var(--body-bg);
  padding: $spacing-xl;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  display: flex;
  min-height: 250px;
  position: relative;
  transition: background $transition-base;

  @include mobile {
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    min-height: 150px;
  }

  // Position variants
  &--top-left {
    justify-content: flex-start;
    align-items: flex-start;
  }

  &--top-center {
    justify-content: center;
    align-items: flex-start;
  }

  &--top-right {
    justify-content: flex-end;
    align-items: flex-start;
  }

  &--bottom-left {
    justify-content: flex-start;
    align-items: flex-end;
  }

  &--bottom-center {
    justify-content: center;
    align-items: flex-end;
  }

  &--bottom-right {
    justify-content: flex-end;
    align-items: flex-end;
  }
}

.preview-toast {
  min-width: 320px;
  max-width: 400px;
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;

  @include mobile {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
}

.preview-toast__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-sm;
}

.preview-toast__header-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.preview-toast__icon {
  font-size: $font-size-lg;
  font-weight: 600;
  flex-shrink: 0;
}

.preview-toast__title {
  font-size: $font-size-base;
  font-weight: 600;
  margin: 0;
}

.preview-toast__message {
  font-size: $font-size-sm;
  margin: 0;
  padding-left: calc(#{$font-size-lg} + #{$spacing-sm});
  opacity: 0.95;
}

.preview-toast__close {
  color: inherit;
  opacity: 0.7;
  font-size: $font-size-lg;
  padding: 0;
  line-height: 1;
  background: transparent;
  border: none;
  cursor: default;
}

.preview-panel__show-button {
  @include primary-button;
  width: 100%;
  margin-bottom: $spacing-lg;
}

.preview-panel__section {
  margin-top: $spacing-xl;
}

.preview-panel__section-title {
  font-size: $font-size-base;
  font-weight: 600;
  margin-bottom: $spacing-md;
  color: var(--title-color);
  transition: color $transition-base;
}
</style>
