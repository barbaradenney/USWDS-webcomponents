/**
 * Icon Layout Tests
 * Prevents regression of icon rendering and size positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../icon/index.ts';
import type { USAIcon } from './usa-icon.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAIcon Layout Tests', () => {
  let element: USAIcon;

  beforeEach(() => {
    element = document.createElement('usa-icon') as USAIcon;
    element.icon = 'search';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS icon structure', async () => {
    await element.updateComplete;

    const icon = element.querySelector('.usa-icon');
    const svg = element.querySelector('svg');

    expect(icon, 'Icon container should exist').toBeTruthy();
    expect(svg, 'SVG element should exist').toBeTruthy();
    expect(icon?.classList.contains('usa-icon')).toBe(true);
  });

  it('should handle icon sizes correctly', async () => {
    const sizes = ['3', '4', '5', '6', '7', '8', '9'];

    for (const size of sizes) {
      element.size = size;
      await element.updateComplete;

      const icon = element.querySelector('.usa-icon');
      expect(icon?.classList.contains(`usa-icon--size-${size}`)).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/icon/usa-icon.ts`;
      const validation = validateComponentJavaScript(componentPath, 'icon');

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
    it('should maintain icon structure integrity', async () => {
      await element.updateComplete;

      const icon = element.querySelector('.usa-icon');
      const svg = element.querySelector('svg');

      expect(icon?.classList.contains('usa-icon')).toBe(true);
      expect(svg).toBeTruthy();
    });
  });
});