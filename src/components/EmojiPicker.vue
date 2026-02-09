<template>
  <div ref="pickerEl" class="emoji-picker" @keydown.esc.prevent="close">
    <button
      type="button"
      class="emoji-picker__trigger"
      aria-label="Open emoji picker"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      😊
    </button>
    <div v-if="isOpen" class="emoji-picker__panel">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        class="emoji-picker__emoji"
        @click="select(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits<{ (e: 'select', emoji: string): void }>();

const emojis = [
  '😀',
  '😁',
  '😂',
  '😊',
  '😍',
  '🤩',
  '😎',
  '😭',
  '😡',
  '👍',
  '🙏',
  '🔥',
  '🎉',
  '✨',
  '💡',
];
const isOpen = ref(false);
const pickerEl = ref<HTMLElement | null>(null);

const close = () => {
  isOpen.value = false;
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const select = (emoji: string) => {
  emit('select', emoji);
  close();
};

const handleClickOutside = (event: MouseEvent) => {
  if (!pickerEl.value) return;
  if (!pickerEl.value.contains(event.target as Node)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;
@use '../styles/mixins.scss' as *;

.emoji-picker {
  position: relative;
  display: inline-block;
}

.emoji-picker__trigger {
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  border-radius: $radius-md;
  padding: 0 $spacing-sm;
  height: 36px;
  cursor: pointer;
  font-size: 16px;
  transition:
    border-color $transition-base,
    background $transition-base;

  &:hover {
    border-color: $color-primary;
  }
}

.emoji-picker__panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  z-index: $z-modal;
}

.emoji-picker__emoji {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  padding: $spacing-xs;
  line-height: 1.2;
  border-radius: $radius-sm;

  &:hover {
    background: var(--input-bg);
  }
}
</style>
