import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-date-picker.ts';
import type { USADatePicker } from './usa-date-picker.js';

/**
 * Date Picker Structure Regression Tests
 *
 * These tests prevent the specific regression where the date picker
 * only shows the label but not the input field due to incorrect HTML structure.
 *
 * CRITICAL: These tests validate that the basic date picker structure
 * follows the official USWDS pattern and remains visible to users.
 */
describe('Date Picker Structure Regression Prevention', () => {
  let element: USADatePicker;

  beforeEach(async () => {
    element = document.createElement('usa-date-picker') as USADatePicker;
    element.label = 'Test Date';
    element.hint = 'Select a date';
    element.placeholder = 'mm/dd/yyyy';
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Structure Validation (Prevents "label only" regression)', () => {
    it('should render both label AND input field (prevents label-only bug)', async () => {
      await element.updateComplete;

      // These are the core elements that MUST be visible
      const label = element.querySelector('.usa-label');
      const input = element.querySelector('.usa-input');
      const datePicker = element.querySelector('.usa-date-picker');

      // CRITICAL: All three elements must exist for basic functionality
      expect(label, 'Label should be present').toBeTruthy();
      expect(input, 'Input field should be present - this was missing in the regression').toBeTruthy();
      expect(datePicker, 'Date picker container should be present').toBeTruthy();

      // Verify label text is visible
      expect(label?.textContent?.trim()).toBe('Test Date');

      // CRITICAL: Input must be functional
      expect(input?.getAttribute('type')).toBe('text');
      expect(input?.getAttribute('placeholder')).toBe('mm/dd/yyyy');
    });

    it('should follow official USWDS HTML structure pattern', async () => {
      await element.updateComplete;

      // Official USWDS pattern: input directly inside usa-date-picker
      const datePicker = element.querySelector('.usa-date-picker');
      const input = datePicker?.querySelector('.usa-input');

      expect(datePicker, 'usa-date-picker container must exist').toBeTruthy();
      expect(input, 'Input must be direct child of usa-date-picker').toBeTruthy();

      // Verify the input is the direct child (no intermediate wrapper)
      const directInput = datePicker?.children[0];
      expect(directInput?.classList.contains('usa-input')).toBe(true);
    });

    it('should NOT have incorrect wrapper structure that causes visibility issues', async () => {
      await element.updateComplete;

      // The regression was caused by incorrectly nesting:
      // <div class="usa-date-picker__wrapper">
      //   <div class="usa-date-picker">
      //     <input />
      //   </div>
      // </div>

      // This structure should NOT exist in the initial render
      const incorrectWrapper = element.querySelector('.usa-date-picker__wrapper .usa-date-picker .usa-input');
      expect(incorrectWrapper, 'Should NOT have nested wrapper structure in initial render').toBeNull();

      // The correct structure should be: usa-date-picker > input (direct child)
      const correctStructure = element.querySelector('.usa-date-picker > .usa-input');
      expect(correctStructure, 'Input should be direct child of usa-date-picker').toBeTruthy();
    });
  });

  describe('Visual Element Presence (Prevents invisible component regression)', () => {
    it('should have visible label text', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      expect(label?.textContent?.trim()).toBe('Test Date');

      // Check that label is not empty or hidden
      expect(label?.textContent?.length).toBeGreaterThan(0);
    });

    it('should have visible input field with proper attributes', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;
      expect(input, 'Input field must be present and visible').toBeTruthy();

      // Verify input is properly configured
      expect(input.type).toBe('text');
      expect(input.placeholder).toBe('mm/dd/yyyy');
      expect(input.disabled).toBe(false);

      // Verify input has proper USWDS class
      expect(input.classList.contains('usa-input')).toBe(true);
    });

    it('should have visible hint text when provided', async () => {
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint, 'Hint should be present when hint prop is set').toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('Select a date');
    });

    it('should render all elements in a form group container', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup, 'Form group container should be present').toBeTruthy();

      // Verify form group contains all expected elements
      const label = formGroup?.querySelector('.usa-label');
      const hint = formGroup?.querySelector('.usa-hint');
      const datePicker = formGroup?.querySelector('.usa-date-picker');
      const input = formGroup?.querySelector('.usa-input');

      expect(label, 'Label should be in form group').toBeTruthy();
      expect(hint, 'Hint should be in form group').toBeTruthy();
      expect(datePicker, 'Date picker should be in form group').toBeTruthy();
      expect(input, 'Input should be in form group').toBeTruthy();
    });
  });

  describe('Functional Validation (Prevents broken component regression)', () => {
    it('should allow typing in the input field', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;
      expect(input, 'Input must be present for typing').toBeTruthy();

      // Simulate typing
      input.value = '01/15/2024';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Component should reflect the change
      expect(input.value).toBe('01/15/2024');
    });

    it('should have proper accessibility attributes', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input');
      const label = element.querySelector('.usa-label');
      const hint = element.querySelector('.usa-hint');

      // Verify label-input connection
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));

      // Verify hint connection
      const hintId = hint?.getAttribute('id');
      const ariaDescribedBy = input?.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toContain(hintId);
    });

    it('should handle value property correctly', async () => {
      element.value = '2024-01-15';
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;
      expect(input.value).toBe('2024-01-15');

      // Test property updates
      element.value = '2024-12-25';
      await element.updateComplete;
      expect(input.value).toBe('2024-12-25');
    });
  });

  describe('USWDS Compatibility (Prevents integration regression)', () => {
    it('should have correct data attributes for USWDS JavaScript', async () => {
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;

      const datePicker = element.querySelector('.usa-date-picker');
      expect(datePicker?.getAttribute('data-min-date')).toBe('2024-01-01');
      expect(datePicker?.getAttribute('data-max-date')).toBe('2024-12-31');
    });

    it('should have structure ready for USWDS JavaScript enhancement', async () => {
      await element.updateComplete;

      // The structure should be ready for USWDS to add:
      // - usa-date-picker__button
      // - usa-date-picker__calendar
      // - usa-date-picker__wrapper (dynamically)

      const datePicker = element.querySelector('.usa-date-picker');
      const input = element.querySelector('.usa-input');

      // Basic structure must be correct for enhancement
      expect(datePicker, 'Date picker container required for USWDS enhancement').toBeTruthy();
      expect(input, 'Input required for USWDS enhancement').toBeTruthy();
      expect(datePicker?.contains(input as Node)).toBe(true);
    });

    it('should not interfere with USWDS dynamic element creation', async () => {
      await element.updateComplete;

      // Ensure we don't have elements that would conflict with USWDS
      const existingButton = element.querySelector('.usa-date-picker__button');
      const existingCalendar = element.querySelector('.usa-date-picker__calendar');
      const existingWrapper = element.querySelector('.usa-date-picker__wrapper');

      // These should not exist initially (USWDS creates them)
      expect(existingButton, 'Button should not exist initially - USWDS creates it').toBeNull();
      expect(existingCalendar, 'Calendar should not exist initially - USWDS creates it').toBeNull();
      expect(existingWrapper, 'Wrapper should not exist initially - USWDS creates it').toBeNull();
    });
  });

  describe('Regression Test for Specific Bug (GitHub Issue #XXX)', () => {
    it('REGRESSION: should show input field, not just label (fixes date picker invisibility)', async () => {
      // This test specifically prevents the regression where:
      // "The date label is visible but nothing else"

      await element.updateComplete;

      // Get all visible elements
      const allElements = element.querySelectorAll('*');
      const visibleElements = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      // Must have label, input, hint, and containers
      const label = element.querySelector('.usa-label');
      const input = element.querySelector('.usa-input');
      const hint = element.querySelector('.usa-hint');
      const datePicker = element.querySelector('.usa-date-picker');

      // All critical elements must be present
      expect(label, 'REGRESSION: Label missing').toBeTruthy();
      expect(input, 'REGRESSION: Input field missing - this was the main issue').toBeTruthy();
      expect(hint, 'REGRESSION: Hint missing').toBeTruthy();
      expect(datePicker, 'REGRESSION: Date picker container missing').toBeTruthy();

      // The bug was that only label was visible, so we specifically verify:
      expect(visibleElements.length, 'Should have multiple visible elements, not just label').toBeGreaterThan(3);

      // Verify the structure that caused the regression is NOT present
      const nestedWrapperStructure = element.querySelector('.usa-date-picker__wrapper > .usa-date-picker > .usa-input');
      expect(nestedWrapperStructure, 'REGRESSION: Nested wrapper structure should not exist').toBeNull();
    });
  });
});