<template>
  <div class="preset-manager">
    <h3 class="preset-manager__title">Saved Presets</h3>

    <div v-if="presets.length === 0" class="preset-manager__empty">
      <p>No saved presets yet. Save one below!</p>
    </div>

    <div v-else class="preset-list">
      <div v-for="preset in presets" :key="preset.id" class="preset-item">
        <div
          class="preset-item__indicator"
          :style="{ backgroundColor: getTypeColor(preset.config?.type) }"
        ></div>
        <div class="preset-item__content">
          <div class="preset-item__name">{{ preset.name }}</div>
          <div class="preset-item__details">
            {{ formatDuration(preset.config?.duration) }} •
            {{ formatPosition(preset.config?.position) }}
          </div>
        </div>
        <div class="preset-item__actions">
          <button
            class="preset-action-btn preset-action-btn--load"
            @click="emit('load', preset.id)"
          >
            Load
          </button>
          <button
            class="preset-action-btn preset-action-btn--delete"
            @click="emit('delete', preset.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="preset-manager__input-row">
      <input
        v-model="presetName"
        type="text"
        class="preset-manager__input"
        placeholder="Preset name..."
        @keyup.enter="handleSave"
      />
      <button class="preset-manager__save-button" @click="handleSave">Save</button>
    </div>

    <div v-if="presets.length > 0" class="preset-manager__section">
      <h4 class="preset-manager__section-title">Code Export</h4>
      <div class="code-export">
        <pre class="code-export__code">{{ codeExport }}</pre>
        <button class="code-export__copy" @click="copyToClipboard">
          <span class="code-export__copy-icon">📋</span>
          Copy to Clipboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Preset, NotificationConfig } from '../types/notification';

interface Props {
  presets: Preset[];
  currentConfig: Omit<NotificationConfig, 'id'>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [name: string];
  load: [id: string];
  delete: [id: string];
}>();

const presetName = ref('');

const handleSave = () => {
  if (presetName.value.trim()) {
    emit('save', presetName.value.trim());
    presetName.value = '';
  }
};

const codeExport = computed(() => {
  const exportObj = {
    ...props.currentConfig,
  };

  return `const notification = ${JSON.stringify(exportObj, null, 2)};`;
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(codeExport.value);
    alert('Code copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
};

const getTypeColor = (type?: string): string => {
  if (!type) return '#6B7280';
  const colors: Record<string, string> = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#6366F1',
  };
  return colors[type] || '#6B7280';
};

const formatDuration = (duration?: number): string => {
  if (duration === undefined) return '—';
  if (duration === 0) return 'Persistent';
  return `${duration / 1000}s`;
};

const formatPosition = (position?: string): string => {
  if (!position) return '—';
  return position
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.preset-manager {
  background: var(--card-bg);
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  transition: background $transition-base;

  @include mobile {
    padding: $spacing-md;
    border-radius: $radius-md;
  }
}

.preset-manager__title {
  font-size: $font-size-lg;
  font-weight: 600;
  margin: 0;
  color: var(--title-color);
  transition: color $transition-base;

  @include mobile {
    font-size: $font-size-base;
  }
}

.preset-manager__empty {
  padding: $spacing-xl;
  text-align: center;
  background: var(--body-bg);
  border-radius: $radius-md;
  color: var(--input-placeholder);
  font-size: $font-size-sm;
  transition: all $transition-base;

  p {
    margin: 0;
  }
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: var(--body-bg);
  border-radius: $radius-md;
  transition: all $transition-base;
  border: 1px solid var(--card-border);

  &:hover {
    background: var(--input-bg);
    border-color: var(--input-border);
  }
}

.preset-item__indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.preset-item__content {
  flex: 1;
  min-width: 0;
}

.preset-item__name {
  font-size: $font-size-base;
  font-weight: 600;
  color: var(--body-text);
  margin-bottom: 2px;
  transition: color $transition-base;
}

.preset-item__details {
  font-size: $font-size-xs;
  color: var(--input-placeholder);
  transition: color $transition-base;
}

.preset-item__actions {
  display: flex;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.preset-action-btn {
  padding: $spacing-xs $spacing-md;
  border: 1px solid var(--input-border);
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;
  background: var(--card-bg);
  color: var(--body-text);

  &--load {
    &:hover {
      background: var(--input-bg);
      border-color: var(--input-border);
    }
  }

  &--delete {
    color: $color-error;
    border-color: $color-error;

    &:hover {
      background: $color-error;
      color: $color-white;
    }
  }
}

.preset-manager__input-row {
  display: flex;
  gap: $spacing-sm;
}

.preset-manager__input {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border: 1px solid var(--input-border);
  border-radius: $radius-md;
  font-size: $font-size-sm;
  background: var(--input-bg);
  color: var(--input-text);
  transition: all $transition-base;

  &::placeholder {
    color: var(--input-placeholder);
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.preset-manager__save-button {
  padding: $spacing-sm $spacing-lg;
  background: $color-primary;
  color: $color-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: 600;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: #4f46e5;
  }
}

.preset-manager__section {
  margin-top: 0;
}

.preset-manager__section-title {
  font-size: $font-size-base;
  font-weight: 600;
  margin-bottom: $spacing-md;
  color: var(--title-color);
  transition: color $transition-base;
}

.code-export {
  background: $color-gray-900;
  border-radius: $radius-md;
  padding: $spacing-md;
  position: relative;
}

.code-export__code {
  color: $color-gray-100;
  font-family: 'Courier New', monospace;
  font-size: $font-size-xs;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-export__copy {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: $color-gray-800;
  color: $color-white;
  border: 1px solid $color-gray-700;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: $color-gray-700;
  }
}

.code-export__copy-icon {
  font-size: $font-size-sm;
}
</style>
