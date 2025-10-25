/**
 * List Layout Tests
 * Prevents regression of list structure and item alignment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../list/index.ts';
import type { USAList } from './usa-list.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAList Layout Tests', () => {
  let element: USAList;

  beforeEach(() => {
    element = document.createElement('usa-list') as USAList;
    element.innerHTML = `
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    `;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS list structure', async () => {
    await element.updateComplete;

    const list = element.querySelector('.usa-list');
    const listItems = element.querySelectorAll('li');

    expect(list, 'List should exist').toBeTruthy();
    expect(listItems.length, 'Should have list items').toBe(3);

    listItems.forEach((item) => {
      expect(list?.contains(item)).toBe(true);
    });
  });

  it('should handle unstyled variant correctly', async () => {
    element.unstyled = true;
    await element.updateComplete;

    const list = element.querySelector('.usa-list');
    expect(list?.classList.contains('usa-list--unstyled')).toBe(true);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/list/usa-list.ts`;
      const validation = validateComponentJavaScript(componentPath, 'list');

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
    it('should maintain list structure integrity', async () => {
      await element.updateComplete;

      const list = element.querySelector('.usa-list');
      expect(list?.classList.contains('usa-list')).toBe(true);
    });
  });
});
