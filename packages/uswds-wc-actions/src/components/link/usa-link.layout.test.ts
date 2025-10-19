/**
 * Link Layout Tests
 * Prevents regression of link structure and external link icon positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../link/index.ts';
import type { USALink } from './usa-link.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USALink Layout Tests', () => {
  let element: USALink;

  beforeEach(() => {
    element = document.createElement('usa-link') as USALink;
    element.href = 'https://example.com';
    element.textContent = 'Test Link';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS link structure', async () => {
    await element.updateComplete;

    const link = element.querySelector('.usa-link');
    expect(link, 'Link should exist').toBeTruthy();
    expect(link?.classList.contains('usa-link')).toBe(true);
  });

  it('should handle external link correctly', async () => {
    element.external = true;
    await element.updateComplete;

    const link = element.querySelector('.usa-link');
    expect(link?.classList.contains('usa-link--external')).toBe(true);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/link/usa-link.ts`;
      const validation = validateComponentJavaScript(componentPath, 'link');

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
    it('should maintain link structure integrity', async () => {
      await element.updateComplete;

      const link = element.querySelector('.usa-link');
      expect(link?.classList.contains('usa-link')).toBe(true);
    });
  });
});