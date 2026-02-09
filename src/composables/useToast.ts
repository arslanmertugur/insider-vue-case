import { useToastStore } from '../stores/useToastStore';

// Backward-compatibility alias to the Pinia store.
// This simply returns the Pinia store to avoid duplicate abstraction layers.
export const useToast = useToastStore;
