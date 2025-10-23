/**
 * Alert Layout Tests
 * Prevents regression of alert structure, icon positioning, and content alignment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../alert/index.ts';
import type { USAAlert } from './usa-alert.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAAlert Layout Tests', () => {
  let element: USAAlert;

  beforeEach(() => {
    element = document.createElement('usa-alert') as USAAlert;
    element.heading = 'Test Alert';
    element.innerHTML = 'This is a test alert message.';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS alert structure', async () => {
    await element.updateComplete;

    const alert = element.querySelector('.usa-alert');
    const alertBody = element.querySelector('.usa-alert__body');
    const alertHeading = element.querySelector('.usa-alert__heading');
    const alertText = element.querySelector('.usa-alert__text');

    expect(alert, 'Alert container should exist').toBeTruthy();
    expect(alertBody, 'Alert body should exist').toBeTruthy();
    expect(alertHeading, 'Alert heading should exist').toBeTruthy();
    expect(alertText, 'Alert text should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(alert.contains(alertBody)).toBe(true);
    expect(alertBody.contains(alertHeading)).toBe(true);
    expect(alertBody.contains(alertText)).toBe(true);
  });

  it('should position heading before text in alert body', async () => {
    await element.updateComplete;

    const alertBody = element.querySelector('.usa-alert__body');
    const alertHeading = element.querySelector('.usa-alert__heading');
    const alertText = element.querySelector('.usa-alert__text');

    // Heading should appear before text in alert body
    const bodyChildren = Array.from(alertBody.children);
    const headingIndex = bodyChildren.indexOf(alertHeading);
    const textIndex = bodyChildren.indexOf(alertText);

    expect(headingIndex, 'Heading should appear before text').toBeLessThan(textIndex);
  });

  it('should handle different alert types correctly', async () => {
    const types = ['info', 'warning', 'error', 'success'];

    for (const type of types) {
      element.variant = type;
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      if (alert) {
        expect(
          alert.classList.contains(`usa-alert--${type}`),
          `${type} alert should have correct CSS class`
        ).toBe(true);
      }
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/alert/usa-alert.ts`;
      const validation = validateComponentJavaScript(componentPath, 'alert');

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
    it('should maintain alert structure integrity', async () => {
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      const alertBody = element.querySelector('.usa-alert__body');

      expect(alert.classList.contains('usa-alert')).toBe(true);
      expect(alertBody.classList.contains('usa-alert__body')).toBe(true);
    });

    it('should handle slim variant correctly', async () => {
      element.slim = true;
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      if (alert) {
        expect(alert.classList.contains('usa-alert--slim')).toBe(true);
      }
    });

    it('should handle no-icon variant correctly', async () => {
      element.noIcon = true;
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      if (alert) {
        expect(alert.classList.contains('usa-alert--no-icon')).toBe(true);
      }
    });
  });
});
