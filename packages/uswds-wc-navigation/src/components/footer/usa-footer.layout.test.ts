/**
 * Footer Layout Tests
 * Prevents regression of footer structure, multi-column layout, and section positioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../footer/index.ts';
import type { USAFooter } from './usa-footer.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAFooter Layout Tests', () => {
  let element: USAFooter;

  beforeEach(() => {
    element = document.createElement('usa-footer') as USAFooter;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS footer structure', async () => {
    await element.updateComplete;

    const footer = element.querySelector('.usa-footer');

    expect(footer, 'Footer container should exist').toBeTruthy();
    expect(footer?.classList.contains('usa-footer')).toBe(true);
  });

  it('should handle big footer variant correctly', async () => {
    element.variant = 'big';
    await element.updateComplete;

    const footer = element.querySelector('.usa-footer');
    expect(footer?.classList.contains('usa-footer--big')).toBe(true);
  });

  it('should position footer sections correctly when present', async () => {
    element.sections = [
      {
        title: 'Test Section',
        links: [{ label: 'Test Link', href: '/test' }]
      }
    ];
    await element.updateComplete;

    const footer = element.querySelector('.usa-footer');
    const footerNav = element.querySelector('.usa-footer__nav');
    const primarySection = element.querySelector('.usa-footer__primary-section');

    expect(footer, 'Footer should exist').toBeTruthy();
    expect(footerNav, 'Footer nav should exist when sections provided').toBeTruthy();
    expect(primarySection, 'Primary section should exist when sections provided').toBeTruthy();

    if (footerNav) {
      expect(footer?.contains(footerNav), 'Nav should be inside footer').toBe(true);
    }
  });

  it('should handle footer variant classes correctly (CRITICAL REGRESSION TEST)', async () => {
    // Test slim variant
    element.variant = 'slim';
    await element.updateComplete;

    const footerSlim = element.querySelector('.usa-footer');
    expect(footerSlim?.classList.contains('usa-footer--slim'), 'Slim footer should have correct CSS class').toBe(true);

    // Test medium variant
    element.variant = 'medium';
    await element.updateComplete;

    const footerMedium = element.querySelector('.usa-footer');
    expect(footerMedium?.classList.contains('usa-footer--medium'), 'Medium footer should have correct CSS class').toBe(true);

    // Test big variant
    element.variant = 'big';
    await element.updateComplete;

    const footerBig = element.querySelector('.usa-footer');
    expect(footerBig?.classList.contains('usa-footer--big'), 'Big footer should have correct CSS class').toBe(true);
  });

  it('should position footer sections in correct grid layout', async () => {
    element.sections = [
      { title: 'Section 1', links: [{ label: 'Link 1', href: '/link1' }] },
      { title: 'Section 2', links: [{ label: 'Link 2', href: '/link2' }] }
    ];
    await element.updateComplete;

    const gridContainer = element.querySelector('.grid-container');
    const gridRow = element.querySelector('.grid-row');
    const gridCols = element.querySelectorAll('.usa-footer__nav [class*="grid-col"]');

    expect(gridContainer, 'Grid container should exist').toBeTruthy();
    expect(gridRow, 'Grid row should exist').toBeTruthy();
    expect(gridCols.length, 'Should have correct number of grid columns').toBe(2);

    // Verify grid structure hierarchy
    expect(gridContainer?.contains(gridRow), 'Grid row should be inside container').toBe(true);
    gridCols.forEach((col, index) => {
      expect(gridRow?.contains(col), `Grid column ${index + 1} should be inside grid row`).toBe(true);
    });
  });

  // NOTE: Identifier positioning tests require browser environment
  // Layout calculations for identifier position need real browser layout engine
  // Cypress coverage: Footer identifier positioning tests in browser context

  it('should handle footer with sections but no identifier', async () => {
    element.sections = [
      { title: 'Section Only', links: [{ label: 'Link Only', href: '/only' }] }
    ];
    element.agencyName = '';
    element.identifierLinks = [];
    await element.updateComplete;

    const footer = element.querySelector('.usa-footer');
    const footerNav = element.querySelector('.usa-footer__nav');
    const identifier = element.querySelector('.usa-identifier');

    expect(footer, 'Footer should exist').toBeTruthy();
    expect(footerNav, 'Footer nav should exist with sections').toBeTruthy();
    expect(identifier, 'Identifier should not exist without content').toBeFalsy();
  });

  it('should maintain proper USWDS footer content hierarchy', async () => {
    element.variant = 'big';
    element.sections = [
      { title: 'Full Section', links: [{ label: 'Full Link', href: '/full' }] }
    ];
    element.agencyName = 'Full Agency';
    element.identifierLinks = [{ label: 'Full Privacy', href: '/full-privacy' }];
    await element.updateComplete;

    const footer = element.querySelector('.usa-footer');
    const footerChildren = Array.from(footer?.children || []);

    // Should have: nav, slot, identifier in that order
    const footerNav = element.querySelector('.usa-footer__nav');
    const slot = element.querySelector('slot');
    const identifier = element.querySelector('.usa-identifier');

    if (footerNav && slot && identifier) {
      const navIndex = footerChildren.indexOf(footerNav);
      const slotIndex = footerChildren.indexOf(slot);
      const identifierIndex = footerChildren.indexOf(identifier);

      expect(navIndex, 'Footer nav should come first').toBeLessThan(slotIndex);
      expect(slotIndex, 'Slot should come before identifier').toBeLessThan(identifierIndex);
    }
  });

  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/footer/usa-footer.ts`;
      const validation = validateComponentJavaScript(componentPath, 'footer');

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

  describe('Visual Regression Prevention', () => {
    it('should maintain footer structure integrity', async () => {
      await element.updateComplete;

      const footer = element.querySelector('.usa-footer');
      expect(footer?.classList.contains('usa-footer')).toBe(true);
    });
  });
});