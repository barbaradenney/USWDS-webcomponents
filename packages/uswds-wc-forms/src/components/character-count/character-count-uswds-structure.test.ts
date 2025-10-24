import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index.ts';
import type { USACharacterCount } from './usa-character-count.js';

/**
 * USWDS Character Count Structure Validation Tests
 *
 * These tests ensure 100% compliance with official USWDS structure
 * as defined in: node_modules/@uswds/uswds/packages/usa-character-count/src/index.js
 *
 * Purpose: Prevent regressions like the one caught in monorepo migration where
 * message element had aria-live when it shouldn't per USWDS spec (line 189).
 */
describe('USACharacterCount - USWDS Structure Compliance', () => {
  let element: USACharacterCount;

  beforeEach(async () => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.name = 'test-field';
    element.label = 'Test Label';
    element.maxlength = 100;
    document.body.appendChild(element);
    await element.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('USWDS Required Elements', () => {
    it('should have base container with usa-character-count class', () => {
      const container = element.querySelector('.usa-character-count');
      expect(container).toBeTruthy();
      expect(container?.getAttribute('data-maxlength')).toBe('100');
    });

    it('should have form group container', () => {
      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup).toBeTruthy();
    });

    it('should have label with usa-label class', () => {
      const label = element.querySelector('.usa-label');
      expect(label).toBeTruthy();
      expect(label?.getAttribute('for')).toBe('test-field');
    });

    it('should have input/textarea with usa-character-count__field class', () => {
      const field = element.querySelector('.usa-character-count__field');
      expect(field).toBeTruthy();
      expect(field?.classList.contains('usa-textarea') || field?.classList.contains('usa-input')).toBe(true);
    });

    it('should have message element (hidden per USWDS spec)', () => {
      const message = element.querySelector('.usa-character-count__message');

      // USWDS spec line 188-189: Hide message and remove aria-live
      expect(message).toBeTruthy();
      expect(message?.classList.contains('usa-sr-only')).toBe(true);
      expect(message?.hasAttribute('aria-live')).toBe(false);
    });

    it('should have visual status element with usa-hint class', () => {
      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec line 84: Status message has usa-hint class
      expect(status).toBeTruthy();
      expect(status?.classList.contains('usa-hint')).toBe(true);
      expect(status?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have SR-only status element with aria-live', () => {
      const srStatus = element.querySelector('.usa-character-count__sr-status');

      // USWDS spec line 85-87: SR status has aria-live="polite"
      expect(srStatus).toBeTruthy();
      expect(srStatus?.classList.contains('usa-sr-only')).toBe(true);
      expect(srStatus?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('USWDS Error State Classes', () => {
    it('should apply error classes when over limit', async () => {
      element.value = 'a'.repeat(110); // Over 100 char limit
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const formGroup = element.querySelector('.usa-form-group');
      const field = element.querySelector('.usa-character-count__field');
      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec lines 166-171: Error state classes
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
      expect(field?.classList.contains('usa-input--error')).toBe(true);
      expect(status?.classList.contains('usa-character-count__status--invalid')).toBe(true);
    });

    it('should remove error classes when within limit', async () => {
      // Start over limit
      element.value = 'a'.repeat(110);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Go back within limit
      element.value = 'a'.repeat(50);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const formGroup = element.querySelector('.usa-form-group');
      const field = element.querySelector('.usa-character-count__field');
      const status = element.querySelector('.usa-character-count__status');

      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
      expect(field?.classList.contains('usa-input--error')).toBe(false);
      expect(status?.classList.contains('usa-character-count__status--invalid')).toBe(false);
    });
  });

  describe('USWDS Message Content', () => {
    it('should show correct default message format', async () => {
      element.value = '';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec line 23: Default format is "{maxLength} characters remaining"
      expect(status?.textContent?.trim()).toBe('100 characters remaining');
    });

    it('should show correct "characters remaining" message', async () => {
      element.value = 'Hello';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec lines 110-116: Format is "{difference} characters remaining"
      expect(status?.textContent?.trim()).toBe('95 characters remaining');
    });

    it('should show correct "over limit" message', async () => {
      element.value = 'a'.repeat(105);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec lines 110-116: Format is "{difference} characters over limit"
      expect(status?.textContent?.trim()).toBe('5 characters over limit');
    });

    it('should use singular "character" for difference of 1', async () => {
      element.value = 'a'.repeat(99);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec line 113: Singular vs plural handling
      expect(status?.textContent?.trim()).toBe('1 character remaining');
    });
  });

  describe('Regression Prevention', () => {
    it('prevents monorepo migration regression: message element structure', () => {
      // This regression was caught: message had aria-live when it shouldn't
      // USWDS explicitly removes aria-live from message element (line 189)

      const message = element.querySelector('.usa-character-count__message');

      // FAIL CONDITIONS (regressions to catch):
      expect(message?.hasAttribute('aria-live')).toBe(false); // Was incorrectly true
      expect(message?.classList.contains('usa-sr-only')).toBe(true); // Was incorrectly missing

      // PASS CONDITIONS (correct USWDS structure):
      const srStatus = element.querySelector('.usa-character-count__sr-status');
      expect(srStatus?.getAttribute('aria-live')).toBe('polite'); // This should have aria-live
    });

    it('prevents status element missing usa-hint class regression', () => {
      const status = element.querySelector('.usa-character-count__status');

      // USWDS line 84: Status should have usa-hint class
      expect(status?.classList.contains('usa-hint')).toBe(true);
    });
  });
});
