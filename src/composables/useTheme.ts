import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export type Theme = 'light' | 'dark';

export interface ThemeComposable {
  theme: Ref<Theme>;
  toggleTheme: () => void;
  setTheme: (newTheme: Theme) => void;
  isDark: Ref<boolean>;
}

const THEME_STORAGE_KEY = 'app-theme';

/**
 * Theme management composable
 * Provides theme state and methods to toggle/set theme
 * Persists theme preference to localStorage
 */
export function useTheme(): ThemeComposable {
  const theme = ref<Theme>('light');
  const isDark = ref(false);

  /**
   * Apply theme to document
   */
  const applyTheme = (newTheme: Theme): void => {
    theme.value = newTheme;
    isDark.value = newTheme === 'dark';

    // Update document class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }

    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('[Theme] Failed to save theme preference:', error);
    }
  };

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = (): void => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  };

  /**
   * Set specific theme
   */
  const setTheme = (newTheme: Theme): void => {
    applyTheme(newTheme);
  };

  /**
   * Initialize theme on mount
   */
  onMounted(() => {
    // Check localStorage for saved preference
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
        return;
      }
    } catch (error) {
      console.warn('[Theme] Failed to load theme preference:', error);
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  });

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark,
  };
}
