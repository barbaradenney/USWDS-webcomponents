import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../date-picker/usa-date-picker.ts'; // Import nested dependency first
import './usa-date-range-picker.ts';
import type { USADateRangePicker } from './usa-date-range-picker.js';

/**
 * Date Range Picker DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing date picker components
 * - Missing form group wrapper
 * - Incorrect grid layout
 * - Missing range summary
 * - Error state not displaying
 */

describe('Date Range Picker DOM Structure Validation', () => {
  let element: USADateRangePicker;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-date-range-picker') as USADateRangePicker;
    element.label = 'Test Date Range';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have fieldset wrapper', async () => {
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset.usa-date-range-picker');
      expect(fieldset).toBeTruthy();
    });

    it('should have legend with label', async () => {
      element.label = 'Travel Dates';
      await element.updateComplete;

      const legend = element.querySelector('legend.usa-legend');
      expect(legend).toBeTruthy();
      expect(legend?.textContent?.trim()).toContain('Travel Dates');
    });

    it('should have grid layout', async () => {
      await element.updateComplete;

      const gridRow = element.querySelector('.grid-row.grid-gap');
      expect(gridRow).toBeTruthy();
    });

    it('should have two date picker components', async () => {
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers.length).toBe(2);
    });

    it('should have start date picker', async () => {
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker[data-range-start]');
      expect(startPicker).toBeTruthy();
    });

    it('should have end date picker', async () => {
      await element.updateComplete;

      const endPicker = element.querySelector('usa-date-picker[data-range-end]');
      expect(endPicker).toBeTruthy();
    });
  });

  describe('Required Field Validation', () => {
    it('should show required indicator when required', async () => {
      element.required = true;
      await element.updateComplete;

      const abbr = element.querySelector('abbr[title="required"]');
      expect(abbr).toBeTruthy();
    });

    it('should have required class when required', async () => {
      element.required = true;
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.classList.contains('usa-form-group--required')).toBe(true);
    });

    it('should NOT show required indicator when not required', async () => {
      element.required = false;
      await element.updateComplete;

      const abbr = element.querySelector('abbr[title="required"]');
      expect(abbr).toBeFalsy();
    });
  });

  describe('Error State Validation', () => {
    it('should show error message when error prop is set', async () => {
      element.error = 'Invalid date range';
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('Invalid date range');
    });

    it('should have error class when error is present', async () => {
      element.error = 'Invalid date range';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.classList.contains('usa-form-group--error')).toBe(true);
    });

    it('should have error role on error message', async () => {
      element.error = 'Invalid date range';
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage?.getAttribute('role')).toBe('alert');
    });
  });

  describe('Hint Text Validation', () => {
    it('should show hint when hint prop is set', async () => {
      element.hint = 'Select your travel dates';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toContain('Select your travel dates');
    });

    it('should NOT show hint when hint prop is empty', async () => {
      element.hint = '';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeFalsy();
    });
  });

  describe('Range Summary Display', () => {
    it('should show range summary when both dates are set', async () => {
      element.startDate = '2025-01-01';
      element.endDate = '2025-01-05';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeTruthy();
      expect(summary?.textContent).toContain('2025-01-01');
      expect(summary?.textContent).toContain('2025-01-05');
    });

    it('should show days difference in summary', async () => {
      element.startDate = '2025-01-01';
      element.endDate = '2025-01-05';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary?.textContent).toContain('days');
    });

    it('should NOT show range summary when dates are empty', async () => {
      element.startDate = '';
      element.endDate = '';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeFalsy();
    });

    it('should NOT show range summary when only start date is set', async () => {
      element.startDate = '2025-01-01';
      element.endDate = '';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeFalsy();
    });
  });

  describe('Date Picker Properties', () => {
    it('should pass disabled state to date pickers', async () => {
      element.disabled = true;
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker[data-range-start]') as any;
      const endPicker = element.querySelector('usa-date-picker[data-range-end]') as any;

      expect(startPicker?.hasAttribute('disabled')).toBe(true);
      expect(endPicker?.hasAttribute('disabled')).toBe(true);
    });

    it('should pass required state to date pickers', async () => {
      element.required = true;
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker[data-range-start]') as any;
      const endPicker = element.querySelector('usa-date-picker[data-range-end]') as any;

      expect(startPicker?.hasAttribute('required')).toBe(true);
      expect(endPicker?.hasAttribute('required')).toBe(true);
    });

    it('should pass placeholder to date pickers', async () => {
      element.placeholder = 'dd/mm/yyyy';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker[data-range-start]') as any;
      const endPicker = element.querySelector('usa-date-picker[data-range-end]') as any;

      expect(startPicker?.getAttribute('placeholder')).toBe('dd/mm/yyyy');
      expect(endPicker?.getAttribute('placeholder')).toBe('dd/mm/yyyy');
    });
  });

  describe('Accessibility Structure', () => {
    it('should have aria-label on fieldset', async () => {
      element.label = 'Select date range';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.getAttribute('aria-label')).toBe('Select date range');
    });

    it('should use default aria-label when label is empty', async () => {
      element.label = '';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.getAttribute('aria-label')).toBe('Date range picker');
    });
  });
});
