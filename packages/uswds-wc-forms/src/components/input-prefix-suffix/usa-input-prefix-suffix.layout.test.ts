/**
 * Input Prefix Suffix Layout Tests
 * Prevents regression of input group structure, icon positioning, and prefix/suffix alignment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../input-prefix-suffix/index.ts';
import type { USAInputPrefixSuffix } from './usa-input-prefix-suffix.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USAInputPrefixSuffix Layout Tests', () => {
  let element: USAInputPrefixSuffix;

  beforeEach(() => {
    element = document.createElement('usa-input-prefix-suffix') as USAInputPrefixSuffix;
    element.label = 'Test Input';
    element.name = 'test-input';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS input group structure', async () => {
    element.prefix = '$';
    element.suffix = '.00';
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const inputGroup = element.querySelector('.usa-input-group');
    const input = element.querySelector('.usa-input');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(inputGroup)).toBe(true);
    expect(inputGroup.contains(input)).toBe(true);
  });

  it('should position prefix correctly within input group', async () => {
    element.prefix = '$';
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    const prefix = element.querySelector('.usa-input-prefix');
    const input = element.querySelector('.usa-input');

    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(prefix, 'Prefix should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();

    // Prefix should be before input in group
    const groupChildren = Array.from(inputGroup.children);
    const prefixIndex = groupChildren.indexOf(prefix);
    const inputIndex = groupChildren.indexOf(input);

    expect(prefixIndex).toBeLessThan(inputIndex);
  });

  it('should position suffix correctly within input group', async () => {
    element.suffix = '.00';
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    const input = element.querySelector('.usa-input');
    const suffix = element.querySelector('.usa-input-suffix');

    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();
    expect(suffix, 'Suffix should exist').toBeTruthy();

    // Suffix should be after input in group
    const groupChildren = Array.from(inputGroup.children);
    const inputIndex = groupChildren.indexOf(input);
    const suffixIndex = groupChildren.indexOf(suffix);

    expect(suffixIndex).toBeGreaterThan(inputIndex);
  });

  it('should position both prefix and suffix correctly', async () => {
    element.prefix = '$';
    element.suffix = '.00';
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    const prefix = element.querySelector('.usa-input-prefix');
    const input = element.querySelector('.usa-input');
    const suffix = element.querySelector('.usa-input-suffix');

    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(prefix, 'Prefix should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();
    expect(suffix, 'Suffix should exist').toBeTruthy();

    // Order should be: prefix, input, suffix
    const groupChildren = Array.from(inputGroup.children);
    const prefixIndex = groupChildren.indexOf(prefix);
    const inputIndex = groupChildren.indexOf(input);
    const suffixIndex = groupChildren.indexOf(suffix);

    expect(prefixIndex).toBeLessThan(inputIndex);
    expect(inputIndex).toBeLessThan(suffixIndex);
  });

  it('should handle icon prefix correctly', async () => {
    element.prefixIcon = 'search';
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    const prefix = element.querySelector('.usa-input-prefix');
    const icon = element.querySelector('.usa-icon');

    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(prefix, 'Prefix should exist').toBeTruthy();
    expect(icon, 'Icon should exist').toBeTruthy();

    if (prefix && icon) {
      expect(prefix.contains(icon)).toBe(true);
    }
  });

  it('should handle icon suffix correctly', async () => {
    element.suffixIcon = 'check';
    await element.updateComplete;

    const inputGroup = element.querySelector('.usa-input-group');
    const suffix = element.querySelector('.usa-input-suffix');
    const icon = element.querySelector('.usa-icon');

    expect(inputGroup, 'Input group should exist').toBeTruthy();
    expect(suffix, 'Suffix should exist').toBeTruthy();
    expect(icon, 'Icon should exist').toBeTruthy();

    if (suffix && icon) {
      expect(suffix.contains(icon)).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/input-prefix-suffix/usa-input-prefix-suffix.ts`;
      const validation = validateComponentJavaScript(componentPath, 'input-prefix-suffix');

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
    it('should maintain input group structure integrity', async () => {
      element.prefix = '$';
      element.suffix = '%';
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const inputGroup = element.querySelector('.usa-input-group');

      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(inputGroup.classList.contains('usa-input-group')).toBe(true);
    });

    it('should handle error state correctly', async () => {
      element.error = 'This field has an error';
      element.prefix = '$';
      await element.updateComplete;

      const inputGroup = element.querySelector('.usa-input-group');
      const input = element.querySelector('.usa-input');

      if (inputGroup) {
        expect(inputGroup.classList.contains('usa-input-group--error')).toBe(true);
      }
      if (input) {
        expect(input.classList.contains('usa-input--error')).toBe(true);
      }
    });

    it('should handle disabled state correctly', async () => {
      element.disabled = true;
      element.prefix = '$';
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        expect(input.disabled).toBe(true);
      }
    });
  });
});
