<template>
  <div class="style-panel">
    <h3 class="style-panel__title">Style</h3>

    <div class="style-panel__row">
      <div class="style-panel__field">
        <label class="style-panel__label" for="bg-color">Background</label>
        <div class="color-input">
          <input
            id="bg-color"
            v-model="modelValue.backgroundColor"
            type="color"
            class="color-input__picker"
          />
          <input
            v-model="modelValue.backgroundColor"
            type="text"
            class="color-input__text"
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      <div class="style-panel__field">
        <label class="style-panel__label" for="text-color">Text Color</label>
        <div class="color-input">
          <input
            id="text-color"
            v-model="modelValue.textColor"
            type="color"
            class="color-input__picker"
          />
          <input
            v-model="modelValue.textColor"
            type="text"
            class="color-input__text"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>

    <div class="style-panel__field">
      <label class="style-panel__label">Options</label>
      <div class="style-panel__checkboxes">
        <label class="checkbox-label">
          <input v-model="modelValue.showIcon" type="checkbox" class="checkbox-label__input" />
          <span>Show Icon</span>
        </label>
        <label class="checkbox-label">
          <input
            v-model="modelValue.showCloseButton"
            type="checkbox"
            class="checkbox-label__input"
          />
          <span>Show Close Button</span>
        </label>
      </div>
    </div>

    <div class="style-panel__field">
      <label class="style-panel__label">Animation</label>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface StyleModel {
  backgroundColor: string;
  textColor: string;
  showIcon: boolean;
  showCloseButton: boolean;
}

const modelValue = defineModel<StyleModel>({ required: true });

const selectedAnimation = ref('slide');

const animations = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'bounce', label: 'Bounce' },
];
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.style-panel {
  background: $color-white;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.style-panel__title {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  color: $color-gray-900;
}

.style-panel__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.style-panel__field {
  margin-bottom: $spacing-lg;
}

.style-panel__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-gray-700;
  margin-bottom: $spacing-sm;
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

.style-panel__checkboxes {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-gray-700;
  cursor: pointer;
}

.checkbox-label__input {
  cursor: pointer;
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
