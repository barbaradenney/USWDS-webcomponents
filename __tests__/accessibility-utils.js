/**
 * Accessibility Testing Utilities
 *
 * Utilities for testing WCAG compliance and accessibility features
 * using axe-core for automated accessibility testing.
 */

import axe from 'axe-core';
import { expect } from 'vitest';

// Extend Vitest expect with axe matcher
expect.extend({
  toHaveNoViolations(results) {
    const violations = results.violations;

    if (violations.length === 0) {
      return {
        pass: true,
        message: () => 'Expected accessibility violations, but found none'
      };
    }

    const violationMessages = violations.map(violation => {
      const nodeMessages = violation.nodes.map(node => {
        const target = node.target.join(', ');
        return `  ${target}: ${node.failureSummary}`;
      }).join('\n');

      return `${violation.id} (${violation.impact}): ${violation.description}\n${nodeMessages}`;
    }).join('\n\n');

    return {
      pass: false,
      message: () => `Expected no accessibility violations, but found ${violations.length}:\n\n${violationMessages}`
    };
  }
});

/**
 * USWDS Accessibility Configuration Presets
 * Different levels of accessibility compliance testing
 */
export const USWDS_A11Y_CONFIG = {
  /**
   * Full WCAG 2.1 AA compliance
   * Most strict - all WCAG rules enabled
   */
  FULL_COMPLIANCE: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
    }
  },

  /**
   * USWDS-specific accessibility rules
   * Focuses on common USWDS component patterns
   */
  USWDS_PATTERNS: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice']
    }
  },

  /**
   * Basic accessibility checks
   * Minimal set for quick validation
   */
  BASIC: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a']
    }
  },

  /**
   * Form-specific accessibility
   * For form components and inputs
   */
  FORMS: {
    runOnly: {
      type: 'rule',
      values: [
        'label',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roles',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'form-field-multiple-labels',
        'input-button-name',
        'input-image-alt'
      ]
    }
  },

  /**
   * Interactive component accessibility
   * For buttons, links, navigation
   */
  INTERACTIVE: {
    runOnly: {
      type: 'rule',
      values: [
        'button-name',
        'link-name',
        'aria-command-name',
        'keyboard-accessible',
        'focus-order-semantics',
        'aria-hidden-focus'
      ]
    }
  }
};

/**
 * Test component for accessibility violations
 * @param {HTMLElement} element - The element to test
 * @param {Object} config - axe-core configuration (optional)
 * @returns {Promise<void>}
 */
export async function testComponentAccessibility(element, config = USWDS_A11Y_CONFIG.FULL_COMPLIANCE) {
  // Ensure element is in the document
  if (!document.body.contains(element)) {
    throw new Error('Element must be attached to document.body for accessibility testing');
  }

  // CRITICAL: Wait for Lit to finish reconciling DOM after property changes
  // This prevents ChildPart "has no parentNode" errors when tests change properties
  // that trigger major DOM restructuring (like inputType: 'textarea' -> 'input')
  if (element.updateComplete) {
    await element.updateComplete;
  }

  // Additional wait for DOM to stabilize and Lit markers to reconcile
  await new Promise(resolve => requestAnimationFrame(() => resolve()));
  await new Promise(resolve => setTimeout(resolve, 0));

  // Run axe-core accessibility tests
  const results = await axe.run(element, config);

  // Use our custom matcher
  expect(results).toHaveNoViolations();
}

/**
 * Test multiple accessibility configurations
 * Useful for comprehensive testing
 * @param {HTMLElement} element - The element to test
 * @param {Array<Object>} configs - Array of axe configurations
 * @returns {Promise<void>}
 */
export async function testMultipleA11yConfigs(element, configs) {
  for (const config of configs) {
    await testComponentAccessibility(element, config);
  }
}

/**
 * Get accessibility violations without throwing
 * Useful for debugging and reporting
 * @param {HTMLElement} element - The element to test
 * @param {Object} config - axe-core configuration
 * @returns {Promise<Array>} Array of violations
 */
export async function getA11yViolations(element, config = USWDS_A11Y_CONFIG.FULL_COMPLIANCE) {
  const results = await axe.run(element, config);
  return results.violations;
}

/**
 * Assert specific ARIA attributes
 * @param {HTMLElement} element - The element to check
 * @param {Object} expectedAttrs - Expected ARIA attributes
 */
export function assertARIAAttributes(element, expectedAttrs) {
  for (const [attr, expectedValue] of Object.entries(expectedAttrs)) {
    const actualValue = element.getAttribute(attr);
    if (actualValue !== expectedValue) {
      throw new Error(
        `ARIA attribute mismatch: ${attr}="${expectedValue}" expected, got "${actualValue}"`
      );
    }
  }
}

/**
 * Check if element is keyboard accessible
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if keyboard accessible
 */
export function isKeyboardAccessible(element) {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = [
    'BUTTON',
    'A',
    'INPUT',
    'SELECT',
    'TEXTAREA'
  ].includes(element.tagName);

  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
}

/**
 * Check if element has proper focus management
 * @param {HTMLElement} element - The element to check
 * @returns {Object} Focus management status
 */
export function checkFocusManagement(element) {
  return {
    isFocusable: isKeyboardAccessible(element),
    hasFocusIndicator: window.getComputedStyle(element, ':focus').outlineWidth !== '0px',
    hasTabIndex: element.hasAttribute('tabindex'),
    tabIndexValue: element.getAttribute('tabindex')
  };
}

/**
 * Test keyboard navigation
 * @param {HTMLElement} element - The element to test
 * @param {string} key - Keyboard key to simulate
 * @returns {Promise<void>}
 */
export async function testKeyPress(element, key) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true
  });

  element.dispatchEvent(event);

  // Wait for any updates
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Test screen reader announcements
 * Checks for live regions and aria-live attributes
 * @param {HTMLElement} container - Container to check
 * @returns {Array} Array of live region elements
 */
export function getLiveRegions(container) {
  const liveRegions = [];

  // Check for aria-live
  const ariaLiveElements = container.querySelectorAll('[aria-live]');
  liveRegions.push(...Array.from(ariaLiveElements));

  // Check for role="status", role="alert"
  const statusElements = container.querySelectorAll('[role="status"], [role="alert"]');
  liveRegions.push(...Array.from(statusElements));

  return liveRegions;
}

/**
 * Check color contrast
 * @param {HTMLElement} element - The element to check
 * @returns {Promise<boolean>} True if contrast is sufficient
 */
export async function checkColorContrast(element) {
  const results = await axe.run(element, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    }
  });

  return results.violations.length === 0;
}
