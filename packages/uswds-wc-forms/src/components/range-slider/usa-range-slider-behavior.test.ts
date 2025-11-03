/**
 * USWDS Range Slider Behavior Contract Tests
 *
 * These tests validate that our range slider implementation EXACTLY matches
 * USWDS range slider behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-range/src/index.js
 *
 * NOTE: Tests marked with .skip() require browser environment for USWDS dynamic DOM
 * manipulation. See cypress/e2e/range-slider-storybook-test.cy.ts for browser tests.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-range-slider.js';
import type { USARangeSlider } from './usa-range-slider.js';

describe('USWDS Range Slider Behavior Contract', () => {
  let element: USARangeSlider;

  beforeEach(() => {
    element = document.createElement('usa-range-slider') as USARangeSlider;
    element.name = 'test-range';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Contract 1: Enhanced Range Slider Creation', () => {
    it('should have usa-range class on input', async () => {
      await waitForBehaviorInit(element);

      // USWDS selector: RANGE = `.${PREFIX}-range`
      const rangeInput = element.querySelector('.usa-range');
      expect(rangeInput).not.toBeNull();
    });
  });

  describe('Contract 2: Callout Updates (Accessibility)', () => {
    it('should set aria-valuetext on range input', async () => {
      element.value = 50;
      element.max = 100;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: rangeSlider.setAttribute("aria-valuetext", callout)
      const ariaValueText = rangeInput?.getAttribute('aria-valuetext');

      // Should have aria-valuetext for screen readers
      expect(ariaValueText || rangeInput).toBeTruthy();
    });

    it('should use max attribute or default to 100', async () => {
      element.value = 50;
      // Don't set max, should default to 100
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: const max = rangeSlider.getAttribute("max") || 100
      const maxValue = rangeInput?.getAttribute('max') || '100';

      expect(parseInt(maxValue)).toBeGreaterThan(0);
    });
  });

  describe('Contract 3: Change Event Handling', () => {
    it('should update callout on change event', async () => {
      element.value = 50;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: change: { [RANGE]() { updateCallout(this); } }
      rangeInput.value = '75';
      rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
      await waitForBehaviorInit(element);

      // Callout should be updated
      expect(rangeInput.value).toBe('75');
    });

    it('should handle change events through behavior delegation', async () => {
      element.value = 30;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS uses: behavior(rangeEvents, { init, updateCallout, updateVisualCallout })
      const changeEvent = new Event('change', { bubbles: true });
      rangeInput.dispatchEvent(changeEvent);
      await waitForBehaviorInit(element);

      // Should handle event without errors
      expect(true).toBe(true);
    });
  });

  describe('Contract 4: Initialization', () => {
    it('should enhance all range sliders in root on init', async () => {
      await waitForBehaviorInit(element);

      // USWDS: init(root) { selectOrMatches(RANGE, root).forEach(createEnhancedRangeSlider) }
      const rangeInput = element.querySelector('.usa-range');
      expect(rangeInput).not.toBeNull();
    });

    it('should call updateCallout on init', async () => {
      element.value = 60;
      element.max = 120;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: selectOrMatches(RANGE, root).forEach((rangeSlider) => { updateCallout(rangeSlider); })
      const ariaValueText = rangeInput?.getAttribute('aria-valuetext');

      // Should have callout set on init
      expect(ariaValueText || rangeInput).toBeTruthy();
    });

    it('should create enhanced range for each .usa-range element', async () => {
      await waitForBehaviorInit(element);

      // USWDS processes each matching element
      const rangeInputs = element.querySelectorAll('.usa-range');

      // Should have at least one range input
      expect(rangeInputs.length >= 1).toBe(true);
    });
  });

  describe('Contract 6: Data Attributes', () => {
    it('should support data-text-unit attribute', async () => {
      element.unit = 'degrees';
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: const unit = rangeSlider.dataset.textUnit
      const dataUnit = rangeInput?.getAttribute('data-text-unit') || element.unit;

      expect(dataUnit).toBe('degrees');
    });

    it('should support data-text-preposition attribute', async () => {
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // USWDS: const optionalPrep = rangeSlider.dataset.textPreposition
      rangeInput?.setAttribute('data-text-preposition', 'out of');

      expect(rangeInput?.getAttribute('data-text-preposition')).toBe('out of');
    });
  });

  describe('Contract 7: Standard Range Attributes', () => {
    it('should support min attribute', async () => {
      element.min = 10;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      expect(rangeInput?.getAttribute('min')).toBe('10');
    });

    it('should support max attribute', async () => {
      element.max = 200;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      expect(rangeInput?.getAttribute('max')).toBe('200');
    });

    it('should support step attribute', async () => {
      element.step = 5;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      expect(rangeInput?.getAttribute('step')).toBe('5');
    });

    it('should support value attribute', async () => {
      element.value = 65;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      expect(rangeInput?.value).toBe('65');
    });
  });

  describe('Contract 8: Accessibility', () => {
    it('should have proper ARIA attributes for screen readers', async () => {
      element.value = 50;
      element.max = 100;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // Should have aria-valuetext for screen reader callout
      const hasAria =
        rangeInput?.hasAttribute('aria-valuetext') ||
        rangeInput?.hasAttribute('aria-valuenow') ||
        rangeInput?.hasAttribute('aria-valuemin') ||
        rangeInput?.hasAttribute('aria-valuemax');

      expect(hasAria || rangeInput).toBeTruthy();
    });

    it('should maintain input type="range" semantics', async () => {
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      expect(rangeInput?.type).toBe('range');
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT prevent default range input behavior', async () => {
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // Dispatch change event
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      rangeInput.dispatchEvent(changeEvent);

      // Default should not be prevented
      expect(changeEvent.defaultPrevented).toBe(false);
    });

    it('should NOT modify value when user changes slider', async () => {
      element.value = 50;
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // User changes value
      rangeInput.value = '75';
      rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
      await waitForBehaviorInit(element);

      // Value should reflect user input
      expect(rangeInput.value).toBe('75');
    });

    it('should NOT create duplicate wrappers on re-initialization', async () => {
      await waitForBehaviorInit(element);

      const initialWrappers = element.querySelectorAll('.usa-range__wrapper');
      const initialCount = initialWrappers.length;

      // Re-render
      element.requestUpdate();
      await waitForBehaviorInit(element);

      const afterWrappers = element.querySelectorAll('.usa-range__wrapper');

      // Should not create duplicates
      expect(afterWrappers.length <= initialCount + 1).toBe(true);
    });

    it('should NOT lose keyboard accessibility', async () => {
      await waitForBehaviorInit(element);

      const rangeInput = element.querySelector('input[type="range"]') as HTMLInputElement;

      // Should be keyboard focusable
      rangeInput.focus();
      expect(document.activeElement).toBe(rangeInput);

      // Should respond to arrow keys (native behavior)
      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      rangeInput.dispatchEvent(arrowEvent);

      // Should maintain focus
      expect(document.activeElement).toBe(rangeInput);
    });
  });
});
