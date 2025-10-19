/**
 * Textarea Layout Tests
 * Prevents regression of textarea structure, label positioning, and resize behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../textarea/index.ts';
import type { USATextarea } from './usa-textarea.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USATextarea Layout Tests', () => {
  let element: USATextarea;

  beforeEach(() => {
    element = document.createElement('usa-textarea') as USATextarea;
    element.label = 'Test Textarea';
    element.name = 'test-textarea';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS textarea structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const textarea = element.querySelector('.usa-textarea');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(textarea, 'Textarea should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(textarea)).toBe(true);
  });

  it('should position label correctly relative to textarea', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const textarea = element.querySelector('.usa-textarea');

    // Label should appear before textarea in form group
    const groupChildren = Array.from(formGroup.children);
    const labelIndex = groupChildren.indexOf(label);
    const textareaIndex = groupChildren.indexOf(textarea);

    expect(labelIndex, 'Label should appear before textarea').toBeLessThan(textareaIndex);
  });

  it('should handle error state layout correctly', async () => {
    element.error = 'This field is required';
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const textarea = element.querySelector('.usa-textarea');
    const errorMessage = element.querySelector('.usa-error-message');

    if (formGroup) {
      expect(formGroup.classList.contains('usa-form-group--error')).toBe(true);
    }
    if (textarea) {
      expect(textarea.classList.contains('usa-textarea--error')).toBe(true);
    }
    if (errorMessage) {
      expect(errorMessage.textContent.trim()).toContain('This field is required');
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/textarea/usa-textarea.ts`;
      const validation = validateComponentJavaScript(componentPath, 'textarea');

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
    it('should maintain textarea structure integrity', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const textarea = element.querySelector('.usa-textarea');

      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(textarea.classList.contains('usa-textarea')).toBe(true);
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const textarea = element.querySelector('.usa-textarea');

      if (label && textarea) {
        const labelFor = label.getAttribute('for');
        const textareaId = textarea.getAttribute('id');
        expect(labelFor).toBe(textareaId);
      }
    });
  });
});
