import { createToastConfigService } from '../useToastConfig';
import { DEFAULT_COLORS, DEFAULT_ANIMATION } from '../../utils/constants';

describe('useToastConfig', () => {
  const createService = () => createToastConfigService();
  let service: ReturnType<typeof createService>;

  beforeEach(() => {
    service = createService();
    service.resetColors('success');
    service.updateConfig({
      type: 'success',
      title: 'Success!',
      message: 'Your changes have been saved successfully.',
      duration: 3000,
      position: 'top-center',
    });
    service.updateStyle({
      showIcon: true,
      showCloseButton: true,
    });
  });

  describe('Configuration Management', () => {
    test('should initialize with default configuration', () => {
      const { configModel, styleModel } = service;

      expect(configModel.value.type).toBe('success');
      expect(configModel.value.title).toBe('Success!');
      expect(configModel.value.duration).toBe(3000);
      expect(configModel.value.position).toBe('top-center');
      expect(configModel.value.animation).toBe(DEFAULT_ANIMATION);
      expect(styleModel.value.showIcon).toBe(true);
      expect(styleModel.value.showCloseButton).toBe(true);
    });

    test('should update configuration partially', () => {
      const { configModel, updateConfig } = service;

      updateConfig({
        title: 'Updated Title',
        duration: 5000,
      });

      expect(configModel.value.title).toBe('Updated Title');
      expect(configModel.value.duration).toBe(5000);
      // Other properties should remain unchanged
      expect(configModel.value.type).toBe('success');
      expect(configModel.value.position).toBe('top-center');
      expect(configModel.value.animation).toBe(DEFAULT_ANIMATION);
    });

    test('should update style configuration', () => {
      const { styleModel, updateStyle } = service;

      updateStyle({
        showIcon: false,
        showCloseButton: false,
      });

      expect(styleModel.value.showIcon).toBe(false);
      expect(styleModel.value.showCloseButton).toBe(false);
    });

    test('should merge config and style into fullConfig', () => {
      const { fullConfig, updateConfig, updateStyle } = service;

      updateConfig({ title: 'Test Title' });
      updateStyle({ backgroundColor: '#FF0000' });

      expect(fullConfig.value.title).toBe('Test Title');
      expect(fullConfig.value.backgroundColor).toBe('#FF0000');
      expect(fullConfig.value.showIcon).toBe(true);
    });
  });

  describe('Color Management', () => {
    test('should reset colors for success type', () => {
      const { styleModel, resetColors } = service;

      resetColors('success');

      expect(styleModel.value.backgroundColor).toBe(DEFAULT_COLORS.success.bg);
      expect(styleModel.value.textColor).toBe(DEFAULT_COLORS.success.text);
    });

    test('should reset colors for error type', () => {
      const { styleModel, resetColors } = service;

      resetColors('error');

      expect(styleModel.value.backgroundColor).toBe(DEFAULT_COLORS.error.bg);
      expect(styleModel.value.textColor).toBe(DEFAULT_COLORS.error.text);
    });

    test('should reset colors for warning type', () => {
      const { styleModel, resetColors } = service;

      resetColors('warning');

      expect(styleModel.value.backgroundColor).toBe(DEFAULT_COLORS.warning.bg);
      expect(styleModel.value.textColor).toBe(DEFAULT_COLORS.warning.text);
    });

    test('should reset colors for info type', () => {
      const { styleModel, resetColors } = service;

      resetColors('info');

      expect(styleModel.value.backgroundColor).toBe(DEFAULT_COLORS.info.bg);
      expect(styleModel.value.textColor).toBe(DEFAULT_COLORS.info.text);
    });

    test('should allow custom colors to override defaults', () => {
      const { styleModel, resetColors, updateStyle } = service;

      resetColors('success');
      const customBg = '#CUSTOM1';
      const customText = '#CUSTOM2';

      updateStyle({
        backgroundColor: customBg,
        textColor: customText,
      });

      expect(styleModel.value.backgroundColor).toBe(customBg);
      expect(styleModel.value.textColor).toBe(customText);
    });
  });

  describe('Instance Isolation', () => {
    test('should keep separate instances isolated', () => {
      const first = createToastConfigService();
      const second = createToastConfigService();

      first.updateConfig({ title: 'First Title' });
      second.updateConfig({ title: 'Second Title' });

      expect(first.configModel.value.title).toBe('First Title');
      expect(second.configModel.value.title).toBe('Second Title');
    });
  });

  describe('Full Configuration', () => {
    test('should update fullConfig reactively when config changes', () => {
      const { fullConfig, updateConfig } = service;

      const initialTitle = fullConfig.value.title;

      updateConfig({ title: 'New Title' });

      expect(fullConfig.value.title).not.toBe(initialTitle);
      expect(fullConfig.value.title).toBe('New Title');
    });

    test('should update fullConfig reactively when style changes', () => {
      const { fullConfig, updateStyle } = service;

      updateStyle({ backgroundColor: '#REACTIVE' });

      expect(fullConfig.value.backgroundColor).toBe('#REACTIVE');
    });

    test('should contain all required notification properties', () => {
      const { fullConfig } = service;

      expect(fullConfig.value).toHaveProperty('type');
      expect(fullConfig.value).toHaveProperty('title');
      expect(fullConfig.value).toHaveProperty('message');
      expect(fullConfig.value).toHaveProperty('duration');
      expect(fullConfig.value).toHaveProperty('position');
      expect(fullConfig.value).toHaveProperty('animation');
      expect(fullConfig.value).toHaveProperty('backgroundColor');
      expect(fullConfig.value).toHaveProperty('textColor');
      expect(fullConfig.value).toHaveProperty('showIcon');
      expect(fullConfig.value).toHaveProperty('showCloseButton');
    });
  });
});
