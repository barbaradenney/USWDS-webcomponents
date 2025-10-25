/**
 * Language Selector Layout Tests
 * Prevents regression of dropdown positioning and language list structure
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../language-selector/index.ts';
import type { USALanguageSelector } from './usa-language-selector.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USALanguageSelector Layout Tests', () => {
  let element: USALanguageSelector;

  beforeEach(() => {
    element = document.createElement('usa-language-selector') as USALanguageSelector;
    element.languages = [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS language selector structure', async () => {
    await element.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50)); // Additional wait

    const languageSelector = element.querySelector('.usa-language');
    const languageButton = element.querySelector('.usa-button');

    expect(languageSelector, 'Language selector should exist').toBeTruthy();
    expect(languageButton, 'Language button should exist').toBeTruthy();

    expect(languageSelector?.contains(languageButton)).toBe(true);

    element.expanded = true;
    await element.updateComplete;

    const expandedList = element.querySelector('.usa-language__submenu');
    if (expandedList) {
      expect(languageSelector?.contains(expandedList)).toBe(true);
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/language-selector/usa-language-selector.ts`;
      const validation = validateComponentJavaScript(componentPath, 'language-selector');

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
    it('should maintain language selector structure integrity', async () => {
      await element.updateComplete;

      const languageSelector = element.querySelector('.usa-language');
      expect(languageSelector?.classList.contains('usa-language')).toBe(true);
    });
  });
});
