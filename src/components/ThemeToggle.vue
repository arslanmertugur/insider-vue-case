<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    title="Toggle theme"
    @click="toggleTheme"
  >
    <span class="theme-toggle__icon">{{ isDark ? '🌙' : '☀️' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { toggleTheme, isDark } = useTheme();
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.theme-toggle {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--theme-toggle-bg);
  color: var(--theme-toggle-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
  transition: all $transition-base;
  z-index: 1000;

  &:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: $shadow-lg;
  }

  &:active {
    transform: scale(0.95);
  }
}

.theme-toggle__icon {
  font-size: 24px;
  line-height: 1;
}

/* Theme-specific styles */
:root.light-theme {
  --theme-toggle-bg: #{$color-white};
  --theme-toggle-color: #{$color-gray-900};
}

:root.dark-theme {
  --theme-toggle-bg: #2d3748;
  --theme-toggle-color: #f7fafc;
}
</style>
