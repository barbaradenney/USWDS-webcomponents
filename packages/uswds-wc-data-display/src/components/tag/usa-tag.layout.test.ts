/**
 * Tag Layout Tests
 * Prevents regression of tag structure and text positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../tag/index.ts';
import type { USATag } from './usa-tag.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USATag Layout Tests', () => {
  let element: USATag;

  beforeEach(() => {
    element = document.createElement('usa-tag') as USATag;
    element.text = 'Test Tag';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS tag structure', async () => {
    await element.updateComplete;

    const tag = element.querySelector('.usa-tag');
    expect(tag, 'Tag should exist').toBeTruthy();
    expect(tag?.classList.contains('usa-tag')).toBe(true);
    expect(tag?.textContent?.trim()).toBe('Test Tag');
  });

  it('should handle big variant correctly', async () => {
    element.big = true;
    await element.updateComplete;

    const tag = element.querySelector('.usa-tag');
    expect(tag?.classList.contains('usa-tag--big')).toBe(true);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/tag/usa-tag.ts`;
      const validation = validateComponentJavaScript(componentPath, 'tag');

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
    it('should maintain tag structure integrity', async () => {
      await element.updateComplete;

      const tag = element.querySelector('.usa-tag');
      expect(tag?.classList.contains('usa-tag')).toBe(true);
    });
  });
});