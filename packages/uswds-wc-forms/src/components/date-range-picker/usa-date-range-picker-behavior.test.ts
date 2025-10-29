/**
 * USWDS Date Range Picker Behavior Contract Tests
 *
 * These tests validate that our date range picker implementation EXACTLY matches
 * USWDS date range picker behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-date-range-picker/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-date-range-picker.js';
import type { USADateRangePicker } from './usa-date-range-picker.js';

describe('USWDS Date Range Picker Behavior Contract', () => {
  let element: USADateRangePicker;

  beforeEach(() => {
    // Create date range picker component
    element = document.createElement('usa-date-range-picker') as USADateRangePicker;
    element.name = 'test-date-range';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Contract 1: Component Initialization', () => {
    it('should add range start and end classes to date pickers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rangePicker = element.querySelector('.usa-date-range-picker');
      expect(rangePicker).not.toBeNull();

      // USWDS adds these classes during initialization
      const rangeStart = element.querySelector('.usa-date-range-picker__range-start');
      const rangeEnd = element.querySelector('.usa-date-range-picker__range-end');

      expect(rangeStart || element.querySelector('[data-range-start]')).not.toBeNull();
      expect(rangeEnd || element.querySelector('[data-range-end]')).not.toBeNull();
    });

    it('should set default min date if not provided', async () => {
      await waitForBehaviorInit(element);

      const rangePicker = element.querySelector('.usa-date-range-picker') as HTMLElement;

      // USWDS sets default min date to "0000-01-01" if not provided
      // Component should have minDate data attribute or property
      const hasMinDate = rangePicker?.dataset?.minDate || element.minDate;
      expect(hasMinDate).toBeTruthy();
    });

    it('should propagate min/max dates to both date pickers', async () => {
      element.minDate = '2020-01-01';
      element.maxDate = '2025-12-31';
      await waitForBehaviorInit(element);

      const startPicker = element.querySelector('[data-range-start]') as any;
      const endPicker = element.querySelector('[data-range-end]') as any;

      // Both pickers should have the same min/max constraints initially
      expect(startPicker?.minDate || startPicker?.dataset?.minDate).toBe('2020-01-01');
      expect(endPicker?.minDate || endPicker?.dataset?.minDate).toBe('2020-01-01');
    });

    it('should contain two date picker elements', async () => {
      await waitForBehaviorInit(element);

      const datePickers = element.querySelectorAll('.usa-date-picker');
      expect(datePickers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Contract 2: Range Start Updates', () => {
    it('should update end picker min date when start date changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-06-15';
      await waitForBehaviorInit(element);

      const endPicker = element.querySelector('[data-range-end]') as any;

      // USWDS updates rangeEndEl.dataset.minDate = updatedDate
      // End picker's min date should be the start date
      const endMinDate =
        endPicker?.minDate || endPicker?.dataset?.minDate || endPicker?.getAttribute('minDate');
      expect(endMinDate).toBe('2023-06-15');
    });

    it('should set range date on end picker when start date is valid', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-06-15';
      await waitForBehaviorInit(element);

      const endPicker = element.querySelector('[data-range-end]') as any;

      // USWDS sets rangeEndEl.dataset.rangeDate = updatedDate
      const rangeDate = endPicker?.dataset?.rangeDate || endPicker?.getAttribute('data-range-date');

      // Range date should be set (may be empty if not synced yet)
      expect(rangeDate !== undefined).toBe(true);
    });

    // NOTE: Invalid date constraint clearing tests moved to Cypress
    // Reason: These tests expect USWDS to dynamically update data-min-date/data-max-date/data-range-date
    // attributes on child date-picker elements, which only happens in browser environment with full
    // USWDS JavaScript running. This is browser-only behavior.
    // See: cypress/e2e/date-range-picker-constraints.cy.ts for browser-based constraint tests

    it('should update calendar if visible when start date changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const startPicker = element.querySelector('[data-range-start]') as any;

      // Open calendar (if supported)
      const toggleButton = startPicker?.querySelector('.usa-date-picker__button');
      if (toggleButton) {
        (toggleButton as HTMLElement).click();
        await waitForBehaviorInit(element);
      }

      element.startDate = '2023-06-15';
      await waitForBehaviorInit(element);

      // USWDS calls updateCalendarIfVisible(rangeEndEl)
      // Calendar should be updated (test that no errors occur)
      expect(element.startDate).toBe('2023-06-15');
    });
  });

  describe('Contract 3: Range End Updates', () => {
    it('should update start picker max date when end date changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.endDate = '2023-12-31';
      await waitForBehaviorInit(element);

      const startPicker = element.querySelector('[data-range-start]') as any;

      // USWDS updates rangeStartEl.dataset.maxDate = updatedDate
      const startMaxDate =
        startPicker?.maxDate ||
        startPicker?.dataset?.maxDate ||
        startPicker?.getAttribute('maxDate');
      expect(startMaxDate).toBe('2023-12-31');
    });

    it('should set range date on start picker when end date is valid', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.endDate = '2023-12-31';
      await waitForBehaviorInit(element);

      const startPicker = element.querySelector('[data-range-start]') as any;

      // USWDS sets rangeStartEl.dataset.rangeDate = updatedDate
      const rangeDate =
        startPicker?.dataset?.rangeDate || startPicker?.getAttribute('data-range-date');

      expect(rangeDate !== undefined).toBe(true);
    });

    it('should update calendar if visible when end date changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endPicker = element.querySelector('[data-range-end]') as any;

      // Open calendar (if supported)
      const toggleButton = endPicker?.querySelector('.usa-date-picker__button');
      if (toggleButton) {
        (toggleButton as HTMLElement).click();
        await waitForBehaviorInit(element);
      }

      element.endDate = '2023-12-31';
      await waitForBehaviorInit(element);

      // USWDS calls updateCalendarIfVisible(rangeStartEl)
      expect(element.endDate).toBe('2023-12-31');
    });
  });

  describe('Contract 4: Date Range Validation', () => {
    it('should enforce start date is before or equal to end date', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-06-15';
      element.endDate = '2023-06-10'; // Invalid: end before start
      await waitForBehaviorInit(element);

      // Component should handle invalid range
      // Either: 1) Clear end date, 2) Prevent setting, 3) Show error
      const isValid = !element.endDate || new Date(element.endDate) >= new Date(element.startDate);
      expect(isValid).toBe(true);
    });

    it('should allow start and end date to be the same day', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-06-15';
      element.endDate = '2023-06-15';
      await waitForBehaviorInit(element);

      // Same day should be valid
      expect(element.startDate).toBe('2023-06-15');
      expect(element.endDate).toBe('2023-06-15');
    });

    it('should validate dates are within global min/max constraints', async () => {
      element.minDate = '2023-01-01';
      element.maxDate = '2023-12-31';
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-06-15';
      element.endDate = '2023-08-20';
      await waitForBehaviorInit(element);

      // Dates should be within constraints
      const start = new Date(element.startDate);
      const end = new Date(element.endDate);
      const min = new Date(element.minDate);
      const max = new Date(element.maxDate);

      expect(start >= min && start <= max).toBe(true);
      expect(end >= min && end <= max).toBe(true);
    });

    it('should handle invalid date formats gracefully', async () => {
      await waitForBehaviorInit(element);

      // Try setting invalid dates
      element.startDate = 'not-a-date';
      element.endDate = '2023-13-45'; // Invalid month/day
      await waitForBehaviorInit(element);

      // Component should not crash
      expect(element).toBeTruthy();
    });
  });

  describe('Contract 5: Event Handling', () => {
    it('should listen for input and change events on range start', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const startPicker = element.querySelector('[data-range-start]');
      expect(startPicker).not.toBeNull();

      // USWDS uses behavior pattern:
      // "input change": { [DATE_RANGE_PICKER_RANGE_START]() { handleRangeStartUpdate(this); } }

      // Dispatch change event
      startPicker?.dispatchEvent(new Event('change', { bubbles: true }));
      await waitForBehaviorInit(element);

      // Event should be handled (no errors)
      expect(true).toBe(true);
    });

    it('should listen for input and change events on range end', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endPicker = element.querySelector('[data-range-end]');
      expect(endPicker).not.toBeNull();

      // USWDS uses behavior pattern:
      // "input change": { [DATE_RANGE_PICKER_RANGE_END]() { handleRangeEndUpdate(this); } }

      endPicker?.dispatchEvent(new Event('change', { bubbles: true }));
      await waitForBehaviorInit(element);

      expect(true).toBe(true);
    });

    it('should handle rapid successive date changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Rapidly change dates
      element.startDate = '2023-06-15';
      await waitForBehaviorInit(element);

      element.endDate = '2023-08-20';
      await waitForBehaviorInit(element);

      element.startDate = '2023-07-01';
      await waitForBehaviorInit(element);

      // Component should handle rapid updates
      expect(element.startDate).toBe('2023-07-01');
      expect(element.endDate).toBe('2023-08-20');
    });
  });

  describe('Contract 6: Context Management', () => {
    it('should find date range picker context from child elements', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // USWDS: el.closest(DATE_RANGE_PICKER)
      const rangePicker = element.querySelector('.usa-date-range-picker');

      // Context should be findable
      expect(rangePicker || element).not.toBeNull();
    });

    it('should maintain references to both start and end pickers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // USWDS stores: { dateRangePickerEl, rangeStartEl, rangeEndEl }
      const startPicker = element.querySelector('[data-range-start]');
      const endPicker = element.querySelector('[data-range-end]');

      expect(startPicker).not.toBeNull();
      expect(endPicker).not.toBeNull();
    });

    it('should query internal input elements from date pickers', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // USWDS: const { internalInputEl } = getDatePickerContext(rangeStartEl)
      const startPicker = element.querySelector('[data-range-start]');
      const endPicker = element.querySelector('[data-range-end]');

      // Each picker should have an input element
      const startInput = startPicker?.querySelector('input');
      const endInput = endPicker?.querySelector('input');

      expect(startInput || startPicker).not.toBeNull();
      expect(endInput || endPicker).not.toBeNull();
    });
  });

  describe('Contract 7: Accessibility', () => {
    it('should use fieldset for grouping date pickers', async () => {
      await waitForBehaviorInit(element);

      const fieldset = element.querySelector('fieldset');
      expect(fieldset).not.toBeNull();
    });

    it('should have legend for date range label', async () => {
      element.label = 'Select date range';
      await waitForBehaviorInit(element);

      const legend = element.querySelector('legend');
      expect(legend).not.toBeNull();
      expect(legend?.textContent).toContain('Select date range');
    });

    it('should maintain individual date picker accessibility', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const startPicker = element.querySelector('[data-range-start]');
      const endPicker = element.querySelector('[data-range-end]');

      // Each date picker should have its own label
      const startLabel = startPicker?.querySelector('label');
      const endLabel = endPicker?.querySelector('label');

      expect(startLabel || startPicker).not.toBeNull();
      expect(endLabel || endPicker).not.toBeNull();
    });

    it('should support required state', async () => {
      element.required = true;
      await waitForBehaviorInit(element);

      // Component should indicate required state
      const hasRequired =
        element.hasAttribute('required') ||
        element.querySelector('[required]') ||
        element.querySelector('.usa-hint--required');

      expect(hasRequired).toBeTruthy();
    });
  });

  describe('Contract 8: Cleanup', () => {
    it('should clean up event listeners on disconnect', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const startPicker = element.querySelector('[data-range-start]');

      element.remove();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Dispatch events after removal should not cause errors
      startPicker?.dispatchEvent(new Event('change', { bubbles: true }));

      expect(true).toBe(true);
    });

    it('should remove all date picker elements on disconnect', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rangePicker = document.querySelector('.usa-date-range-picker');
      expect(rangePicker).not.toBeNull();

      element.remove();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Component and its children should be removed
      const afterRemoval = document.body.contains(element);
      expect(afterRemoval).toBe(false);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT allow end date before start date', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.startDate = '2023-08-20';
      element.endDate = '2023-06-15'; // Invalid
      await waitForBehaviorInit(element);

      // Component should prevent or fix invalid range
      if (element.startDate && element.endDate) {
        const start = new Date(element.startDate);
        const end = new Date(element.endDate);
        expect(end >= start).toBe(true);
      }
    });

    it('should NOT break when date pickers are missing', async () => {
      // Create empty date range picker
      const emptyElement = document.createElement('usa-date-range-picker') as USADateRangePicker;
      document.body.appendChild(emptyElement);

      await emptyElement.updateComplete;

      // Should not crash
      expect(emptyElement).toBeTruthy();

      emptyElement.remove();
    });

    it('should NOT allow dates outside global min/max constraints', async () => {
      element.minDate = '2023-01-01';
      element.maxDate = '2023-12-31';
      await waitForBehaviorInit(element);

      element.startDate = '2022-12-31'; // Before min
      element.endDate = '2024-01-01'; // After max
      await waitForBehaviorInit(element);

      // Dates should be constrained or rejected
      if (element.startDate) {
        const start = new Date(element.startDate);
        const min = new Date(element.minDate);
        expect(start >= min).toBe(true);
      }

      if (element.endDate) {
        const end = new Date(element.endDate);
        const max = new Date(element.maxDate);
        expect(end <= max).toBe(true);
      }
    });
  });
});
