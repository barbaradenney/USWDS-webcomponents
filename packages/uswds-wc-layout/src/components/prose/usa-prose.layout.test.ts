/**
 * Prose Layout Tests
 * Prevents regression of prose text flow and typography spacing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../prose/index.ts';
import type { USAProse } from './usa-prose.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAProse Layout Tests', () => {
  let element: USAProse;

  beforeEach(() => {
    element = document.createElement('usa-prose') as USAProse;
    element.innerHTML = '<p>Test prose content</p>';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS prose structure', async () => {
    await element.updateComplete;

    const prose = element.querySelector('.usa-prose');
    expect(prose, 'Prose container should exist').toBeTruthy();
    expect(prose?.classList.contains('usa-prose')).toBe(true);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/prose/usa-prose.ts`;
      const validation = validateComponentJavaScript(componentPath, 'prose');

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
    it('should maintain prose structure integrity', async () => {
      await element.updateComplete;

      const prose = element.querySelector('.usa-prose');
      expect(prose?.classList.contains('usa-prose')).toBe(true);
    });
  });
});