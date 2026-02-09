<template>
  <div class="config-panel">
    <h3 class="config-panel__title">Configuration</h3>

    <div class="config-panel__field">
      <label class="config-panel__label">Type</label>
      <div class="config-panel__types">
        <button
          v-for="type in types"
          :key="type.value"
          class="type-button"
          :class="{ 'type-button--active': modelValue.type === type.value }"
          :data-type="type.value"
          @click="updateType(type.value)"
        >
          <span class="type-button__icon">{{ type.icon }}</span>
          <span>{{ type.label }}</span>
        </button>
      </div>
    </div>

    <div class="config-panel__field">
      <label class="config-panel__label" for="title-input">Title</label>
      <div class="config-panel__input-group">
        <input
          id="title-input"
          ref="titleInput"
          v-model="modelValue.title"
          type="text"
          class="config-panel__input"
          placeholder="Enter title"
        />
        <EmojiPicker class="config-panel__emoji" @select="handleTitleEmoji" />
      </div>
    </div>

    <div class="config-panel__field">
      <label class="config-panel__label" for="message-input">Message</label>
      <div class="config-panel__input-group config-panel__input-group--textarea">
        <textarea
          id="message-input"
          ref="messageInput"
          v-model="modelValue.message"
          class="config-panel__textarea"
          placeholder="Enter message"
          rows="4"
        />
        <EmojiPicker class="config-panel__emoji" @select="handleMessageEmoji" />
      </div>
    </div>

    <div class="config-panel__field">
      <div class="config-panel__field-header">
        <label class="config-panel__label" for="duration-input">Duration</label>
        <span class="config-panel__value">{{ durationLabel }}</span>
      </div>
      <input
        id="duration-input"
        v-model.number="durationSeconds"
        type="range"
        min="0"
        max="10"
        step="1"
        class="config-panel__slider"
      />
      <label class="config-panel__checkbox-label">
        <input v-model="isPersistent" type="checkbox" class="config-panel__checkbox" />
        <span>Persistent (no auto-dismiss)</span>
      </label>
    </div>

    <div class="config-panel__field">
      <label class="config-panel__label">Position</label>
      <div class="position-grid">
        <button
          v-for="pos in positions"
          :key="pos.value"
          class="position-button"
          :class="{ 'position-button--active': modelValue.position === pos.value }"
          @click="modelValue.position = pos.value"
        >
          {{ pos.label }}
        </button>
      </div>
    </div>

    <div class="config-panel__divider"></div>

    <div class="config-panel__section">
      <h4 class="config-panel__section-title">Style</h4>

      <div class="config-panel__row">
        <div class="config-panel__field">
          <label class="config-panel__label" for="bg-color">Background</label>
          <div class="color-input">
            <input
              id="bg-color"
              v-model="styleModel.backgroundColor"
              type="color"
              class="color-input__picker"
            />
            <input
              v-model="styleModel.backgroundColor"
              type="text"
              class="color-input__text"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div class="config-panel__field">
          <label class="config-panel__label" for="text-color">Text Color</label>
          <div class="color-input">
            <input
              id="text-color"
              v-model="styleModel.textColor"
              type="color"
              class="color-input__picker"
            />
            <input
              v-model="styleModel.textColor"
              type="text"
              class="color-input__text"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      <div class="config-panel__field">
        <label class="config-panel__label">Options</label>
        <div class="config-panel__options">
          <label class="config-panel__checkbox-label">
            <input v-model="styleModel.showIcon" type="checkbox" class="config-panel__checkbox" />
            <span>Show Icon</span>
          </label>
          <label class="config-panel__checkbox-label">
            <input
              v-model="styleModel.showCloseButton"
              type="checkbox"
              class="config-panel__checkbox"
            />
            <span>Show Close Button</span>
          </label>
        </div>
      </div>

      <div class="config-panel__field">
        <label class="config-panel__label">Animation</label>
        <div class="animation-buttons">
          <button
            v-for="anim in animations"
            :key="anim.value"
            class="animation-button"
            :class="{ 'animation-button--active': selectedAnimation === anim.value }"
            @click="selectedAnimation = anim.value"
          >
            {{ anim.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, nextTick, inject } from 'vue';
import { useToastConfig } from '../composables/useToastConfig';
import type { NotificationType, Position, AnimationType } from '../types/notification';
import { ToastConfigServiceKey } from '../types/symbols';
import EmojiPicker from './EmojiPicker.vue';

const injectedConfig = inject(ToastConfigServiceKey, null);
const { configModel, styleModel } = injectedConfig ?? useToastConfig();
const titleInput = ref<HTMLInputElement | null>(null);
const messageInput = ref<HTMLTextAreaElement | null>(null);

// Alias for template compatibility (to avoid changing all template references)
const modelValue = configModel;

const types = [
  { value: 'success' as NotificationType, label: 'Success', icon: '✓' },
  { value: 'error' as NotificationType, label: 'Error', icon: '✕' },
  { value: 'warning' as NotificationType, label: 'Warning', icon: '⚠' },
  { value: 'info' as NotificationType, label: 'Info', icon: 'i' },
];

const positions = [
  { value: 'top-left' as Position, label: 'TL' },
  { value: 'top-center' as Position, label: 'TC' },
  { value: 'top-right' as Position, label: 'TR' },
  { value: 'bottom-left' as Position, label: 'BL' },
  { value: 'bottom-center' as Position, label: 'BC' },
  { value: 'bottom-right' as Position, label: 'BR' },
];

const animations: Array<{ value: AnimationType; label: string }> = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'bounce', label: 'Bounce' },
];

const selectedAnimation = computed({
  get: () => modelValue.value.animation,
  set: (value: AnimationType) => {
    modelValue.value.animation = value;
  },
});

const isPersistent = computed({
  get: () => modelValue.value.duration === 0,
  set: val => {
    modelValue.value.duration = val ? 0 : 3000;
  },
});

const durationSeconds = computed({
  get: () => (modelValue.value.duration === 0 ? 3 : modelValue.value.duration / 1000),
  set: (val: number) => {
    if (!isPersistent.value) {
      modelValue.value.duration = val * 1000;
    }
  },
});

const durationLabel = computed(() => {
  return isPersistent.value ? 'Persistent' : `${durationSeconds.value}s`;
});

const insertEmoji = async (
  target: HTMLInputElement | HTMLTextAreaElement | null,
  currentValue: string,
  emoji: string,
  setter: (next: string) => void
) => {
  if (!target) {
    setter(`${currentValue}${emoji}`);
    return;
  }

  const start = target.selectionStart ?? currentValue.length;
  const end = target.selectionEnd ?? currentValue.length;
  const nextValue = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
  setter(nextValue);

  const cursor = start + emoji.length;
  await nextTick();
  target.setSelectionRange(cursor, cursor);
  target.focus();
};

const handleTitleEmoji = (emoji: string) => {
  insertEmoji(
    titleInput.value,
    modelValue.value.title,
    emoji,
    next => (modelValue.value.title = next)
  );
};

const handleMessageEmoji = (emoji: string) => {
  insertEmoji(
    messageInput.value,
    modelValue.value.message,
    emoji,
    next => (modelValue.value.message = next)
  );
};

import { DEFAULT_COLORS } from '../utils/constants';

const updateType = (type: NotificationType) => {
  modelValue.value.type = type;
  styleModel.value.backgroundColor = DEFAULT_COLORS[type].bg;
  styleModel.value.textColor = DEFAULT_COLORS[type].text;
};

// When persistent is toggled off, reset to 3 seconds
watch(isPersistent, newVal => {
  if (!newVal && modelValue.value.duration === 0) {
    modelValue.value.duration = 3000;
  }
});
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.config-panel {
  background: var(--card-bg);
  padding: $spacing-lg;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  max-width: 100%;
  transition: background $transition-base;

  @include mobile {
    padding: $spacing-md;
    border-radius: $radius-md;
  }
}

.config-panel__title {
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

.config-panel__field {
  margin-bottom: $spacing-lg;

  @include mobile {
    margin-bottom: $spacing-md;
  }
}

.config-panel__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: 500;
  color: var(--label-color);
  margin-bottom: $spacing-sm;
  transition: color $transition-base;
}

.config-panel__label-hint {
  font-weight: 400;
  color: $color-gray-500;
  margin-left: $spacing-sm;
}

.config-panel__field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.config-panel__value {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-gray-600;
}

.config-panel__types {
  @include grid-4col;
  max-width: 100%;
}

.type-button {
  padding: $spacing-md;
  border: 2px solid var(--card-border);
  border-radius: $radius-md;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: var(--body-text);
  transition: all $transition-base;

  &:hover {
    border-color: var(--input-border);
  }

  &--active {
    color: $color-white;

    &[data-type='success'] {
      border-color: $color-success;
      background: $color-success;
    }

    &[data-type='error'] {
      border-color: $color-error;
      background: $color-error;
    }

    &[data-type='warning'] {
      border-color: $color-warning;
      background: $color-warning;
    }

    &[data-type='info'] {
      border-color: $color-primary;
      background: $color-primary;
    }
  }
}

.type-button__icon {
  font-size: $font-size-xl;

  // Color icons based on type, even when not active
  .type-button[data-type='success']:not(.type-button--active) & {
    color: $color-success;
  }

  .type-button[data-type='error']:not(.type-button--active) & {
    color: $color-error;
  }

  .type-button[data-type='warning']:not(.type-button--active) & {
    color: $color-warning;
  }

  .type-button[data-type='info']:not(.type-button--active) & {
    color: $color-info;
  }
}

.config-panel__input,
.config-panel__textarea {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid var(--input-border);
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: var(--input-text);
  background: var(--input-bg);
  transition: all $transition-base;

  &::placeholder {
    color: var(--input-placeholder);
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.config-panel__textarea {
  resize: vertical;
  min-height: 80px;
}

.config-panel__input-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.config-panel__input-group--textarea {
  align-items: flex-start;
}

.config-panel__emoji {
  flex: 0 0 auto;
}

.config-panel__slider {
  width: 100%;
  margin-bottom: $spacing-sm;
}

.config-panel__checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: var(--body-text);
  cursor: pointer;
  transition: color $transition-base;
}

.config-panel__checkbox {
  cursor: pointer;
}

.position-grid {
  @include grid-3col;
  max-width: 33%;

  @include mobile {
    max-width: 100%;
  }
}

.position-button {
  @include base-button;
  font-size: 11px;

  &:hover {
    border-color: $color-gray-300;
  }

  &--active {
    border-color: $color-primary;
    background: $color-primary;
    color: $color-white;
  }
}

.config-panel__divider {
  height: 1px;
  background: var(--divider-color);
  margin: $spacing-lg 0;
  transition: background $transition-base;
}

.config-panel__section-title {
  font-size: $font-size-base;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  color: var(--title-color);
  transition: color $transition-base;
}

.config-panel__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  max-width: 100%;

  @include mobile {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}

.color-input {
  @include color-input-container;
}

.color-input__picker {
  @include color-input-picker;
}

.color-input__text {
  @include color-input-text;
}

.config-panel__options {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
}

.animation-buttons {
  display: flex;
  gap: $spacing-sm;
}

.animation-button {
  @include base-button;
  flex: 1;

  &:hover {
    border-color: $color-gray-300;
  }

  &--active {
    border-color: $color-primary;
    background: $color-primary;
    color: $color-white;
  }
}
</style>
