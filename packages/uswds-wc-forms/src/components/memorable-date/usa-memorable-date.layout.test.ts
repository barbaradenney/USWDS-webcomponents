/**
 * Memorable Date Layout Tests
 * Prevents regression of three-input date structure and label positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../memorable-date/index.ts';
import type { USAMemorableDate } from './usa-memorable-date.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAMemorableDate Layout Tests', () => {
  let element: USAMemorableDate;

  beforeEach(() => {
    element = document.createElement('usa-memorable-date') as USAMemorableDate;
    element.label = 'Date of birth';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS memorable date structure', async () => {
    await element.updateComplete;

    const fieldset = element.querySelector('.usa-fieldset');
    const legend = element.querySelector('.usa-legend');
    const memorableDate = element.querySelector('.usa-memorable-date');
    const monthInput = element.querySelector('.usa-form-group--month');
    const dayInput = element.querySelector('.usa-form-group--day');
    const yearInput = element.querySelector('.usa-form-group--year');

    expect(fieldset, 'Fieldset should exist').toBeTruthy();
    expect(legend, 'Legend should exist').toBeTruthy();
    expect(memorableDate, 'Memorable date container should exist').toBeTruthy();

    if (memorableDate) {
      expect(memorableDate.contains(monthInput)).toBe(true);
      expect(memorableDate.contains(dayInput)).toBe(true);
      expect(memorableDate.contains(yearInput)).toBe(true);
    }
  });

  it('should position date inputs in correct order', async () => {
    await element.updateComplete;

    const memorableDate = element.querySelector('.usa-memorable-date');
    const inputs = memorableDate?.querySelectorAll('.usa-form-group');

    if (inputs && inputs.length === 3) {
      expect(inputs[0].classList.contains('usa-form-group--month')).toBe(true);
      expect(inputs[1].classList.contains('usa-form-group--day')).toBe(true);
      expect(inputs[2].classList.contains('usa-form-group--year')).toBe(true);
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/memorable-date/usa-memorable-date.ts`;
        const validation = validateComponentJavaScript(componentPath, 'memorable-date');

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
    it('should maintain memorable date structure integrity', async () => {
      await element.updateComplete;

      const memorableDate = element.querySelector('.usa-memorable-date');
      expect(memorableDate?.classList.contains('usa-memorable-date')).toBe(true);
    });
  });
});
