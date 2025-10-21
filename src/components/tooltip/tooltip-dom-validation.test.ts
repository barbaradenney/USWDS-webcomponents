import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';
import './usa-tooltip.ts';
import type { USATooltip } from './usa-tooltip.js';
/**
 * Tooltip DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing tooltip body
 * - Positioning issues
 * - Missing trigger element
 */

describe('Tooltip DOM Structure Validation', () => {
  let element: USATooltip;
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-tooltip') as USATooltip;
    element.label = 'Test Tooltip';
    container.appendChild(element);

    // Wait for tooltip behavior to initialize and transform DOM
    await waitForBehaviorInit(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have tooltip trigger', async () => {
      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger).toBeTruthy();
    });

    it('should have tooltip body', async () => {
      const body = element.querySelector('.usa-tooltip__body');
      expect(body).toBeTruthy();
    });
  });

  describe('Position Variants', () => {
    it('should have top position class when shown', async () => {
      element.position = 'top';
      await element.updateComplete;
      await waitForBehaviorInit(element);

      // Position classes are only applied when tooltip is shown
      const trigger = element.querySelector('.usa-tooltip__trigger') as HTMLElement;
      trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

      // Wait for showToolTip setTimeout (20ms)
      await new Promise(resolve => setTimeout(resolve, 50));

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--top')).toBe(true);
    });

    it('should have bottom position class when shown', async () => {
      // Create a new element with bottom position from the start
      const bottomElement = document.createElement('usa-tooltip') as USATooltip;
      bottomElement.label = 'Bottom Tooltip';
      bottomElement.position = 'bottom';
      container.appendChild(bottomElement);

      await waitForBehaviorInit(bottomElement);

      // Position classes are only applied when tooltip is shown
      const trigger = bottomElement.querySelector('.usa-tooltip__trigger') as HTMLElement;
      trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

      // Wait for showToolTip setTimeout (20ms)
      await new Promise(resolve => setTimeout(resolve, 50));

      const body = bottomElement.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--bottom')).toBe(true);
    });
  });

  describe('Accessibility Structure', () => {
    it('should have proper ARIA attributes', async () => {
      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger?.hasAttribute('aria-describedby')).toBe(true);
    });

    it('should have role on tooltip body', async () => {
      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.getAttribute('role')).toBe('tooltip');
    });
  });
});
