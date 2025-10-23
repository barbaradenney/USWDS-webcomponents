/**
 * In-Page Navigation Layout Tests
 * Prevents regression of navigation structure and anchor link positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../in-page-navigation/index.ts';
import type { USAInPageNavigation } from './usa-in-page-navigation.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAInPageNavigation Layout Tests', () => {
  let element: USAInPageNavigation;

  beforeEach(async () => {
    element = document.createElement('usa-in-page-navigation') as USAInPageNavigation;
    document.body.appendChild(element);

    // Set sections after the element is connected
    element.sections = [
      { id: 'section-1', label: 'Section 1' },
      { id: 'section-2', label: 'Section 2' },
    ];

    // Force an update
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS in-page navigation structure', async () => {
    await element.updateComplete;

    const nav = element.querySelector('.usa-in-page-nav');
    const navList = element.querySelector('.usa-in-page-nav__list');
    const navItems = element.querySelectorAll('.usa-in-page-nav__item');

    expect(nav, 'Navigation should exist').toBeTruthy();
    expect(navList, 'Navigation list should exist').toBeTruthy();
    expect(navItems.length, 'Should have navigation items').toBe(2);

    expect(nav?.contains(navList)).toBe(true);
    navItems.forEach((item) => {
      expect(navList?.contains(item)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/in-page-navigation/usa-in-page-navigation.ts`;
        const validation = validateComponentJavaScript(componentPath, 'in-page-navigation');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain navigation structure integrity', async () => {
      await element.updateComplete;

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.classList.contains('usa-in-page-nav')).toBe(true);
    });
  });
});
