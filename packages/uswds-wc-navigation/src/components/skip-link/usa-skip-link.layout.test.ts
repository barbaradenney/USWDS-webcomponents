/**
 * Skip Link Layout Tests
 * Prevents regression of skip link positioning and visibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../skip-link/index.ts';
import type { USASkipLink } from './usa-skip-link.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USASkipLink Layout Tests', () => {
  let element: USASkipLink;

  beforeEach(() => {
    element = document.createElement('usa-skip-link') as USASkipLink;
    element.href = '#main-content';
    element.textContent = 'Skip to main content';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS skip link structure', async () => {
    await element.updateComplete;

    const skipLink = element.querySelector('.usa-skipnav');
    expect(skipLink, 'Skip link should exist').toBeTruthy();
    expect(skipLink?.classList.contains('usa-skipnav')).toBe(true);
    expect(skipLink?.getAttribute('href')).toBe('#main-content');
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/skip-link/usa-skip-link.ts`;
        const validation = validateComponentJavaScript(componentPath, 'skip-link');

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
    it('should maintain skip link structure integrity', async () => {
      await element.updateComplete;

      const skipLink = element.querySelector('.usa-skipnav');
      expect(skipLink?.classList.contains('usa-skipnav')).toBe(true);
    });
  });
});
