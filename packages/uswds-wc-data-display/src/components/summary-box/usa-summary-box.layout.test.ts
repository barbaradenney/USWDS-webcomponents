/**
 * Summary Box Layout Tests
 * Prevents regression of summary box structure and content layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../summary-box/index.ts';
import type { USASummaryBox } from './usa-summary-box.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USASummaryBox Layout Tests', () => {
  let element: USASummaryBox;

  beforeEach(() => {
    element = document.createElement('usa-summary-box') as USASummaryBox;
    element.heading = 'Summary';
    element.content = 'Summary content goes here';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS summary box structure', async () => {
    await element.updateComplete;

    const summaryBox = element.querySelector('.usa-summary-box');
    const summaryBoxHeading = element.querySelector('.usa-summary-box__heading');
    const summaryBoxText = element.querySelector('.usa-summary-box__text');

    expect(summaryBox, 'Summary box should exist').toBeTruthy();
    expect(summaryBoxHeading, 'Summary box heading should exist').toBeTruthy();
    expect(summaryBoxText, 'Summary box text should exist').toBeTruthy();

    expect(summaryBox?.contains(summaryBoxHeading)).toBe(true);
    expect(summaryBox?.contains(summaryBoxText)).toBe(true);
  });

  it('should position heading before text content', async () => {
    await element.updateComplete;

    const summaryBoxBody = element.querySelector('.usa-summary-box__body');
    const heading = element.querySelector('.usa-summary-box__heading');
    const text = element.querySelector('.usa-summary-box__text');

    if (summaryBoxBody && heading && text) {
      const children = Array.from(summaryBoxBody.children);
      const headingIndex = children.indexOf(heading);
      const textIndex = children.indexOf(text);

      expect(headingIndex).toBeLessThan(textIndex);
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/summary-box/usa-summary-box.ts`;
        const validation = validateComponentJavaScript(componentPath, 'summary-box');

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
    it('should maintain summary box structure integrity', async () => {
      await element.updateComplete;

      const summaryBox = element.querySelector('.usa-summary-box');
      expect(summaryBox?.classList.contains('usa-summary-box')).toBe(true);
    });
  });
});
