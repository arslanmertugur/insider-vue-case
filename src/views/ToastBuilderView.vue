<template>
  <div class="toast-builder-view">
    <div class="toast-builder-view__header">
      <h1 class="toast-builder-view__title">Toast Notification Builder</h1>
    </div>

    <div class="toast-builder-view__layout">
      <div class="toast-builder-view__left">
        <ConfigurationPanel />
      </div>

      <div class="toast-builder-view__right">
        <LivePreview :config="fullConfig" @show="handleShowNotification" />
        <PresetManager
          :presets="presets"
          :current-config="fullConfig"
          class="toast-builder-view__preset-manager"
          @save="handleSavePreset"
          @load="handleLoadPreset"
          @delete="handleDeletePreset"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import ConfigurationPanel from '../components/ConfigurationPanel.vue';
import LivePreview from '../components/LivePreview.vue';
import PresetManager from '../components/PresetManager.vue';
import { DEFAULT_ANIMATION } from '../utils/constants';
import { ToastServiceKey, ToastConfigServiceKey, PresetsServiceKey } from '../types/symbols';

// Inject services instead of direct imports
const toastService = inject(ToastServiceKey);
const toastConfigService = inject(ToastConfigServiceKey);
const presetsService = inject(PresetsServiceKey);

// Safely handle potential undefined (shouldn't happen with plugin, but good practice)
if (!toastService || !toastConfigService || !presetsService) {
  throw new Error('Toast services not provided. Make sure ToastPlugin is installed.');
}

const { addToast } = toastService;
const { fullConfig } = toastConfigService;
const { presets, savePreset, loadPreset, deletePreset } = presetsService;

const handleShowNotification = () => {
  addToast(fullConfig.value);
};

const handleSavePreset = (name: string) => {
  savePreset(name, fullConfig.value);
};

const handleLoadPreset = (id: string) => {
  const preset = loadPreset(id);
  if (preset && toastConfigService) {
    toastConfigService.updateConfig({
      type: preset.type,
      title: preset.title,
      message: preset.message,
      duration: preset.duration,
      position: preset.position,
      animation: preset.animation ?? DEFAULT_ANIMATION,
    });
    toastConfigService.updateStyle({
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      showIcon: preset.showIcon,
      showCloseButton: preset.showCloseButton,
    });
  }
};

const handleDeletePreset = (id: string) => {
  deletePreset(id);
};
</script>

<style lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.toast-builder-view {
  min-height: 100vh;
  padding: $spacing-lg;
  background: var(--view-bg);
  transition: background $transition-base;

  @include mobile {
    padding: $spacing-sm;
  }
}

.toast-builder-view__header {
  text-align: left;
  padding: $spacing-md $spacing-lg;
  background: var(--view-header-bg);
  border-bottom: 1px solid var(--view-header-border);
  margin: (-$spacing-lg) (-$spacing-lg) $spacing-md (-$spacing-lg);
  transition: all $transition-base;

  @include mobile {
    padding: $spacing-sm $spacing-md;
    margin: (-$spacing-sm) (-$spacing-sm) $spacing-sm (-$spacing-sm);
  }
}

.toast-builder-view__title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: var(--view-title-color);
  margin: 0;
  transition: color $transition-base;

  @include mobile {
    font-size: $font-size-base;
  }
}

.toast-builder-view__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  max-width: 1120px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }

  @include mobile {
    gap: $spacing-sm;
  }
}

.toast-builder-view__left,
.toast-builder-view__right {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  @include mobile {
    gap: $spacing-sm;
  }
}

.toast-builder-view__preset-manager {
  margin-top: 0;
}

/* Light theme variables */
:root.light-theme {
  --view-bg: #{$color-gray-50};
  --view-header-bg: #{$color-white};
  --view-header-border: #{$color-gray-200};
  --view-title-color: #{$color-gray-900};
}

/* Dark theme variables */
:root.dark-theme {
  --view-bg: #0f172a;
  --view-header-bg: #1e293b;
  --view-header-border: #334155;
  --view-title-color: #f1f5f9;
}
</style>
