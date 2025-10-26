import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-tooltip.ts';
import type { USATooltip } from './usa-tooltip.js';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
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

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-tooltip') as USATooltip;
    element.label = 'Test Tooltip';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have tooltip trigger', async () => {
      await element.updateComplete;
      await waitForBehaviorInit(element); // Wait for USWDS to transform DOM

      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger).toBeTruthy();
    });

    it('should have tooltip body', async () => {
      await element.updateComplete;
      await waitForBehaviorInit(element); // Wait for USWDS to transform DOM

      const body = element.querySelector('.usa-tooltip__body');
      expect(body).toBeTruthy();
    });
  });

  describe('Position Variants', () => {
    // ARCHITECTURE: Position classes are added by USWDS JavaScript in browser environment
    // These tests require real browser environment and are covered in usa-tooltip.browser.test.ts
    // Skipping in jsdom is architecturally correct - jsdom cannot execute full USWDS transforms
    it.skip('should have top position class', async () => {
      // NOTE: Position classes are added by USWDS JS in browser
      // This test should run in browser tests (usa-tooltip.browser.test.ts)
      element.position = 'top';
      await element.updateComplete;
      await waitForBehaviorInit(element); // Wait for USWDS to transform DOM

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--top')).toBe(true);
    });

    // ARCHITECTURE: Position classes are added by USWDS JavaScript in browser environment
    it.skip('should have bottom position class', async () => {
      // NOTE: Position classes are added by USWDS JS in browser
      // This test should run in browser tests (usa-tooltip.browser.test.ts)
      element.position = 'bottom';
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--bottom')).toBe(true);
    });
  });

  describe('Accessibility Structure', () => {
    // ARCHITECTURE: ARIA attributes are added by USWDS JavaScript in browser environment
    it.skip('should have proper ARIA attributes', async () => {
      // NOTE: ARIA attributes are added by USWDS JS in browser
      // This test should run in browser tests (usa-tooltip.browser.test.ts)
      await element.updateComplete;

      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger?.hasAttribute('aria-describedby')).toBe(true);
    });

    // ARCHITECTURE: Role attributes are added by USWDS JavaScript in browser environment
    it.skip('should have role on tooltip body', async () => {
      // NOTE: Role attributes are added by USWDS JS in browser
      // This test should run in browser tests (usa-tooltip.browser.test.ts)
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.getAttribute('role')).toBe('tooltip');
    });
  });
});
