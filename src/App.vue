<template>
  <ErrorBoundary>
    <div class="app">
      <ThemeToggle />
      <ToastContainer />
      <ToastBuilderView />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from './components/ErrorBoundary.vue';
import ToastContainer from './components/Toast/ToastContainer.vue';
import ToastBuilderView from './views/ToastBuilderView.vue';
import ThemeToggle from './components/ThemeToggle.vue';
</script>

<style lang="scss">
@use './styles/global.scss';

.app {
  min-height: 100vh;
}
</style>
