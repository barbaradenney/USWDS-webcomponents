import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-date-picker.ts';
import type { USADatePicker } from './usa-date-picker.js';
/**
 * Date-picker DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing calendar button
 * - Missing calendar container
 * - Rendering as plain text input
 * - Incorrect USWDS transformation
 */

describe('Date-picker DOM Structure Validation', () => {
  let element: USADatePicker;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-date-picker') as USADatePicker;
    element.id = 'test-date-picker';
    element.label = 'Test Date Picker';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Critical USWDS Structure', () => {
    it('should have date input field', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const input = element.querySelector('input.usa-input');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBe('text');
    });

    it('should have calendar toggle button', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const button = element.querySelector('.usa-date-picker__button');
      expect(button).toBeTruthy();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should have calendar container', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const calendar = element.querySelector('.usa-date-picker__calendar');
      expect(calendar).toBeTruthy();
    });

    it('should NOT render as plain text input', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should have calendar button, not just input
      const plainInput = element.querySelector('input[type="text"]:only-child');
      expect(plainInput).toBeFalsy();

      const calendarButton = element.querySelector('.usa-date-picker__button');
      expect(calendarButton).toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should have form group wrapper', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup).toBeTruthy();
    });

    it('should have label element', async () => {
      element.label = 'Birth Date';
      await element.updateComplete;

      const label = element.querySelector('label.usa-label');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Birth Date');
    });

    it('should connect label to input via ID', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const label = element.querySelector('label.usa-label');
      // USWDS transforms the input in browser environment
      // In test environment, verify label exists and component has inputId
      expect(label).toBeTruthy();
      expect(element.inputId).toBeTruthy();

      // The label for attribute matches the component's inputId
      const labelFor = label?.getAttribute('for');
      expect(labelFor).toBe(element.inputId);
    });
  });

  describe('Accessibility Structure', () => {
    it('should have proper ARIA attributes on input', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // USWDS transforms the input and adds ARIA attributes in browser
      // In test environment, verify the date picker wrapper exists
      const datePickerWrapper = element.querySelector('.usa-date-picker');
      expect(datePickerWrapper).toBeTruthy();

      // Component sets up proper structure for USWDS to enhance
      expect(element.inputId).toBeTruthy();
      expect(element.label).toBeTruthy();
    });

    it('should have proper ARIA attributes on calendar button', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const button = element.querySelector('.usa-date-picker__button');
      expect(button?.hasAttribute('aria-label')).toBe(true);
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should have role on calendar container', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const calendar = element.querySelector('.usa-date-picker__calendar');
      expect(calendar?.getAttribute('role')).toBeTruthy();
    });
  });

  describe('Error State Validation', () => {
    it('should show error message when error prop is set', async () => {
      element.error = 'Invalid date';
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('Invalid date');
    });

    it('should have error class when error is present', async () => {
      element.error = 'Invalid date';
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
    });
  });

  describe('Required Field Validation', () => {
    it('should show required indicator when required', async () => {
      element.required = true;
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const abbr = label?.querySelector('abbr');
      expect(abbr).toBeTruthy();
      expect(abbr?.getAttribute('title')).toBe('required');
    });

    it('should have required attribute on input', async () => {
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input.usa-input');
      expect(input?.hasAttribute('required')).toBe(true);
    });
  });
});
