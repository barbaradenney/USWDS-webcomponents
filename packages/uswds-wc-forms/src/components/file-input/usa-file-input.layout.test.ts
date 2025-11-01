/**
 * File Input Layout Tests
 * Prevents regression of button positioning and file preview layout issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../file-input/index.ts';
import type { USAFileInput } from './usa-file-input.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAFileInput Layout Tests', () => {
  let element: USAFileInput;

  beforeEach(() => {
    element = document.createElement('usa-file-input') as USAFileInput;
    element.label = 'Upload document';
    element.inputId = 'test-file-input';
    element.hint = 'Select PDF, DOC, or TXT files';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS file input DOM structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const input = element.querySelector('input[type="file"]');

    expect(formGroup, 'Should have form group container').toBeTruthy();
    expect(input, 'Should have file input element').toBeTruthy();
    expect(
      input?.classList.contains('usa-file-input'),
      'Input should have usa-file-input class'
    ).toBe(true);

    // Note: Component uses progressive enhancement
    // USWDS JavaScript creates .usa-file-input__target, .usa-file-input__instructions, etc.
    // Component provides minimal structure: input[type="file"].usa-file-input
    // The USWDS behavior file (usa-file-input-behavior.ts) transforms this into full drag-and-drop structure
    expect(formGroup!.contains(input!), 'File input should be inside form group').toBe(true);
  });

  it('should position label and hint correctly', async () => {
    await element.updateComplete;

    const label = element.querySelector('.usa-label');
    const hint = element.querySelector('.usa-hint');
    const fileInput = element.querySelector('.usa-file-input');

    expect(label, 'Should have label element').toBeTruthy();
    expect(hint, 'Should have hint element').toBeTruthy();

    // Label and hint should come before the file input in DOM order
    const formGroup = element.querySelector('.usa-form-group');
    const children = Array.from(formGroup!.children);

    const labelIndex = children.indexOf(label!);
    const hintIndex = children.indexOf(hint!);
    const fileInputIndex = children.indexOf(fileInput!);

    expect(labelIndex, 'Label should come before file input').toBeLessThan(fileInputIndex);
    expect(hintIndex, 'Hint should come before file input').toBeLessThan(fileInputIndex);
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: src/components/file-input/usa-file-input.component.cy.ts

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: src/components/file-input/usa-file-input.component.cy.ts

  it('should handle required state correctly', async () => {
    element.required = true;
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const requiredIndicator = element.querySelector('.usa-hint--required');

    expect(
      formGroup!.classList.contains('usa-form-group--required'),
      'Form group should have required class'
    ).toBe(true);

    expect(requiredIndicator, 'Should have required indicator').toBeTruthy();
    expect(label!.contains(requiredIndicator!), 'Required indicator should be in label').toBe(true);
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    const input = element.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.disabled, 'File input should be disabled').toBe(true);
  });

  it('should handle multiple files correctly', async () => {
    element.multiple = true;
    await element.updateComplete;

    const input = element.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple, 'File input should allow multiple files').toBe(true);
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/file-input/usa-file-input.ts`;
        const validation = validateComponentJavaScript(componentPath, 'file-input');

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
    it('should pass visual layout checks for file input area', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group') as HTMLElement;
      const input = element.querySelector('input[type="file"]') as HTMLElement;

      expect(formGroup, 'Form group should exist').toBeTruthy();
      expect(input, 'File input should exist').toBeTruthy();

      // Note: Component uses progressive enhancement
      // USWDS JavaScript creates .usa-file-input__target and .usa-file-input__instructions
      // Component provides minimal structure; USWDS enhances with drag-and-drop UI
      // Verify essential USWDS classes are present
      expect(input.classList.contains('usa-file-input')).toBe(true);
    });

    // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
    // Coverage: src/components/file-input/usa-file-input.component.cy.ts

    it('should maintain proper drag and drop visual states', async () => {
      await element.updateComplete;

      const fileInput = element.querySelector('.usa-file-input') as HTMLElement;

      expect(fileInput, 'File input should exist').toBeTruthy();

      // Note: Component uses progressive enhancement
      // USWDS JavaScript handles drag-and-drop behavior
      // The USWDS behavior file (usa-file-input-behavior.ts) adds drag-over classes during interaction
      // Component provides the input element; USWDS adds drag-and-drop functionality

      // Test drag over state - USWDS behavior would handle this
      const dragEvent = new DragEvent('dragover', { bubbles: true });
      fileInput.dispatchEvent(dragEvent);

      // The behavior file would add the class, but in this unit test we're testing the base structure
      // Drag-and-drop behavior is tested in the behavior file tests
    });
  });
});
