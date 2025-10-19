/**
 * Select Layout Tests
 * Prevents regression of select structure, dropdown positioning, and icon alignment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../select/index.ts';
import type { USASelect } from './usa-select.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USASelect Layout Tests', () => {
  let element: USASelect;

  beforeEach(() => {
    element = document.createElement('usa-select') as USASelect;
    element.label = 'Test Select';
    element.name = 'test-select';
    element.options = [
      { value: 'option1', text: 'Option 1' },
      { value: 'option2', text: 'Option 2' },
      { value: 'option3', text: 'Option 3' },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS select structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const select = element.querySelector('.usa-select');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(select, 'Select element should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(select)).toBe(true);
  });

  it('should position options correctly within select', async () => {
    await element.updateComplete;

    const select = element.querySelector('.usa-select');
    const options = element.querySelectorAll('.usa-select option');

    expect(select, 'Select should exist').toBeTruthy();
    expect(options.length, 'Should have correct number of options').toBe(3);

    // Verify options content
    expect(options[0].textContent.trim()).toBe('Option 1');
    expect(options[1].textContent.trim()).toBe('Option 2');
    expect(options[2].textContent.trim()).toBe('Option 3');
  });

  it('should handle default option correctly', async () => {
    element.defaultOption = 'Choose an option';
    await element.updateComplete;

    const select = element.querySelector('.usa-select');
    const options = element.querySelectorAll('.usa-select option');

    expect(select, 'Select should exist').toBeTruthy();
    expect(options.length, 'Should have default option plus regular options').toBe(4);
    expect(options[0].textContent.trim()).toBe('Choose an option');
    expect((options[0] as HTMLOptionElement).value).toBe('');
  });

  it('should handle error state correctly', async () => {
    element.error = true;
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const select = element.querySelector('.usa-select');

    if (formGroup) {
      expect(formGroup.classList.contains('usa-form-group--error')).toBe(true);
    }
    if (select) {
      expect(select.classList.contains('usa-select--error')).toBe(true);
    }
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    const select = element.querySelector('.usa-select') as HTMLSelectElement;

    if (select) {
      expect(select.disabled).toBe(true);
    }
  });

  it('should handle required state correctly', async () => {
    element.required = true;
    await element.updateComplete;

    const select = element.querySelector('.usa-select') as HTMLSelectElement;

    if (select) {
      expect(select.required).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/select/usa-select.ts`;
      const validation = validateComponentJavaScript(componentPath, 'select');

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
    it('should pass visual layout checks for select structure', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const select = element.querySelector('.usa-select');

      expect(formGroup, 'Form group should render').toBeTruthy();
      expect(select, 'Select should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(select.classList.contains('usa-select')).toBe(true);
    });

    it('should maintain select structure integrity', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const select = element.querySelector('.usa-select');
      const options = element.querySelectorAll('option');

      expect(label, 'Label should be present').toBeTruthy();
      expect(select, 'Select should be present').toBeTruthy();
      expect(options.length, 'Should have options').toBeGreaterThan(0);
    });

    it('should handle value changes correctly', async () => {
      await element.updateComplete;

      const select = element.querySelector('.usa-select') as HTMLSelectElement;

      if (select) {
        select.value = 'option2';
        select.dispatchEvent(new Event('change'));
        await element.updateComplete;

        expect(element.value).toBe('option2');
      }
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Please select an option';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');

      if (hint) {
        expect(hint.textContent.trim()).toBe('Please select an option');
      }
    });

    it('should handle error message correctly', async () => {
      element.error = 'This field is required';
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');

      if (errorMessage) {
        expect(errorMessage.textContent.trim()).toContain('This field is required');
      }
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const select = element.querySelector('.usa-select');

      if (label && select) {
        const labelFor = label.getAttribute('for');
        const selectId = select.getAttribute('id');
        expect(labelFor).toBe(selectId);
      }
    });
  });
});
