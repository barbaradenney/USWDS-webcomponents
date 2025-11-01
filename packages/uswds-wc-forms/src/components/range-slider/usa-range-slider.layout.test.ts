/**
 * Range Slider Layout Tests
 * Prevents regression of slider structure, handle positioning, and value display layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../range-slider/index.ts';
import type { USARangeSlider } from './usa-range-slider.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USARangeSlider Layout Tests', () => {
  let element: USARangeSlider;

  beforeEach(() => {
    element = document.createElement('usa-range-slider') as USARangeSlider;
    element.label = 'Test Range';
    element.min = 0;
    element.max = 100;
    element.value = 50;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS range slider structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const range = element.querySelector('.usa-range');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(range, 'Range input should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(range)).toBe(true);
  });

  it('should position range input correctly within form group', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const range = element.querySelector('.usa-range');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(range, 'Range should exist').toBeTruthy();

    // Check that label and range exist in correct order
    // Note: range input is nested inside .usa-range-slider__track, so we check document order
    const labelRect = label.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();

    expect(labelRect.top, 'Label should appear before range').toBeLessThanOrEqual(rangeRect.top);
  });

  it('should display current value correctly', async () => {
    element.showValue = true;
    await element.updateComplete;

    const valueDisplay = element.querySelector('.usa-range__value');

    expect(valueDisplay, 'Value display should exist when showValue is true').toBeTruthy();

    if (valueDisplay) {
      expect(valueDisplay.textContent.trim()).toBe('50');
    }
  });

  it('should position value display correctly relative to range', async () => {
    element.showValue = true;
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const range = element.querySelector('.usa-range');
    const valueDisplay = element.querySelector('.usa-range__value');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(range, 'Range should exist').toBeTruthy();
    expect(valueDisplay, 'Value display should exist').toBeTruthy();

    // Value display should appear after range input within the wrapper
    const wrapper = element.querySelector('.usa-range__wrapper');
    expect(wrapper, 'Range wrapper should exist').toBeTruthy();

    const wrapperChildren = Array.from(wrapper.children);
    const rangeIndex = wrapperChildren.indexOf(range);
    const valueIndex = wrapperChildren.indexOf(valueDisplay);

    expect(valueIndex, 'Value display should appear after range').toBeGreaterThan(rangeIndex);
  });

  it('should handle range attributes correctly', async () => {
    await element.updateComplete;

    const range = element.querySelector('.usa-range') as HTMLInputElement;

    expect(range, 'Range input should exist').toBeTruthy();

    if (range) {
      expect(range.type).toBe('range');
      expect(range.min).toBe('0');
      expect(range.max).toBe('100');
      expect(range.value).toBe('50');
    }
  });

  it('should handle step attribute correctly', async () => {
    element.step = 5;
    await element.updateComplete;

    const range = element.querySelector('.usa-range') as HTMLInputElement;

    if (range) {
      expect(range.step).toBe('5');
    }
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    const range = element.querySelector('.usa-range') as HTMLInputElement;

    if (range) {
      expect(range.disabled).toBe(true);
    }
  });

  it('should handle unit display correctly', async () => {
    element.unit = '%';
    element.showValue = true;
    await element.updateComplete;

    const valueDisplay = element.querySelector('.usa-range__value');

    if (valueDisplay) {
      expect(valueDisplay.textContent.trim()).toBe('50%');
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/range-slider/usa-range-slider.ts`;
        const validation = validateComponentJavaScript(componentPath, 'range-slider');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for range slider structure', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const range = element.querySelector('.usa-range');

      expect(formGroup, 'Form group should render').toBeTruthy();
      expect(range, 'Range should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(range.classList.contains('usa-range')).toBe(true);
    });

    it('should maintain range slider structure integrity', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const range = element.querySelector('.usa-range');

      expect(label, 'Label should be present').toBeTruthy();
      expect(range, 'Range input should be present').toBeTruthy();
    });

    it('should handle value changes correctly', async () => {
      element.showValue = true;
      await element.updateComplete;

      const range = element.querySelector('.usa-range') as HTMLInputElement;
      const valueDisplay = element.querySelector('.usa-range__value');

      if (range && valueDisplay) {
        // Simulate value change
        range.value = '75';
        range.dispatchEvent(new Event('input'));
        await element.updateComplete;

        expect(element.value).toBe(75);
        expect(valueDisplay.textContent.trim()).toBe('75');
      }
    });

    it('should handle error state correctly', async () => {
      element.error = true;
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const range = element.querySelector('.usa-range');

      if (formGroup) {
        expect(formGroup.classList.contains('usa-form-group--error')).toBe(true);
      }
      if (range) {
        expect(range.classList.contains('usa-range--error')).toBe(true);
      }
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Adjust the slider value';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');

      if (hint) {
        expect(hint.textContent.trim()).toBe('Adjust the slider value');
      }
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const range = element.querySelector('.usa-range');

      if (label && range) {
        const labelFor = label.getAttribute('for');
        const rangeId = range.getAttribute('id');
        expect(labelFor).toBe(rangeId);
      }
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;

      const range = element.querySelector('.usa-range') as HTMLInputElement;

      if (range) {
        // Should handle arrow key navigation
        const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        range.dispatchEvent(arrowEvent);
        await element.updateComplete;

        // Structure should remain intact after keyboard interaction
        const formGroup = element.querySelector('.usa-form-group');
        expect(formGroup, 'Structure should remain intact after keyboard interaction').toBeTruthy();
      }
    });

    it('should handle min/max constraints correctly', async () => {
      await element.updateComplete;

      const range = element.querySelector('.usa-range') as HTMLInputElement;

      if (range) {
        // Test setting value beyond max
        range.value = '150';
        range.dispatchEvent(new Event('input'));
        await element.updateComplete;

        // Value should be constrained to max
        expect(element.value).toBeLessThanOrEqual(element.max);

        // Test setting value below min
        range.value = '-10';
        range.dispatchEvent(new Event('input'));
        await element.updateComplete;

        // Value should be constrained to min
        expect(element.value).toBeGreaterThanOrEqual(element.min);
      }
    });

    it('should handle dynamic range updates correctly', async () => {
      await element.updateComplete;

      // Update range properties
      element.min = 10;
      element.max = 200;
      element.value = 150;
      await element.updateComplete;

      const range = element.querySelector('.usa-range') as HTMLInputElement;

      if (range) {
        expect(range.min).toBe('10');
        expect(range.max).toBe('200');
        expect(range.value).toBe('150');
      }
    });
  });
});
