import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger).toBeTruthy();
    });

    it('should have tooltip body', async () => {
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body).toBeTruthy();
    });
  });

  describe('Position Variants', () => {
    it('should have top position class', async () => {
      element.position = 'top';
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--top')).toBe(true);
    });

    it('should have bottom position class', async () => {
      element.position = 'bottom';
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.classList.contains('usa-tooltip__body--bottom')).toBe(true);
    });
  });

  describe('Accessibility Structure', () => {
    it('should have proper ARIA attributes', async () => {
      await element.updateComplete;

      const trigger = element.querySelector('.usa-tooltip__trigger');
      expect(trigger?.hasAttribute('aria-describedby')).toBe(true);
    });

    it('should have role on tooltip body', async () => {
      await element.updateComplete;

      const body = element.querySelector('.usa-tooltip__body');
      expect(body?.getAttribute('role')).toBe('tooltip');
    });
  });
});
