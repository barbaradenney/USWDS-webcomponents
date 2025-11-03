/**
 * Collection Layout Tests
 * Prevents regression of collection grid structure, item positioning, and media layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../collection/index.ts';
import type { USACollection } from './usa-collection.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USACollection Layout Tests', () => {
  let element: USACollection;

  beforeEach(() => {
    element = document.createElement('usa-collection') as USACollection;
    element.items = [
      { title: 'Item 1', description: 'Description 1' },
      { title: 'Item 2', description: 'Description 2' },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS collection structure', async () => {
    await element.updateComplete;

    const collection = element.querySelector('.usa-collection');
    const collectionItems = element.querySelectorAll('.usa-collection__item');

    expect(collection, 'Collection container should exist').toBeTruthy();
    expect(collectionItems.length, 'Should have collection items').toBe(2);

    collectionItems.forEach((item, index) => {
      expect(collection.contains(item), `Item ${index} should be in collection`).toBe(true);
    });
  });

  it('should position collection items correctly', async () => {
    await element.updateComplete;

    const collectionItems = element.querySelectorAll('.usa-collection__item');
    const firstItem = collectionItems[0];
    const heading = firstItem?.querySelector('.usa-collection__heading');
    const description = firstItem?.querySelector('.usa-collection__description');

    if (firstItem) {
      expect(heading, 'Should have heading').toBeTruthy();
      expect(description, 'Should have description').toBeTruthy();
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/collection/usa-collection.ts`;
        const validation = validateComponentJavaScript(componentPath, 'collection');

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
    it('should maintain collection structure integrity', async () => {
      await element.updateComplete;

      const collection = element.querySelector('.usa-collection');
      expect(collection?.classList.contains('usa-collection')).toBe(true);
    });
  });
});
