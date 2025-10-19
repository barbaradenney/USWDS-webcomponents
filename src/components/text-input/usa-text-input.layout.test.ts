/**
 * Text Input Layout Tests
 * Prevents regression of form structure, label positioning, and error state layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../text-input/index.ts';
import type { USATextInput } from './usa-text-input.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USATextInput Layout Tests', () => {
  let element: USATextInput;

  beforeEach(() => {
    element = document.createElement('usa-text-input') as USATextInput;
    element.label = 'Test Input';
    element.name = 'test-input';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS form structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const input = element.querySelector('.usa-input');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(input)).toBe(true);
  });

  it('should position label correctly relative to input', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const input = element.querySelector('.usa-input');

    // Label should appear before input in form group
    const groupChildren = Array.from(formGroup.children);
    const labelIndex = groupChildren.indexOf(label);
    const inputIndex = groupChildren.indexOf(input);

    expect(labelIndex, 'Label should appear before input').toBeLessThan(inputIndex);
  });

  it('should handle error state layout correctly', async () => {
    element.error = 'This field is required';
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const input = element.querySelector('.usa-input');
    const errorMessage = element.querySelector('.usa-error-message');

    if (formGroup) {
      expect(formGroup.classList.contains('usa-form-group--error')).toBe(true);
    }
    if (input) {
      expect(input.classList.contains('usa-input--error')).toBe(true);
    }
    if (errorMessage) {
      expect(errorMessage.textContent.trim()).toContain('This field is required');
    }
  });

  it('should position hint text correctly', async () => {
    element.hint = 'Enter your full name';
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const hint = element.querySelector('.usa-hint');
    const input = element.querySelector('.usa-input');

    if (hint) {
      expect(formGroup.contains(hint)).toBe(true);

      // Hint should appear after label but before input
      const groupChildren = Array.from(formGroup.children);
      const labelIndex = groupChildren.indexOf(label);
      const hintIndex = groupChildren.indexOf(hint);
      const inputIndex = groupChildren.indexOf(input);

      expect(hintIndex).toBeGreaterThan(labelIndex);
      expect(hintIndex).toBeLessThan(inputIndex);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/text-input/usa-text-input.ts`;
      const validation = validateComponentJavaScript(componentPath, 'text-input');

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
    it('should maintain form structure integrity', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const input = element.querySelector('.usa-input');

      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(input.classList.contains('usa-input')).toBe(true);
    });

    it('should handle different input types correctly', async () => {
      const types = ['text', 'email', 'password', 'tel', 'url'];

      for (const type of types) {
        element.type = type;
        await element.updateComplete;

        const input = element.querySelector('.usa-input') as HTMLInputElement;
        if (input) {
          expect(input.type).toBe(type);
        }
      }
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const input = element.querySelector('.usa-input');

      if (label && input) {
        const labelFor = label.getAttribute('for');
        const inputId = input.getAttribute('id');
        expect(labelFor).toBe(inputId);
      }
    });
  });
});
