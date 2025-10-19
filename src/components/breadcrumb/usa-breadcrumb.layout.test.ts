/**
 * Breadcrumb Layout Tests
 * Prevents regression of breadcrumb structure and link positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../breadcrumb/index.ts';
import type { USABreadcrumb } from './usa-breadcrumb.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USABreadcrumb Layout Tests', () => {
  let element: USABreadcrumb;

  beforeEach(() => {
    element = document.createElement('usa-breadcrumb') as USABreadcrumb;
    element.items = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Current Page' }
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS breadcrumb structure', async () => {
    await element.updateComplete;

    const breadcrumb = element.querySelector('.usa-breadcrumb');
    const breadcrumbList = element.querySelector('.usa-breadcrumb__list');
    const breadcrumbItems = element.querySelectorAll('.usa-breadcrumb__list-item');

    expect(breadcrumb, 'Breadcrumb container should exist').toBeTruthy();
    expect(breadcrumbList, 'Breadcrumb list should exist').toBeTruthy();
    expect(breadcrumbItems.length, 'Should have correct number of items').toBe(3);

    // Verify structure hierarchy
    expect(breadcrumb.contains(breadcrumbList)).toBe(true);
    breadcrumbItems.forEach((item, index) => {
      expect(breadcrumbList.contains(item), `Item ${index} should be in list`).toBe(true);
    });
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/breadcrumb/usa-breadcrumb.ts`;
      const validation = validateComponentJavaScript(componentPath, 'breadcrumb');

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
    it('should maintain breadcrumb structure integrity', async () => {
      await element.updateComplete;

      const breadcrumb = element.querySelector('.usa-breadcrumb');
      const breadcrumbList = element.querySelector('.usa-breadcrumb__list');

      expect(breadcrumb.classList.contains('usa-breadcrumb')).toBe(true);
      expect(breadcrumbList.classList.contains('usa-breadcrumb__list')).toBe(true);
    });
  });
});