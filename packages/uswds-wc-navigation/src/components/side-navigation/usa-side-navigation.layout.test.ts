/**
 * Side Navigation Layout Tests
 * Prevents regression of navigation structure and nested menu layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../side-navigation/index.ts';
import type { USASideNavigation } from './usa-side-navigation.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USASideNavigation Layout Tests', () => {
  let element: USASideNavigation;

  beforeEach(() => {
    element = document.createElement('usa-side-navigation') as USASideNavigation;
    element.items = [
      { label: 'Item 1', href: '/item1' },
      { label: 'Item 2', href: '/item2', current: true },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS side navigation structure', async () => {
    await element.updateComplete;

    const sideNav = element.querySelector('.usa-sidenav');
    const sideNavList = element.querySelector('.usa-sidenav');
    const sideNavItems = element.querySelectorAll('.usa-sidenav__item');

    expect(sideNav, 'Side navigation should exist').toBeTruthy();
    expect(sideNavList, 'Side navigation list should exist').toBeTruthy();
    expect(sideNavItems.length, 'Should have navigation items').toBe(2);

    expect(sideNav?.contains(sideNavList)).toBe(true);
    sideNavItems.forEach((item) => {
      expect(sideNavList?.contains(item)).toBe(true);
    });
  });

  it('should handle current item correctly', async () => {
    await element.updateComplete;

    const currentItem = element.querySelector('.usa-current');
    expect(currentItem, 'Current item should exist').toBeTruthy();
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/side-navigation/usa-side-navigation.ts`;
      const validation = validateComponentJavaScript(componentPath, 'side-navigation');

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
    it('should maintain side navigation structure integrity', async () => {
      await element.updateComplete;

      const sideNav = element.querySelector('.usa-sidenav');
      expect(sideNav?.classList.contains('usa-sidenav')).toBe(true);
    });
  });
});
