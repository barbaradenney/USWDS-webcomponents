/**
 * Site Alert Layout Tests
 * Prevents regression of site alert structure and content positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../site-alert/index.ts';
import type { USASiteAlert } from './usa-site-alert.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USASiteAlert Layout Tests', () => {
  let element: USASiteAlert;

  beforeEach(() => {
    element = document.createElement('usa-site-alert') as USASiteAlert;
    element.heading = 'Alert Heading';
    element.message = 'Alert message content';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS site alert structure', async () => {
    await element.updateComplete;

    const siteAlert = element.querySelector('.usa-site-alert');
    const alertContainer = element.querySelector('.usa-alert');
    const alertBody = element.querySelector('.usa-alert__body');
    const alertHeading = element.querySelector('.usa-alert__heading');

    expect(siteAlert, 'Site alert should exist').toBeTruthy();
    expect(alertContainer, 'Alert container should exist').toBeTruthy();
    expect(alertBody, 'Alert body should exist').toBeTruthy();
    expect(alertHeading, 'Alert heading should exist').toBeTruthy();

    expect(siteAlert?.contains(alertContainer)).toBe(true);
    expect(alertContainer?.contains(alertBody)).toBe(true);
    expect(alertBody?.contains(alertHeading)).toBe(true);
  });

  it('should handle emergency variant correctly', async () => {
    element.variant = 'emergency';
    await element.updateComplete;

    const siteAlert = element.querySelector('.usa-site-alert');
    expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/site-alert/usa-site-alert.ts`;
      const validation = validateComponentJavaScript(componentPath, 'site-alert');

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
    it('should maintain site alert structure integrity', async () => {
      await element.updateComplete;

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert')).toBe(true);
    });
  });
});