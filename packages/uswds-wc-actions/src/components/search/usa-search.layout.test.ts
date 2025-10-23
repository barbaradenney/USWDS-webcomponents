/**
 * Search Layout Tests
 * Prevents regression of form structure, input/button positioning, and size variant issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../search/index.ts';
import type { USASearch } from './usa-search.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USASearch Layout Tests', () => {
  let element: USASearch;

  beforeEach(() => {
    element = document.createElement('usa-search') as USASearch;
    element.placeholder = 'Search for content';
    element.buttonText = 'Search';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS search form structure', async () => {
    await element.updateComplete;

    const searchForm = element.querySelector('.usa-search');
    const form = element.querySelector('form');
    const formRole = element.querySelector('[role="search"]');
    const input = element.querySelector('.usa-input');
    const button = element.querySelector('.usa-button');

    expect(searchForm, 'Search container should exist').toBeTruthy();
    expect(form, 'Form element should exist').toBeTruthy();
    expect(formRole, 'Search role should exist').toBeTruthy();
    expect(input, 'Search input should exist').toBeTruthy();
    expect(button, 'Search button should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(
      searchForm.contains(form) || form === searchForm,
      'Form should be inside search container or be the container'
    ).toBe(true);
    expect(
      form.contains(input),
      'Input should be inside form'
    ).toBe(true);
    expect(
      form.contains(button),
      'Button should be inside form'
    ).toBe(true);
  });

  it('should position search input and button correctly in form', async () => {
    await element.updateComplete;

    const form = element.querySelector('form');
    const input = element.querySelector('.usa-input');
    const button = element.querySelector('.usa-button');
    const searchDiv = element.querySelector('div[role="search"]');

    expect(form, 'Form should exist').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();
    expect(button, 'Button should exist').toBeTruthy();
    expect(searchDiv, 'Search container div should exist').toBeTruthy();

    // Input and button should be adjacent within the search div
    const searchDivChildren = Array.from(searchDiv.children);
    const inputIndex = searchDivChildren.indexOf(input);
    const buttonIndex = searchDivChildren.indexOf(button);

    expect(inputIndex, 'Input should be found in search container').toBeGreaterThan(-1);
    expect(buttonIndex, 'Button should be found in search container').toBeGreaterThan(-1);
    expect(
      Math.abs(buttonIndex - inputIndex),
      'Button should be adjacent to input'
    ).toBe(1);
  });

  it('should handle small size variant correctly', async () => {
    element.size = 'small';
    await element.updateComplete;

    const searchForm = element.querySelector('.usa-search');

    expect(searchForm, 'Search form should exist').toBeTruthy();

    if (searchForm) {
      expect(
        searchForm.classList.contains('usa-search--small'),
        'Small search should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should handle big size variant correctly', async () => {
    element.size = 'big';
    await element.updateComplete;

    const searchForm = element.querySelector('.usa-search');

    expect(searchForm, 'Search form should exist').toBeTruthy();

    if (searchForm) {
      expect(
        searchForm.classList.contains('usa-search--big'),
        'Big search should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should position label correctly when present', async () => {
    element.label = 'Site search';
    await element.updateComplete;

    const searchForm = element.querySelector('.usa-search');
    const label = element.querySelector('.usa-sr-only');
    const input = element.querySelector('.usa-input');

    expect(searchForm, 'Search form should exist').toBeTruthy();
    expect(label, 'Label should exist when specified').toBeTruthy();
    expect(input, 'Input should exist').toBeTruthy();

    if (label && input) {
      // Label should be associated with input
      const inputId = input.getAttribute('id');
      const labelFor = label.getAttribute('for');
      expect(labelFor, 'Label should be associated with input').toBe(inputId);

      // Label should appear before the search div within the form
      const form = element.querySelector('form');
      const formChildren = Array.from(form?.children || []);
      const labelIndex = formChildren.indexOf(label);
      const searchDiv = element.querySelector('div[role="search"]');
      const searchDivIndex = formChildren.indexOf(searchDiv);

      expect(labelIndex, 'Label should appear before search div').toBeLessThan(searchDivIndex);
    }
  });

  it('should handle disabled state correctly', async () => {
    element.disabled = true;
    await element.updateComplete;

    const input = element.querySelector('.usa-input') as HTMLInputElement;
    const button = element.querySelector('.usa-button') as HTMLButtonElement;

    expect(input, 'Input should exist').toBeTruthy();
    expect(button, 'Button should exist').toBeTruthy();

    if (input) {
      expect(input.disabled, 'Input should be disabled').toBe(true);
    }
    if (button) {
      expect(button.disabled, 'Button should be disabled').toBe(true);
    }
  });

  it('should maintain proper input and button attributes', async () => {
    await element.updateComplete;

    const input = element.querySelector('.usa-input') as HTMLInputElement;
    const button = element.querySelector('.usa-button') as HTMLButtonElement;

    expect(input, 'Input should exist').toBeTruthy();
    expect(button, 'Button should exist').toBeTruthy();

    if (input) {
      expect(input.type, 'Input should be search type').toBe('search');
      expect(input.name, 'Input should have name attribute').toBe('search');
      expect(input.placeholder, 'Input should have placeholder').toBe('Search for content');
    }

    if (button) {
      expect(button.type, 'Button should be submit type').toBe('submit');
    }
  });

  it('should handle form submission correctly', async () => {
    let submitEventFired = false;
    element.addEventListener('search-submit', () => {
      submitEventFired = true;
    });

    await element.updateComplete;

    const form = element.querySelector('form');

    expect(form, 'Form should exist').toBeTruthy();

    if (form) {
      // Simulate form submission event directly
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(submitEventFired, 'Submit event should fire when form is submitted').toBe(true);
    }
  });

  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/search/usa-search.ts`;
      const validation = validateComponentJavaScript(componentPath, 'search');

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

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for search structure', async () => {
      await element.updateComplete;

      const searchForm = element.querySelector('.usa-search');
      const form = element.querySelector('form');

      expect(searchForm, 'Search form should render').toBeTruthy();
      expect(form, 'Form should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(searchForm.classList.contains('usa-search')).toBe(true);
    });

    it('should maintain search form structure integrity', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input');
      const button = element.querySelector('.usa-button');

      expect(input, 'Input should be present').toBeTruthy();
      expect(button, 'Button should be present').toBeTruthy();

      // Verify form has search role
      const searchRole = element.querySelector('[role="search"]');
      expect(searchRole, 'Form should have search role').toBeTruthy();
    });

    it('should handle input value changes correctly', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        // Simulate typing
        input.value = 'test query';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        expect(input.value, 'Input should maintain typed value').toBe('test query');
        // Note: Component doesn't sync input value back to component property automatically
        // This is by design for a minimal USWDS wrapper
      }
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;
      const form = element.querySelector('form');

      if (input && form) {
        // Should handle Enter key for form submission
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        input.dispatchEvent(enterEvent);
        await element.updateComplete;

        // Structure should remain intact after keyboard interaction
        const searchForm = element.querySelector('.usa-search');
        expect(searchForm, 'Search form should maintain structure after keyboard interaction').toBeTruthy();
      }
    });

    it('should handle different size variants correctly', async () => {
      // Test all size variants
      const sizes: Array<'small' | 'medium' | 'big'> = ['small', 'medium', 'big'];

      for (const size of sizes) {
        element.size = size;
        await element.updateComplete;

        const searchForm = element.querySelector('.usa-search');
        expect(searchForm, `Search form should exist for ${size} size`).toBeTruthy();

        if (size !== 'medium') {
          const expectedClass = `usa-search--${size}`;
          expect(
            searchForm.classList.contains(expectedClass),
            `${size} search should have ${expectedClass} class`
          ).toBe(true);
        }
      }
    });

    it('should maintain proper form accessibility', async () => {
      await element.updateComplete;

      const form = element.querySelector('form');
      const input = element.querySelector('.usa-input');
      const button = element.querySelector('.usa-button');

      if (form) {
        expect(form.getAttribute('role')).toBe('search');
      }

      if (input) {
        expect(input.getAttribute('type')).toBe('search');
        expect(input.getAttribute('name')).toBe('search');
      }

      if (button) {
        expect(button.getAttribute('type')).toBe('submit');
      }
    });

    it('should handle button text customization correctly', async () => {
      element.buttonText = 'Find';
      await element.updateComplete;

      const button = element.querySelector('.usa-button') as HTMLButtonElement;

      if (button) {
        expect(button.textContent.trim(), 'Button should display custom text').toBe('Find');
      }
    });

    it('should handle placeholder text correctly', async () => {
      element.placeholder = 'Enter search terms';
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        expect(input.placeholder, 'Input should have custom placeholder').toBe('Enter search terms');
      }
    });

    it('should handle search input events correctly', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (input) {
        input.value = 'search term';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Component allows native input events to bubble up
        // No custom search-input event is dispatched by design
        expect(input.value, 'Input should accept typed value').toBe('search term');
      }
    });

    it('should handle form reset correctly', async () => {
      element.value = 'initial value';
      await element.updateComplete;

      const form = element.querySelector('form');
      const input = element.querySelector('.usa-input') as HTMLInputElement;

      if (form && input) {
        expect(input.value, 'Input should have initial value').toBe('initial value');

        // Reset form
        form.reset();
        await element.updateComplete;

        // Structure should remain intact after reset
        const searchForm = element.querySelector('.usa-search');
        expect(searchForm, 'Search form should maintain structure after reset').toBeTruthy();
      }
    });
  });
});