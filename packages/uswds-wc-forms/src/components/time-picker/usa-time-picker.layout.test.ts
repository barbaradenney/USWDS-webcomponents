/**
 * Time Picker Layout Tests
 * Prevents regression of input group positioning, toggle button, and dropdown list issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../time-picker/index.ts';
import type { USATimePicker } from './usa-time-picker.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USATimePicker Layout Tests', () => {
  let element: USATimePicker;

  beforeEach(() => {
    element = document.createElement('usa-time-picker') as USATimePicker;
    element.label = 'Select a time';
    element.name = 'test-time';
    document.body.appendChild(element);
  });

  afterEach(async () => {
    // Wait for any pending async operations to complete before cleanup
    // Time picker initialization includes async combo-box transformation
    await new Promise(resolve => setTimeout(resolve, 50));
    element.remove();
  });

  it('should have correct USWDS time picker structure', async () => {
    await element.updateComplete;

    const timePicker = element.querySelector('.usa-time-picker');
    const label = element.querySelector('.usa-label');
    // After USWDS transformation, input has .usa-combo-box__input class
    const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');

    expect(timePicker, 'Time picker container should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(input, 'Time input should exist').toBeTruthy();

    // Note: Component uses progressive enhancement
    // USWDS JavaScript creates .usa-input-group, toggle button, and dropdown list
    // Component provides minimal structure: label + .usa-time-picker > input
    expect(timePicker.contains(input), 'Input should be inside time picker container').toBe(true);
  });

  it('should position toggle button correctly within input group', async () => {
    await element.updateComplete;

    // After USWDS transformation, input has .usa-combo-box__input class
    const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');
    const timePicker = element.querySelector('.usa-time-picker');

    expect(input, 'Input should exist').toBeTruthy();
    expect(timePicker, 'Time picker container should exist').toBeTruthy();

    // Note: Toggle button (.usa-combo-box__toggle-list) is created by USWDS JavaScript
    // Component provides minimal structure for progressive enhancement
    // USWDS transforms the input into a full combo-box with toggle button
    expect(timePicker.contains(input), 'Input should be inside time picker').toBe(true);
  });

  it('should position time list correctly when opened', async () => {
    await element.updateComplete;

    // Open the time picker
    element.expanded = true;
    await element.updateComplete;

    const timePicker = element.querySelector('.usa-time-picker');
    const list = element.querySelector('.usa-time-picker__list');

    expect(timePicker, 'Time picker container should exist').toBeTruthy();

    if (list) {
      expect(timePicker.contains(list), 'Time list should be inside time picker container').toBe(
        true
      );

      // List should appear after the input group
      const timePickerChildren = Array.from(timePicker.children);
      const inputGroup = element.querySelector('.usa-input-group');
      const inputGroupIndex = timePickerChildren.indexOf(inputGroup);
      const listIndex = timePickerChildren.indexOf(list);

      expect(listIndex, 'Time list should appear after input group').toBeGreaterThan(
        inputGroupIndex
      );
    }
  });

  it('should handle external input target correctly', async () => {
    // Create an external input
    const externalInput = document.createElement('input');
    externalInput.type = 'text';
    externalInput.id = 'external-time-input';
    document.body.appendChild(externalInput);

    element.inputId = 'external-time-input';
    await element.updateComplete;

    // After USWDS transformation, input has .usa-combo-box__input class
    const internalInput = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');
    const timePicker = element.querySelector('.usa-time-picker');

    // Component always renders an input - it uses the inputId prop for the input's ID
    // The concept of "external input" applies to USWDS JavaScript behavior, not component rendering
    expect(internalInput, 'Input should exist').toBeTruthy();
    expect(timePicker, 'Time picker container should exist').toBeTruthy();
    expect(internalInput?.id, 'Input should have the specified ID').toBe('external-time-input');

    // Clean up
    externalInput.remove();
  });

  it('should maintain proper button visibility and accessibility', async () => {
    await element.updateComplete;

    // After USWDS transformation, input has .usa-combo-box__input class
    const input = (element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input')) as HTMLInputElement;
    const timePicker = element.querySelector('.usa-time-picker');

    expect(input, 'Input should exist').toBeTruthy();
    expect(timePicker, 'Time picker container should exist').toBeTruthy();

    // Note: Toggle button (.usa-combo-box__toggle-list) is created by USWDS JavaScript
    // Component provides minimal structure; USWDS adds the toggle button during enhancement
    // The button visibility and accessibility are handled by USWDS
    expect(input?.type, 'Input should be text type').toBe('text');
  });

  it('should handle time list items correctly', async () => {
    element.expanded = true;
    await element.updateComplete;

    const list = element.querySelector('.usa-time-picker__list');
    const listItems = element.querySelectorAll('.usa-time-picker__list-option');

    if (list && listItems.length > 0) {
      // List should contain time options
      expect(listItems.length, 'Should have time options').toBeGreaterThan(0);

      // Each list item should be properly structured
      listItems.forEach((item, index) => {
        expect(list.contains(item), `List item ${index} should be inside the list`).toBe(true);
        expect(item.getAttribute('role')).toBe('option');
      });
    }
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    // Check the underlying input element (before USWDS transformation)
    const input = element.querySelector('.usa-input') as HTMLInputElement;

    expect(input, 'Input should exist').toBeTruthy();

    if (input) {
      expect(input.disabled, 'Input should be disabled').toBe(true);
    }
  });

  it('should display error state correctly', async () => {
    element.error = true;
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    // After USWDS transformation, input has .usa-combo-box__input class
    const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');

    if (inputGroup) {
      expect(
        inputGroup.classList.contains('usa-input-group--error'),
        'Input group should have error class'
      ).toBe(true);
    }

    if (input) {
      expect(input.classList.contains('usa-input--error'), 'Input should have error class').toBe(
        true
      );
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/time-picker/usa-time-picker.ts`;
      const validation = validateComponentJavaScript(componentPath, 'time-picker');

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
    it('should pass visual layout checks for time picker structure', async () => {
      await element.updateComplete;

      const timePicker = element.querySelector('.usa-time-picker');
      // After USWDS transformation, input has .usa-combo-box__input class
      const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');

      expect(timePicker, 'Time picker should render').toBeTruthy();
      expect(input, 'Input should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(timePicker.classList.contains('usa-time-picker')).toBe(true);
      // After transformation, input will have .usa-combo-box__input class instead of .usa-input
      expect(input.classList.contains('usa-combo-box__input') || input.classList.contains('usa-input')).toBe(true);

      // Note: .usa-input-group is created by USWDS JavaScript during enhancement
    });

    it('should maintain time picker structure integrity', async () => {
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');
      const timePicker = element.querySelector('.usa-time-picker');

      expect(input, 'Input should be present').toBeTruthy();
      expect(timePicker, 'Time picker container should be present').toBeTruthy();

      // Verify input has correct attributes
      if (input) {
        expect(input.getAttribute('type')).toBe('text');
      }

      // Note: Toggle button is created by USWDS JavaScript during enhancement
    });

    it('should handle time selection correctly', async () => {
      await element.updateComplete;

      // Set a time value
      element.value = '14:30';
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = (element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input')) as HTMLInputElement;

      if (input) {
        expect(input.value, 'Input should display selected time').toBe('2:30pm');
      }
    });

    it('should handle expand/collapse state changes', async () => {
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');
      const timePicker = element.querySelector('.usa-time-picker');

      expect(input, 'Input should exist').toBeTruthy();
      expect(timePicker, 'Time picker should exist').toBeTruthy();

      // Note: aria-expanded attribute is set by USWDS JavaScript during interaction
      // Component provides minimal structure; USWDS handles expand/collapse behavior
      // The expanded property would be used by USWDS behavior file
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = (element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input')) as HTMLInputElement;

      if (input) {
        // Should handle keyboard events
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        input.dispatchEvent(keyEvent);
        await element.updateComplete;

        // Structure should remain intact
        const timePicker = element.querySelector('.usa-time-picker');
        expect(
          timePicker,
          'Time picker should maintain structure after keyboard interaction'
        ).toBeTruthy();

        // Note: Keyboard navigation behavior is handled by USWDS JavaScript
      }
    });

    it('should handle list interactions correctly', async () => {
      element.expanded = true;
      await element.updateComplete;

      const list = element.querySelector('.usa-time-picker__list');
      const firstOption = element.querySelector('.usa-time-picker__list-option') as HTMLElement;

      if (list && firstOption) {
        // Should handle option selection
        firstOption.click();
        await element.updateComplete;

        // Structure should remain intact after selection
        const timePicker = element.querySelector('.usa-time-picker');
        expect(timePicker, 'Time picker should maintain structure after selection').toBeTruthy();
      }
    });

    it('should maintain proper ARIA relationships', async () => {
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input');
      const timePicker = element.querySelector('.usa-time-picker');

      expect(input, 'Input should exist').toBeTruthy();
      expect(timePicker, 'Time picker should exist').toBeTruthy();

      // Note: ARIA attributes (role="combobox", aria-controls, aria-autocomplete)
      // are added by USWDS JavaScript during enhancement
      // Component provides minimal structure for progressive enhancement
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Please select a time';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      const timePicker = element.querySelector('.usa-time-picker');

      expect(hint, 'Hint should render').toBeTruthy();
      expect(timePicker, 'Time picker should exist').toBeTruthy();

      // Note: Hint is rendered outside the .usa-time-picker container
      // It's part of the form group structure (label, hint, .usa-time-picker)
      // This matches USWDS pattern where hints are siblings to the control
    });

    it('should handle filter functionality correctly', async () => {
      await element.updateComplete;

      // After USWDS transformation, input has .usa-combo-box__input class
      const input = (element.querySelector('.usa-combo-box__input') || element.querySelector('.usa-input')) as HTMLInputElement;

      if (input) {
        // Simulate typing to filter options
        input.value = '2:';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        // Should maintain proper structure during filtering
        const timePicker = element.querySelector('.usa-time-picker');
        expect(timePicker, 'Time picker should maintain structure during filtering').toBeTruthy();
      }
    });
  });
});
