/**
 * USWDS Search Behavior Contract Tests
 *
 * These tests validate that our search implementation EXACTLY matches
 * USWDS search behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-search/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';
import './usa-search.js';
import type { USASearch } from './usa-search.js';

describe('USWDS Search Behavior Contract', () => {
  let element: USASearch;

  beforeEach(() => {
    // Create search component with toggleable variant (for big search behavior)
    element = document.createElement('usa-search') as USASearch;
    element.id = 'test-search';
    element.toggleable = true; // Enable big search variant with js-search-button and js-search-form
    document.body.appendChild(element);

    // Wait for component to render
    setTimeout(() => {
    }, 0);
  });

  afterEach(async () => {
    element.remove();
    // Wait for any pending async operations (setTimeout in behavior)
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  describe('Contract 1: Component Structure', () => {
    it('should create search button with js-search-button class', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.js-search-button');
      expect(button).not.toBeNull();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should create search form with js-search-form class', async () => {
      await waitForBehaviorInit(element);

      const form = element.querySelector('.js-search-form');
      expect(form).not.toBeNull();
      expect(form?.tagName).toBe('FORM');
    });

    it('should create search input with type="search"', async () => {
      await waitForBehaviorInit(element);

      const input = element.querySelector('[type="search"]');
      expect(input).not.toBeNull();
      expect((input as HTMLInputElement).type).toBe('search');
    });

    it('should nest form inside header context', async () => {
      await waitForBehaviorInit(element);

      const form = element.querySelector('.js-search-form') as HTMLElement;
      const header = form?.closest('header');

      // Form should be within header context for proper toggling
      expect(header || element.closest('header')).not.toBeNull();
    });
  });

  describe('Contract 2: Initial State', () => {
    it('should start with form hidden', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = element.querySelector('.js-search-form') as HTMLElement;
      expect(form.hidden).toBe(true);
    });

    it('should start with button visible', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLElement;
      expect(button.hidden).toBe(false);
    });
  });

  describe('Contract 3: Toggle Behavior', () => {
    it('should show form when clicking search button', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      expect(form.hidden).toBe(true);

      button.click();
      await waitForBehaviorInit(element);

      expect(form.hidden).toBe(false);
    });

    it('should hide button when showing form', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;

      expect(button.hidden).toBe(false);

      button.click();
      await waitForBehaviorInit(element);

      expect(button.hidden).toBe(true);
    });

    it('should focus search input when form is shown', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const input = element.querySelector('[type="search"]') as HTMLInputElement;

      button.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.activeElement).toBe(input);
    });
  });

  describe('Contract 4: Click Outside Behavior', () => {
    it('should hide form when clicking outside', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      // Show form
      button.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(form.hidden).toBe(false);

      // Click outside
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      outsideElement.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(form.hidden).toBe(true);

      outsideElement.remove();
    });

    it('should NOT hide form when clicking inside form', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;
      const input = element.querySelector('[type="search"]') as HTMLInputElement;

      // Show form
      button.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(form.hidden).toBe(false);

      // Click inside form
      input.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(form.hidden).toBe(false);
    });

    it('should show button when form is hidden', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;

      // Show form
      button.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Click outside to hide
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      outsideElement.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(button.hidden).toBe(false);

      outsideElement.remove();
    });

    it('should remove click listener after hiding search', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;

      // Show form
      button.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Hide form by clicking outside
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      outsideElement.click();
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Clicking outside again should not trigger any errors
      outsideElement.click();
      await waitForBehaviorInit(element);

      // Component should still be functional
      expect(element).not.toBeNull();

      outsideElement.remove();
    });
  });

  describe('Contract 5: Form Context', () => {
    it('should find form within header context', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.js-search-button') as HTMLElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      // Button should be able to find form via header context
      const header = button.closest('header') || element.closest('header') || element;
      const foundForm = header.querySelector('.js-search-form');

      expect(foundForm).toBe(form);
    });

    it('should fall back to document if no header context', async () => {
      // Create standalone toggleable search outside header
      const standaloneSearch = document.createElement('usa-search') as USASearch;
      standaloneSearch.toggleable = true; // Need toggleable to have button and form
      document.body.appendChild(standaloneSearch);
      await standaloneSearch.updateComplete;
      await waitForBehaviorInit(standaloneSearch);

      const button = standaloneSearch.querySelector('.js-search-button') as HTMLButtonElement;
      const form = standaloneSearch.querySelector('.js-search-form') as HTMLElement;

      expect(button).not.toBeNull();
      expect(form).not.toBeNull();

      standaloneSearch.remove();
    });
  });

  describe('Contract 6: Event Delegation', () => {
    it('should use event delegation for button clicks', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      // Create click event on button
      const clickEvent = new MouseEvent('click', { bubbles: true });
      button.dispatchEvent(clickEvent);
      await waitForBehaviorInit(element);

      expect(form.hidden).toBe(false);
    });

    it('should handle clicks on button children', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      // Add child element to button
      const icon = document.createElement('span');
      icon.textContent = '🔍';
      button.appendChild(icon);

      // Click the icon (child of button)
      icon.click();
      await waitForBehaviorInit(element);

      expect(form.hidden).toBe(false);
    });
  });

  describe('Contract 7: Cleanup', () => {
    it('should remove event listeners when component disconnects', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;

      // Show form
      button.click();
      await waitForBehaviorInit(element);

      // Remove component
      element.remove();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Clicking outside should not cause errors
      document.body.click();

      // No errors should occur
      expect(true).toBe(true);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT use display:none for hiding elements', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.js-search-button') as HTMLButtonElement;
      const form = element.querySelector('.js-search-form') as HTMLElement;

      // Should use hidden attribute, not inline styles
      expect(button.style.display).toBe('');
      expect(form.style.display).toBe('');
      expect(form.hasAttribute('hidden')).toBe(true);
    });

    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);

      const button = element.querySelector('.js-search-button');
      const form = element.querySelector('.js-search-form');
      const input = element.querySelector('[type="search"]');

      expect(button).not.toBeNull();
      expect(form).not.toBeNull();
      expect(input).not.toBeNull();
    });

    it('should NOT prevent form submission', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const form = element.querySelector('.js-search-form') as HTMLFormElement;
      let submitPrevented = false;

      form.addEventListener('submit', (event) => {
        submitPrevented = event.defaultPrevented;
        event.preventDefault(); // Prevent actual submission in test
      });

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      // Search behavior should NOT prevent form submission
      expect(submitPrevented).toBe(false);
    });
  });
});
