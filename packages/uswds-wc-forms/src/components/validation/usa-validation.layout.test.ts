/**
 * Validation Layout Tests
 * Prevents regression of error message positioning and validation state display
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../validation/index.ts';
import type { USAValidation } from './usa-validation.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAValidation Layout Tests', () => {
  let element: USAValidation;

  beforeEach(() => {
    element = document.createElement('usa-validation') as USAValidation;
    element.errors = ['This field is required', 'Must be at least 3 characters'];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS validation structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const errorMessages = element.querySelectorAll('.usa-error-message');

    expect(formGroup, 'Form group container should exist').toBeTruthy();
    expect(errorMessages.length, 'Should have error messages').toBe(2);

    // Error messages should be inside form group container
    errorMessages.forEach((message, index) => {
      expect(formGroup.contains(message), `Error message ${index} should be in form group`).toBe(
        true
      );
    });
  });

  it('should position error messages correctly', async () => {
    await element.updateComplete;

    const errorMessages = element.querySelectorAll('.usa-error-message');

    expect(errorMessages.length, 'Should have error messages').toBe(2);
    // USWDS includes "Error: " prefix for screen readers as per accessibility guidelines
    expect(errorMessages[0].textContent.trim()).toBe('Error: This field is required');
    expect(errorMessages[1].textContent.trim()).toBe('Error: Must be at least 3 characters');
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/validation/usa-validation.ts`;
        const validation = validateComponentJavaScript(componentPath, 'validation');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain validation structure integrity', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup, 'Form group should exist').toBeTruthy();
      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
    });

    it('should handle empty errors correctly', async () => {
      element.errors = [];
      await element.updateComplete;

      const errorMessages = element.querySelectorAll('.usa-error-message');
      expect(errorMessages.length, 'Should have no error messages when empty').toBe(0);
    });
  });
});
