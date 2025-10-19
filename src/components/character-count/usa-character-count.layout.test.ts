/**
 * Character Count Layout Tests
 * Prevents regression of counter positioning, input association, and status message layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../character-count/index.ts';
import type { USACharacterCount } from './usa-character-count.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USACharacterCount Layout Tests', () => {
  let element: USACharacterCount;

  beforeEach(() => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.label = 'Test Input';
    element.maxlength = 100;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS character count structure', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const label = element.querySelector('.usa-label');
    const input = element.querySelector('.usa-textarea, .usa-input');
    const characterCount = element.querySelector('.usa-character-count__status');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(label, 'Label should exist').toBeTruthy();
    expect(input, 'Input/textarea should exist').toBeTruthy();
    expect(characterCount, 'Character count should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(formGroup.contains(label)).toBe(true);
    expect(formGroup.contains(input)).toBe(true);
    expect(formGroup.contains(characterCount)).toBe(true);
  });

  it('should position character count after input element', async () => {
    await element.updateComplete;

    const formGroup = element.querySelector('.usa-form-group');
    const input = element.querySelector('.usa-textarea, .usa-input');
    const characterCount = element.querySelector('.usa-character-count__status');

    expect(formGroup, 'Form group should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();
    expect(characterCount, 'Character count should exist').toBeTruthy();

    // Character count should appear after input within the same wrapper div
    const wrapperDiv = characterCount.parentElement;
    const wrapperChildren = Array.from(wrapperDiv.children);
    const inputIndex = wrapperChildren.indexOf(input);
    const countIndex = wrapperChildren.indexOf(characterCount);

    expect(countIndex, 'Character count should appear after input in wrapper').toBeGreaterThan(
      inputIndex
    );
  });

  it('should display character count status correctly', async () => {
    await element.updateComplete;

    const characterCount = element.querySelector('.usa-character-count__status');

    expect(characterCount, 'Character count status should exist').toBeTruthy();

    if (characterCount) {
      // Should show remaining characters initially (USWDS format: "X characters remaining")
      expect(characterCount.textContent).toContain('100 characters remaining');
    }
  });

  it('should update character count when input changes', async () => {
    await element.updateComplete;

    const input = element.querySelector('.usa-textarea, .usa-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const characterCount = element.querySelector('.usa-character-count__status');

    expect(input, 'Input should exist').toBeTruthy();
    expect(characterCount, 'Character count should exist').toBeTruthy();

    if (input && characterCount) {
      // Simulate typing
      input.value = 'Hello World';
      input.dispatchEvent(new Event('input'));
      await element.updateComplete;

      // Should show updated count
      expect(characterCount.textContent).toContain('89 characters remaining');
    }
  });

  it('should handle over-limit state correctly', async () => {
    await element.updateComplete;

    const input = element.querySelector('.usa-textarea, .usa-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const characterCount = element.querySelector('.usa-character-count__status');

    expect(input, 'Input should exist').toBeTruthy();
    expect(characterCount, 'Character count should exist').toBeTruthy();

    if (input && characterCount) {
      // Simulate typing over limit
      input.value = 'a'.repeat(150);
      input.dispatchEvent(new Event('input'));
      await element.updateComplete;
      // Wait for second update cycle from requestUpdate() in updateCharacterCountSync()
      await element.updateComplete;

      // Should show over-limit status (USWDS uses "X characters over limit")
      expect(characterCount.textContent).toContain('50 characters over limit');
      expect(characterCount.classList.contains('usa-character-count__status--invalid')).toBe(true);
    }
  });

  it('should handle textarea vs input correctly', async () => {
    element.inputType = 'textarea';
    await element.updateComplete;

    const textarea = element.querySelector('.usa-textarea');
    const input = element.querySelector('.usa-input');

    expect(textarea, 'Textarea should exist when multiline is true').toBeTruthy();
    expect(input, 'Input should not exist when multiline is true').toBeFalsy();

    // Test single line
    element.inputType = 'input';
    await element.updateComplete;

    const newTextarea = element.querySelector('.usa-textarea');
    const newInput = element.querySelector('.usa-input');

    expect(newTextarea, 'Textarea should not exist when multiline is false').toBeFalsy();
    expect(newInput, 'Input should exist when multiline is false').toBeTruthy();
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/character-count/usa-character-count.ts`;
      const validation = validateComponentJavaScript(componentPath, 'character-count');

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
    it('should pass visual layout checks for character count structure', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const characterCount = element.querySelector('.usa-character-count__status');

      expect(formGroup, 'Form group should render').toBeTruthy();
      expect(characterCount, 'Character count should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(formGroup.classList.contains('usa-form-group')).toBe(true);
      expect(characterCount.classList.contains('usa-character-count__status')).toBe(true);
    });

    it('should maintain character count structure integrity', async () => {
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const input = element.querySelector('.usa-textarea, .usa-input');
      const status = element.querySelector('.usa-character-count__status');

      expect(label, 'Label should be present').toBeTruthy();
      expect(input, 'Input should be present').toBeTruthy();
      expect(status, 'Status should be present').toBeTruthy();
    });

    it('should handle error state correctly', async () => {
      // Set value that exceeds the limit to trigger error state
      element.value = 'a'.repeat(150); // 150 characters, exceeds limit of 100
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const input = element.querySelector('.usa-textarea, .usa-input') as
        | HTMLInputElement
        | HTMLTextAreaElement;

      if (formGroup) {
        expect(formGroup.classList.contains('usa-form-group--error')).toBe(true);
      }
      if (input) {
        // For character count, error styling is typically on the form group level
        // The input gets the value but error styling comes from the over-limit state
        expect(input.value).toBe('a'.repeat(150));
      }
    });

    it('should handle disabled state correctly', async () => {
      element.disabled = true;
      await element.updateComplete;

      const input = element.querySelector('.usa-textarea, .usa-input') as
        | HTMLInputElement
        | HTMLTextAreaElement;

      if (input) {
        expect(input.disabled).toBe(true);
      }
    });

    it('should handle hint text correctly', async () => {
      element.hint = 'Enter your message';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');

      if (hint) {
        expect(hint.textContent.trim()).toBe('Enter your message');
      }
    });

    // NOTE: ARIA relationships test requires browser environment
    // aria-describedby association needs real browser ARIA API for proper validation
    // Cypress coverage: cypress/e2e/character-count-accessibility.cy.ts

    it('should handle real-time character counting', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-textarea, .usa-input') as
        | HTMLInputElement
        | HTMLTextAreaElement;
      const status = element.querySelector('.usa-character-count__status');

      if (input && status) {
        // Test progressive typing
        const testText = 'Hello';
        for (let i = 0; i <= testText.length; i++) {
          input.value = testText.substring(0, i);
          input.dispatchEvent(new Event('input'));
          await element.updateComplete;

          const remaining = element.maxlength - i;
          expect(status.textContent).toContain(`${remaining} character`);
          // Also check that it includes 'remaining' for positive counts (USWDS uses "remaining" not "left")
          if (remaining > 0) {
            expect(status.textContent).toContain('remaining');
          }
        }
      }
    });
  });
});
