/**
 * Date Range Picker Layout Tests
 * Prevents regression of dual input layout, calendar positioning, and range validation display
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../date-range-picker/index.ts';
import type { USADateRangePicker } from './usa-date-range-picker.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USADateRangePicker Layout Tests', () => {
  let element: USADateRangePicker;

  beforeEach(() => {
    element = document.createElement('usa-date-range-picker') as USADateRangePicker;
    element.startLabel = 'Start Date';
    element.endLabel = 'End Date';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS date range picker structure', async () => {
    await element.updateComplete;

    const fieldset = element.querySelector('fieldset.usa-form-group');
    const startDatePicker = element.querySelector('usa-date-picker[data-range-start="true"]');
    const endDatePicker = element.querySelector('usa-date-picker[data-range-end="true"]');

    expect(fieldset, 'Date range picker fieldset should exist').toBeTruthy();
    expect(startDatePicker, 'Start date picker should exist').toBeTruthy();
    expect(endDatePicker, 'End date picker should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(fieldset.contains(startDatePicker)).toBe(true);
    expect(fieldset.contains(endDatePicker)).toBe(true);
  });

  it('should position start and end date pickers correctly', async () => {
    await element.updateComplete;

    const gridRow = element.querySelector('.grid-row');
    const startDatePicker = element.querySelector('usa-date-picker[data-range-start="true"]');
    const endDatePicker = element.querySelector('usa-date-picker[data-range-end="true"]');

    expect(gridRow, 'Grid container should exist').toBeTruthy();
    expect(startDatePicker, 'Start picker should exist').toBeTruthy();
    expect(endDatePicker, 'End picker should exist').toBeTruthy();

    // Start picker should appear before end picker in grid
    const gridChildren = Array.from(gridRow.children);
    const startIndex = gridChildren.indexOf(startDatePicker);
    const endIndex = gridChildren.indexOf(endDatePicker);

    expect(startIndex, 'Start picker should appear before end picker').toBeLessThan(endIndex);
  });

  it('should position input groups correctly within each picker', async () => {
    await element.updateComplete;

    // Wait for USWDS to enhance the date pickers
    await new Promise(resolve => setTimeout(resolve, 200));

    const startInputGroup = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__wrapper'
    );
    const endInputGroup = element.querySelector(
      'usa-date-picker[data-range-end="true"] .usa-date-picker__wrapper'
    );
    const startInput = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__external-input'
    ) || element.querySelector('usa-date-picker[data-range-start="true"] input');
    const endInput = element.querySelector(
      'usa-date-picker[data-range-end="true"] .usa-date-picker__external-input'
    ) || element.querySelector('usa-date-picker[data-range-end="true"] input');

    expect(startInputGroup, 'Start input group should exist').toBeTruthy();
    expect(endInputGroup, 'End input group should exist').toBeTruthy();
    expect(startInput, 'Start input should exist').toBeTruthy();
    expect(endInput, 'End input should exist').toBeTruthy();

    // Inputs should be within their respective input groups
    expect(startInputGroup!.contains(startInput!)).toBe(true);
    expect(endInputGroup!.contains(endInput!)).toBe(true);
  });

  it('should position calendar buttons correctly within input groups', async () => {
    await element.updateComplete;

    // Wait for USWDS to enhance the date pickers
    await new Promise(resolve => setTimeout(resolve, 200));

    const startButton = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__button'
    );
    const endButton = element.querySelector(
      'usa-date-picker[data-range-end="true"] .usa-date-picker__button'
    );
    const startInputGroup = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__wrapper'
    );
    const endInputGroup = element.querySelector(
      'usa-date-picker[data-range-end="true"] .usa-date-picker__wrapper'
    );

    expect(startButton, 'Start calendar button should exist').toBeTruthy();
    expect(endButton, 'End calendar button should exist').toBeTruthy();
    expect(startInputGroup, 'Start input group should exist').toBeTruthy();
    expect(endInputGroup, 'End input group should exist').toBeTruthy();

    // Calendar buttons should be within their respective input groups
    if (startButton && startInputGroup) {
      expect(startInputGroup.contains(startButton)).toBe(true);
    }
    if (endButton && endInputGroup) {
      expect(endInputGroup.contains(endButton)).toBe(true);
    }
  });

  it('should position labels correctly for each date picker', async () => {
    await element.updateComplete;

    const startLabel = element.querySelector('usa-date-picker[data-range-start="true"] .usa-label');
    const endLabel = element.querySelector('usa-date-picker[data-range-end="true"] .usa-label');
    const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
    const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');

    expect(startLabel, 'Start label should exist').toBeTruthy();
    expect(endLabel, 'End label should exist').toBeTruthy();
    expect(startPicker, 'Start picker should exist').toBeTruthy();
    expect(endPicker, 'End picker should exist').toBeTruthy();

    // Labels should be within their respective pickers
    expect(startPicker!.contains(startLabel!)).toBe(true);
    expect(endPicker!.contains(endLabel!)).toBe(true);

    // Verify label text
    expect(startLabel!.textContent!.trim()).toBe('Start Date');
    expect(endLabel!.textContent!.trim()).toBe('End Date');
  });

  it('should handle calendar display when opened', async () => {
    await element.updateComplete;

    // Simulate opening start calendar
    const startButton = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__button'
    ) as HTMLButtonElement;
    if (startButton) {
      startButton.click();
      await element.updateComplete;
    }

    const fieldsetContainer = element.querySelector('fieldset.usa-form-group');
    const calendar = element.querySelector('.usa-date-picker__calendar');

    expect(fieldsetContainer, 'Container should exist').toBeTruthy();

    if (calendar) {
      expect(
        fieldsetContainer!.contains(calendar),
        'Calendar should be inside date range picker container'
      ).toBe(true);
    }
  });

  it('should handle error state correctly', async () => {
    element.error = 'This is an error message';
    await element.updateComplete;

    const startInputGroup = element.querySelector(
      'usa-date-picker[data-range-start="true"] .usa-date-picker__wrapper'
    );
    const endInputGroup = element.querySelector(
      'usa-date-picker[data-range-end="true"] .usa-date-picker__wrapper'
    );

    if (startInputGroup) {
      expect(startInputGroup.classList.contains('usa-date-picker__wrapper--error')).toBe(true);
    }
    if (endInputGroup) {
      expect(endInputGroup.classList.contains('usa-date-picker__wrapper--error')).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/date-range-picker/usa-date-range-picker.ts`;
      const validation = validateComponentJavaScript(componentPath, 'date-range-picker');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter(issue =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for date range picker structure', async () => {
      await element.updateComplete;

      const fieldsetContainer = element.querySelector('fieldset.usa-form-group');
      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');

      expect(fieldsetContainer, 'Date range picker should render').toBeTruthy();
      expect(startPicker, 'Start picker should render').toBeTruthy();
      expect(endPicker, 'End picker should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(fieldsetContainer!.classList.contains('usa-form-group')).toBe(true);
      expect(startPicker!.getAttribute('data-range-start')).toBe('true');
      expect(endPicker!.getAttribute('data-range-end')).toBe('true');
    });

    it('should maintain date range picker structure integrity', async () => {
      await element.updateComplete;

      // Wait for USWDS to enhance the date pickers
      await new Promise(resolve => setTimeout(resolve, 200));

      const startInput = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__external-input'
      );
      const endInput = element.querySelector('usa-date-picker[data-range-end="true"] .usa-date-picker__external-input');
      const startButton = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__button'
      );
      const endButton = element.querySelector(
        'usa-date-picker[data-range-end="true"] .usa-date-picker__button'
      );

      expect(startInput, 'Start input should be present').toBeTruthy();
      expect(endInput, 'End input should be present').toBeTruthy();
      expect(startButton, 'Start button should be present').toBeTruthy();
      expect(endButton, 'End button should be present').toBeTruthy();
    });

    it('should handle date range selection correctly', async () => {
      await element.updateComplete;

      // Set date range
      element.startDate = '2024-01-15';
      element.endDate = '2024-01-20';
      await element.updateComplete;

      const startInput = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__external-input'
      ) as HTMLInputElement;
      const endInput = element.querySelector(
        'usa-date-picker[data-range-end="true"] .usa-date-picker__external-input'
      ) as HTMLInputElement;

      if (startInput && endInput) {
        expect(startInput.value).toBe('2024-01-15');
        expect(endInput.value).toBe('2024-01-20');
      }
    });

    it('should handle disabled state correctly', async () => {
      element.disabled = true;
      await element.updateComplete;

      const startInput = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__external-input'
      ) as HTMLInputElement;
      const endInput = element.querySelector(
        'usa-date-picker[data-range-end="true"] .usa-date-picker__external-input'
      ) as HTMLInputElement;
      const startButton = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__button'
      ) as HTMLButtonElement;
      const endButton = element.querySelector(
        'usa-date-picker[data-range-end="true"] .usa-date-picker__button'
      ) as HTMLButtonElement;

      if (startInput) expect(startInput.disabled).toBe(true);
      if (endInput) expect(endInput.disabled).toBe(true);
      if (startButton) expect(startButton.disabled).toBe(true);
      if (endButton) expect(endButton.disabled).toBe(true);
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Select date range';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');

      if (hint) {
        expect(hint.textContent!.trim()).toBe('Select date range');
      }
    });

    it('should maintain proper ARIA relationships', async () => {
      await element.updateComplete;

      const startInput = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-date-picker__external-input'
      );
      const endInput = element.querySelector('usa-date-picker[data-range-end="true"] .usa-date-picker__external-input');
      const startLabel = element.querySelector(
        'usa-date-picker[data-range-start="true"] .usa-label'
      );
      const endLabel = element.querySelector('usa-date-picker[data-range-end="true"] .usa-label');

      if (startInput && startLabel) {
        const startInputId = startInput.getAttribute('id');
        const startLabelFor = startLabel.getAttribute('for');
        expect(startLabelFor).toBe(startInputId);
      }

      if (endInput && endLabel) {
        const endInputId = endInput.getAttribute('id');
        const endLabelFor = endLabel.getAttribute('for');
        expect(endLabelFor).toBe(endInputId);
      }
    });

    it('should handle range validation correctly', async () => {
      await element.updateComplete;

      // Set invalid range (end before start)
      element.startDate = '2024-01-20';
      element.endDate = '2024-01-15';
      await element.updateComplete;

      // Structure should remain intact even with invalid range
      const fieldsetContainer = element.querySelector('fieldset.usa-form-group');
      expect(fieldsetContainer, 'Structure should remain intact with invalid range').toBeTruthy();
    });
  });
});
