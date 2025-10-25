/**
 * Checkbox Layout Tests
 * Prevents regression of checkbox alignment, label positioning, and group layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../checkbox/index.ts';
import type { USACheckbox } from './usa-checkbox.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USACheckbox Layout Tests', () => {
  let element: USACheckbox;

  beforeEach(() => {
    element = document.createElement('usa-checkbox') as USACheckbox;
    element.label = 'Test Checkbox';
    element.name = 'test-checkbox';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS checkbox structure', async () => {
    await element.updateComplete;

    // No form group wrapper for individual checkbox elements (USWDS best practice)
    const checkbox = element.querySelector('.usa-checkbox');
    const input = element.querySelector('.usa-checkbox__input');
    const label = element.querySelector('.usa-checkbox__label');

    expect(checkbox, 'Checkbox container should exist').toBeTruthy();
    expect(input, 'Checkbox input should exist').toBeTruthy();
    expect(label, 'Checkbox label should exist').toBeTruthy();

    // Verify USWDS structure hierarchy - checkbox contains input and label
    expect(checkbox.contains(input)).toBe(true);
    expect(checkbox.contains(label)).toBe(true);
  });

  it('should position input and label correctly within checkbox', async () => {
    await element.updateComplete;

    const checkbox = element.querySelector('.usa-checkbox');
    const input = element.querySelector('.usa-checkbox__input');
    const label = element.querySelector('.usa-checkbox__label');

    // Input should appear before label in checkbox
    const checkboxChildren = Array.from(checkbox.children);
    const inputIndex = checkboxChildren.indexOf(input);
    const labelIndex = checkboxChildren.indexOf(label);

    expect(inputIndex, 'Input should appear before label').toBeLessThan(labelIndex);
  });

  it('should handle tile variant layout correctly', async () => {
    element.tile = true;
    await element.updateComplete;

    const checkbox = element.querySelector('.usa-checkbox');

    if (checkbox) {
      expect(
        checkbox.classList.contains('usa-checkbox--tile'),
        'Tile checkbox should have correct CSS class'
      ).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/checkbox/usa-checkbox.ts`;
      const validation = validateComponentJavaScript(componentPath, 'checkbox');

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
    it('should maintain checkbox structure integrity', async () => {
      await element.updateComplete;

      // No form group wrapper for individual checkbox elements (USWDS best practice)
      const checkbox = element.querySelector('.usa-checkbox');

      expect(checkbox).toBeTruthy();
      expect(checkbox.classList.contains('usa-checkbox')).toBe(true);
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-checkbox__input');
      const label = element.querySelector('.usa-checkbox__label');

      if (input && label) {
        const inputId = input.getAttribute('id');
        const labelFor = label.getAttribute('for');
        expect(labelFor).toBe(inputId);
      }
    });

    it('should handle checked state correctly', async () => {
      element.checked = true;
      await element.updateComplete;

      const input = element.querySelector('.usa-checkbox__input') as HTMLInputElement;

      if (input) {
        expect(input.checked).toBe(true);
      }
    });
  });
});