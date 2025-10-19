import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-select.ts';
import type { USASelect } from './usa-select.js';
/**
 * Select DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing form group wrapper
 * - Missing label
 * - Error state not displaying
 */

describe('Select DOM Structure Validation', () => {
  let element: USASelect;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-select') as USASelect;
    element.label = 'Test Select';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have form group wrapper', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup).toBeTruthy();
    });

    it('should have label element', async () => {
      await element.updateComplete;

      const label = element.querySelector('label.usa-label');
      expect(label).toBeTruthy();
    });

    it('should have select element', async () => {
      await element.updateComplete;

      const select = element.querySelector('select.usa-select');
      expect(select).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when error prop is set', async () => {
      element.error = 'Selection required';
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('Selection required');
    });

    it('should have error class when error is present', async () => {
      element.error = 'Selection required';
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
    });
  });
});
