/**
 * Button Layout Tests
 * Prevents regression of button structure, icon positioning, and variant layouts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../button/index.ts';
import { USAIcon } from '@uswds-wc/data-display';
import type { USAButton } from './usa-button.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

// Register icon component
if (!customElements.get('usa-icon')) {
  customElements.define('usa-icon', USAIcon);
}
import {
  validateCSSClassString,
  validateAllCSSClasses,
  validateUSWDSClassPattern
} from '@uswds-wc/test-utils/css-class-utils.js';

describe('USAButton Layout Tests', () => {
  let element: USAButton;

  beforeEach(() => {
    element = document.createElement('usa-button') as USAButton;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS button structure', async () => {
    await element.updateComplete;

    const button = element.querySelector('.usa-button');
    expect(button, 'Button should exist').toBeTruthy();
    expect(button.classList.contains('usa-button')).toBe(true);
  });

  it('should handle different button variants correctly', async () => {
    const variants = ['primary', 'secondary', 'accent-cool', 'accent-warm', 'base', 'outline'];

    for (const variant of variants) {
      element.variant = variant;
      await element.updateComplete;

      const button = element.querySelector('.usa-button');
      if (button && variant !== 'primary') {
        expect(
          button.classList.contains(`usa-button--${variant}`),
          `${variant} button should have correct CSS class`
        ).toBe(true);
      }
    }
  });

  it('should handle button sizes correctly', async () => {
    const sizes = ['big', 'small'];

    for (const size of sizes) {
      element.size = size;
      await element.updateComplete;

      const button = element.querySelector('.usa-button');
      if (button) {
        expect(
          button.classList.contains(`usa-button--${size}`),
          `${size} button should have correct CSS class`
        ).toBe(true);
      }
    }
  });

  it('should position icon correctly when present', async () => {
    // Remove the old element and create a new one with icon content
    element.remove();

    // Create a fresh button element with icon content from the start
    element = document.createElement('usa-button') as USAButton;
    element.innerHTML = '<usa-icon name="search" aria-label="Search icon"></usa-icon> Search';
    document.body.appendChild(element);

    await element.updateComplete;

    // Give additional time for the button component to move content and icon to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    const button = element.querySelector('.usa-button') as HTMLButtonElement;

    expect(button, 'Button should exist').toBeTruthy();

    if (button) {
      const icon = button.querySelector('usa-icon');
      expect(icon, 'Icon should exist within button').toBeTruthy();

      if (icon) {
        // Wait for icon to render
        await icon.updateComplete;

        // Icon should have proper USWDS classes applied
        const svgElement = icon.querySelector('svg');
        expect(svgElement, 'Icon SVG should exist').toBeTruthy();
        expect(svgElement?.classList.contains('usa-icon')).toBe(true);

        // Icon should be positioned correctly relative to text
        expect(button.contains(icon)).toBe(true);
        expect(button.textContent?.trim()).toContain('Search');
      }
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/button/usa-button.ts`;
      const validation = validateComponentJavaScript(componentPath, 'button');

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

  describe('CSS Class Regression Prevention', () => {
    it('should have clean CSS classes for primary button variant', async () => {
      element.variant = 'primary';
      await element.updateComplete;

      const button = element.querySelector('button');
      expect(button, 'Button element should exist').toBeTruthy();

      if (button) {
        expect(() => validateCSSClassString(button.className, 'Primary button')).not.toThrow();
        expect(button.className).toBe('usa-button');
      }
    });

    it('should have clean CSS classes for all button variants', async () => {
      const variants = ['primary', 'secondary', 'accent-cool', 'accent-warm', 'base', 'outline'] as const;

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;

        const button = element.querySelector('button');
        expect(button, `Button should exist for ${variant} variant`).toBeTruthy();

        if (button) {
          const expectedClass = variant === 'primary'
            ? 'usa-button'
            : `usa-button usa-button--${variant}`;

          expect(() => validateCSSClassString(
            button.className,
            `${variant} button variant`
          )).not.toThrow();

          expect(button.className, `${variant} button should have correct classes`).toBe(expectedClass);
        }
      }
    });

    it('should have clean CSS classes for all button sizes', async () => {
      const sizes = ['small', 'medium', 'big'] as const;

      for (const size of sizes) {
        element.size = size;
        await element.updateComplete;

        const button = element.querySelector('button');
        expect(button, `Button should exist for ${size} size`).toBeTruthy();

        if (button) {
          const expectedClass = size === 'medium'
            ? 'usa-button'
            : `usa-button usa-button--${size}`;

          expect(() => validateCSSClassString(
            button.className,
            `${size} button size`
          )).not.toThrow();

          expect(button.className, `${size} button should have correct classes`).toBe(expectedClass);
        }
      }
    });

    it('should have clean CSS classes for combined variants and sizes', async () => {
      element.variant = 'secondary';
      element.size = 'big';
      await element.updateComplete;

      const button = element.querySelector('button');
      expect(button, 'Button element should exist').toBeTruthy();

      if (button) {
        const expectedClass = 'usa-button usa-button--secondary usa-button--big';

        expect(() => validateCSSClassString(
          button.className,
          'Combined variant and size button'
        )).not.toThrow();

        expect(button.className, 'Combined variant/size should have correct classes').toBe(expectedClass);
      }
    });

    it('should validate all button CSS classes are properly formatted', async () => {
      // Test comprehensive button setup
      element.variant = 'outline';
      element.size = 'small';
      element.type = 'submit';
      element.disabled = false;
      await element.updateComplete;

      // Validate all CSS classes in component
      expect(() => validateAllCSSClasses(element, 'Button component')).not.toThrow();

      // Validate button element USWDS pattern
      const button = element.querySelector('button');
      if (button) {
        expect(() => validateUSWDSClassPattern(
          button,
          'usa-button',
          ['usa-button--outline', 'usa-button--small']
        )).not.toThrow();
      }
    });

    it('should prevent CSS class spacing regression issues', async () => {
      // Test edge cases that could introduce spacing
      const testCases = [
        { variant: 'primary', size: 'medium', expectedClass: 'usa-button' },
        { variant: 'secondary', size: 'medium', expectedClass: 'usa-button usa-button--secondary' },
        { variant: 'primary', size: 'big', expectedClass: 'usa-button usa-button--big' },
        { variant: 'outline', size: 'small', expectedClass: 'usa-button usa-button--outline usa-button--small' }
      ];

      for (const testCase of testCases) {
        element.variant = testCase.variant;
        element.size = testCase.size;
        await element.updateComplete;

        const button = element.querySelector('button');
        if (button) {
          const className = button.className;

          // Check for spacing issues
          expect(className.includes('  '), `No double spaces for ${testCase.variant}/${testCase.size}`).toBe(false);
          expect(className.startsWith(' '), `No leading space for ${testCase.variant}/${testCase.size}`).toBe(false);
          expect(className.endsWith(' '), `No trailing space for ${testCase.variant}/${testCase.size}`).toBe(false);

          // Check exact match
          expect(className, `Exact class match for ${testCase.variant}/${testCase.size}`).toBe(testCase.expectedClass);
        }
      }
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain button structure integrity', async () => {
      await element.updateComplete;

      const button = element.querySelector('.usa-button');
      expect(button.classList.contains('usa-button')).toBe(true);
    });

    it('should handle disabled state correctly', async () => {
      element.disabled = true;
      await element.updateComplete;

      const button = element.querySelector('.usa-button') as HTMLButtonElement;
      if (button) {
        expect(button.disabled).toBe(true);
      }
    });

    it('should handle unstyled variant correctly', async () => {
      // Test unstyled as a variant instead of separate property
      element.variant = 'unstyled';
      await element.updateComplete;

      const button = element.querySelector('.usa-button');
      if (button) {
        expect(button.classList.contains('usa-button--unstyled')).toBe(true);
      }
    });
  });
});
