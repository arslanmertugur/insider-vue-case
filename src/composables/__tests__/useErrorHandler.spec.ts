import { useErrorHandler } from '../useErrorHandler';

const mockAddToast = jest.fn();
const mockToastService = {
  addToast: mockAddToast,
} as any;

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Clear console mocks
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Categorization', () => {
    it('should categorize storage errors correctly', () => {
      const { handleError } = useErrorHandler(mockToastService);

      handleError(new Error('QuotaExceededError'), 'storage');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Error',
        })
      );
    });

    it('should categorize user errors correctly', () => {
      const { handleError } = useErrorHandler(mockToastService);

      handleError('Invalid input', 'user');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
        })
      );
    });

    it('should categorize system errors correctly', () => {
      const { handleError } = useErrorHandler(mockToastService);

      handleError(new Error('Critical system failure'), 'system');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
        })
      );
    });
  });

  describe('Error Severity', () => {
    it('should assign low severity to user errors', () => {
      const { handleError, errors } = useErrorHandler();

      handleError('User validation error', 'user');

      expect(errors.value[0]!.severity).toBe('low');
    });

    it('should assign medium severity to storage errors', () => {
      const { handleError, errors } = useErrorHandler();

      handleError(new Error('Storage error'), 'storage');

      expect(errors.value[0]!.severity).toBe('medium');
    });

    it('should assign medium severity to network errors', () => {
      const { handleError, errors } = useErrorHandler();

      handleError(new Error('Network error'), 'network');

      expect(errors.value[0]!.severity).toBe('medium');
    });
  });

  describe('User-Friendly Messages', () => {
    it('should show quota exceeded message for storage errors', () => {
      const { handleError } = useErrorHandler(mockToastService);

      handleError(new Error('QuotaExceededError'), 'storage');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Storage is full. Please clear some space or delete old presets.',
        })
      );
    });

    it('should show network error message', () => {
      const { handleError } = useErrorHandler(mockToastService);

      handleError(new Error('Network failed'), 'network');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error. Please check your connection and try again.',
        })
      );
    });

    it('should pass through user error messages', () => {
      const { handleError } = useErrorHandler(mockToastService);
      const userMessage = 'Please enter a valid email';

      handleError(userMessage, 'user');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: userMessage,
        })
      );
    });
  });

  describe('showUserError', () => {
    it('should display user error with custom title', () => {
      const { showUserError } = useErrorHandler(mockToastService);

      showUserError('Form validation failed', 'Validation Error');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'Validation Error',
          message: 'Form validation failed',
        })
      );
    });

    it('should use default title when not provided', () => {
      const { showUserError } = useErrorHandler(mockToastService);

      showUserError('Something went wrong');

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notice',
        })
      );
    });
  });

  describe('showSystemError', () => {
    it('should display system error with persistent notification', () => {
      const { showSystemError } = useErrorHandler(mockToastService);

      showSystemError(new Error('Critical failure'));

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'System Error',
          duration: 0, // Persistent
        })
      );
    });

    it('should log system error with context', () => {
      const { showSystemError } = useErrorHandler(mockToastService);
      const consoleSpy = jest.spyOn(console, 'error');
      const context = { userId: '123', action: 'save' };

      showSystemError(new Error('System error'), context);

      expect(consoleSpy).toHaveBeenCalledWith('[System Error]', expect.any(Error), context);
    });
  });

  describe('Error Tracking', () => {
    it('should track errors in errors array', () => {
      const { handleError, errors } = useErrorHandler();

      handleError(new Error('Error 1'), 'system');
      handleError(new Error('Error 2'), 'storage');

      expect(errors.value).toHaveLength(2);
      expect(errors.value[0]!.message).toBe('Error 1');
      expect(errors.value[1]!.message).toBe('Error 2');
    });

    it('should update hasErrors flag', () => {
      const { handleError, hasErrors } = useErrorHandler();

      expect(hasErrors.value).toBe(false);

      handleError(new Error('Test error'), 'system');

      expect(hasErrors.value).toBe(true);
    });

    it('should clear errors', () => {
      const { handleError, clearErrors, errors, hasErrors } = useErrorHandler();

      handleError(new Error('Error 1'), 'system');
      handleError(new Error('Error 2'), 'storage');

      expect(errors.value).toHaveLength(2);
      expect(hasErrors.value).toBe(true);

      clearErrors();

      expect(errors.value).toHaveLength(0);
      expect(hasErrors.value).toBe(false);
    });
  });

  describe('Error Logging', () => {
    it('should log high severity errors to console.error', () => {
      const { handleError } = useErrorHandler();
      const consoleSpy = jest.spyOn(console, 'error');

      handleError(new Error('critical failure'), 'system');

      expect(consoleSpy).toHaveBeenCalledWith('[Error Handler - High Severity]', expect.any(Error));
    });

    it('should log non-high severity errors to console.warn', () => {
      const { handleError } = useErrorHandler();
      const consoleSpy = jest.spyOn(console, 'warn');

      handleError(new Error('minor issue'), 'storage');

      expect(consoleSpy).toHaveBeenCalledWith('[Error Handler]', expect.any(Error));
    });
  });
});
