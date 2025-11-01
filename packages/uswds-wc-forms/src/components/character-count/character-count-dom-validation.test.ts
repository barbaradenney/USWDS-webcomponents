import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-character-count.ts';
import type { USACharacterCount } from './usa-character-count.js';
/**
 * Character Count DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing character counter display
 * - Counter not updating
 * - Missing input/textarea
 */

describe('Character Count DOM Structure Validation', () => {
  let element: USACharacterCount;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-character-count') as USACharacterCount;
    element.maxLength = 100;
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have character count container', async () => {
      await element.updateComplete;

      const container = element.querySelector('.usa-character-count');
      expect(container).toBeTruthy();
    });

    it('should have input or textarea', async () => {
      await element.updateComplete;

      const input = element.querySelector(
        'input.usa-character-count__field, textarea.usa-character-count__field'
      );
      expect(input).toBeTruthy();
    });

    it('should have message element', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const message = element.querySelector('.usa-character-count__message');
      expect(message).toBeTruthy();
    });
  });

  describe('Counter Display', () => {
    it('should show remaining characters', async () => {
      element.maxlength = 100; // Use lowercase 'maxlength' to match property name
      element.value = 'Test'; // 4 characters
      await element.updateComplete;

      // Wait longer for USWDS to initialize and update counter
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check both component-rendered status and USWDS-created message
      const status = element.querySelector('.usa-character-count__status');
      const message = element.querySelector('.usa-character-count__message');

      // Should show 96 remaining (100 - 4)
      const text = (status?.textContent || message?.textContent || '').trim();
      expect(text).toContain('96');
    });

    it('should have status variant when approaching limit', async () => {
      element.maxLength = 10;
      element.value = '12345678';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const message = element.querySelector('.usa-character-count__message');
      expect(message).toBeTruthy();
    });
  });

  describe('Accessibility Structure', () => {
    it('should have aria-describedby on input', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-character-count__field');
      expect(input?.hasAttribute('aria-describedby')).toBe(true);
    });

    it('should have correctly structured message element per USWDS spec', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const message = element.querySelector('.usa-character-count__message');

      // USWDS spec: message element should be hidden for backwards compatibility
      // See: node_modules/@uswds/uswds/packages/usa-character-count/src/index.js line 189
      expect(message?.classList.contains('usa-sr-only')).toBe(true);

      // USWDS spec: aria-live should be REMOVED from message element (line 189)
      expect(message?.hasAttribute('aria-live')).toBe(false);
    });
  });
});
