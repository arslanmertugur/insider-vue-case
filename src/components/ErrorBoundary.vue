<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">⚠️</div>
      <h2 class="error-boundary__title">{{ errorTitle }}</h2>
      <p class="error-boundary__message">{{ errorMessage }}</p>

      <div class="error-boundary__actions">
        <button class="error-boundary__button error-boundary__button--primary" @click="retry">
          Try Again
        </button>
        <button class="error-boundary__button error-boundary__button--secondary" @click="reset">
          Reset
        </button>
      </div>

      <details v-if="showDetailsValue && errorDetails" class="error-boundary__details">
        <summary>Technical Details</summary>
        <pre class="error-boundary__stack">{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, provide, computed } from 'vue';

interface Props {
  errorTitle?: string;
  errorMessage?: string;
  showDetails?: boolean;
  onError?: (error: Error) => void;
  onReset?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: 'Something went wrong',
  errorMessage:
    'An unexpected error occurred. Please try again or contact support if the problem persists.',
  showDetails: undefined,
  onError: undefined,
  onReset: undefined,
});

// Default to showing details (can be overridden via showDetails prop)
const showDetailsValue = computed(() => props.showDetails ?? true);

const hasError = ref(false);
const errorDetails = ref<string>('');
const errorInstance = ref<Error | null>(null);

/**
 * Capture errors from child components
 */
onErrorCaptured((error: Error, instance, info) => {
  hasError.value = true;
  errorInstance.value = error;
  errorDetails.value = `${error.message}\n\n${error.stack || ''}\n\nComponent: ${info}`;

  // Log error for debugging
  console.error('[ErrorBoundary] Caught error:', {
    error,
    instance,
    info,
  });

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error);
  }

  // Prevent error from propagating further
  return false;
});

/**
 * Retry by clearing error state (re-renders child components)
 */
const retry = () => {
  hasError.value = false;
  errorDetails.value = '';
  errorInstance.value = null;
};

/**
 * Reset error and call custom reset handler
 */
const reset = () => {
  retry();

  if (props.onReset) {
    props.onReset();
  }
};

// Provide error boundary status to child components
provide('errorBoundary', {
  hasError: () => hasError.value,
  retry,
  reset,
});
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '../styles/variables.scss' as *;

.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  background: var(--error-boundary-bg);
}

.error-boundary__content {
  max-width: 600px;
  text-align: center;
  background: var(--error-boundary-content-bg);
  padding: $spacing-xl;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
}

.error-boundary__icon {
  font-size: 64px;
  margin-bottom: $spacing-md;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.error-boundary__title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: var(--error-boundary-title-color);
  margin-bottom: $spacing-md;
}

.error-boundary__message {
  font-size: $font-size-base;
  color: var(--error-boundary-message-color);
  margin-bottom: $spacing-lg;
  line-height: 1.6;
}

.error-boundary__actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.error-boundary__button {
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;
  border: none;

  &--primary {
    background: $color-primary;
    color: $color-white;

    &:hover {
      background: color.scale($color-primary, $lightness: -10%);
      transform: translateY(-1px);
      box-shadow: $shadow-md;
    }
  }

  &--secondary {
    background: var(--error-boundary-btn-secondary-bg);
    color: var(--error-boundary-btn-secondary-color);
    border: 1px solid var(--error-boundary-btn-secondary-border);

    &:hover {
      background: var(--error-boundary-btn-secondary-bg-hover);
      border-color: var(--error-boundary-btn-secondary-border-hover);
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.error-boundary__details {
  text-align: left;
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background: var(--error-boundary-details-bg);
  border-radius: $radius-md;
  border: 1px solid var(--error-boundary-details-border);

  summary {
    cursor: pointer;
    font-weight: 500;
    color: var(--error-boundary-details-color);
    user-select: none;

    &:hover {
      color: var(--error-boundary-details-color-hover);
    }
  }
}

.error-boundary__stack {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: var(--error-boundary-stack-bg);
  color: var(--error-boundary-stack-color);
  border-radius: $radius-sm;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Light theme variables */
:root.light-theme {
  --error-boundary-bg: linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%);
  --error-boundary-content-bg: #{$color-white};
  --error-boundary-title-color: #{$color-error};
  --error-boundary-message-color: #{$color-gray-700};
  --error-boundary-btn-secondary-bg: #{$color-gray-100};
  --error-boundary-btn-secondary-color: #{$color-gray-700};
  --error-boundary-btn-secondary-border: #{$color-gray-300};
  --error-boundary-btn-secondary-bg-hover: #{$color-gray-200};
  --error-boundary-btn-secondary-border-hover: #{$color-gray-400};
  --error-boundary-details-bg: #{$color-gray-50};
  --error-boundary-details-border: #{$color-gray-200};
  --error-boundary-details-color: #{$color-gray-700};
  --error-boundary-details-color-hover: #{$color-gray-900};
  --error-boundary-stack-bg: #{$color-gray-900};
  --error-boundary-stack-color: #f0f0f0;
}

/* Dark theme variables */
:root.dark-theme {
  --error-boundary-bg: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  --error-boundary-content-bg: #1a202c;
  --error-boundary-title-color: #fc8181;
  --error-boundary-message-color: #e2e8f0;
  --error-boundary-btn-secondary-bg: #2d3748;
  --error-boundary-btn-secondary-color: #e2e8f0;
  --error-boundary-btn-secondary-border: #4a5568;
  --error-boundary-btn-secondary-bg-hover: #4a5568;
  --error-boundary-btn-secondary-border-hover: #718096;
  --error-boundary-details-bg: #2d3748;
  --error-boundary-details-border: #4a5568;
  --error-boundary-details-color: #cbd5e0;
  --error-boundary-details-color-hover: #f7fafc;
  --error-boundary-stack-bg: #000000;
  --error-boundary-stack-color: #00ff00;
}
</style>
