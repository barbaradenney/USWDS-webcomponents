/**
 * Process List Layout Tests
 * Prevents regression of process list structure and step positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../process-list/index.ts';
import type { USAProcessList } from './usa-process-list.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USAProcessList Layout Tests', () => {
  let element: USAProcessList;

  beforeEach(() => {
    element = document.createElement('usa-process-list') as USAProcessList;
    element.items = [
      { heading: 'Step 1', content: 'First step content' },
      { heading: 'Step 2', content: 'Second step content' }
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS process list structure', async () => {
    await element.updateComplete;

    const processList = element.querySelector('.usa-process-list');
    const processItems = element.querySelectorAll('.usa-process-list__item');

    expect(processList, 'Process list should exist').toBeTruthy();
    expect(processItems.length, 'Should have process items').toBe(2);

    processItems.forEach(item => {
      expect(processList?.contains(item)).toBe(true);
      const heading = item.querySelector('.usa-process-list__heading');
      expect(heading, 'Each item should have heading').toBeTruthy();
    });
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/process-list/usa-process-list.ts`;
      const validation = validateComponentJavaScript(componentPath, 'process-list');

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
    it('should maintain process list structure integrity', async () => {
      await element.updateComplete;

      const processList = element.querySelector('.usa-process-list');
      expect(processList?.classList.contains('usa-process-list')).toBe(true);
    });
  });
});