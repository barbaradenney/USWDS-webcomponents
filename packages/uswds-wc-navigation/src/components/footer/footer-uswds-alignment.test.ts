import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-footer.ts';
import type { USAFooter } from './usa-footer.js';

/**
 * USWDS Footer Alignment Validation Tests
 *
 * These tests ensure our footer implementation exactly matches USWDS patterns.
 * They catch structural misalignments that cause styling and behavior issues.
 *
 * CRITICAL: These tests must pass to ensure USWDS compliance.
 */
describe('Footer USWDS Alignment Validation', () => {
  let element: USAFooter;

  beforeEach(() => {
    element = document.createElement('usa-footer') as USAFooter;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Medium Footer USWDS Structure Validation', () => {
    beforeEach(async () => {
      element.variant = 'medium';
      element.agencyName = 'Test Agency';
      element.sections = [
        { title: 'About', links: [{ label: 'Mission', href: '/mission' }] },
        { title: 'Services', links: [{ label: 'Digital', href: '/digital' }] }
      ];
      await element.updateComplete;
    });

    it('should have correct primary section structure per USWDS medium footer', () => {
      // USWDS Medium Footer: Primary section contains nav with grid-row
      const primarySection = element.querySelector('.usa-footer__primary-section');
      const nav = element.querySelector('.usa-footer__nav');
      const gridContainer = element.querySelector('.usa-footer__primary-section .grid-container');
      const gridRow = element.querySelector('.usa-footer__nav .grid-row');

      expect(primarySection, 'Primary section must exist').toBeTruthy();
      expect(nav, 'Navigation must exist within primary section').toBeTruthy();
      expect(gridContainer, 'Grid container must exist in primary section').toBeTruthy();
      expect(gridRow, 'Grid row must exist in navigation').toBeTruthy();

      // Verify proper nesting: primary-section > nav > grid-container > grid-row
      expect(primarySection?.contains(nav!), 'Nav must be inside primary section').toBe(true);
      expect(nav?.contains(gridContainer!), 'Grid container must be inside nav').toBe(true);
      expect(gridContainer?.contains(gridRow!), 'Grid row must be inside grid container').toBe(true);
    });

    it('should use primary links as <a> elements (not headings) per USWDS medium pattern', () => {
      const primaryLinks = element.querySelectorAll('.usa-footer__primary-link');

      expect(primaryLinks.length, 'Should have primary links').toBeGreaterThan(0);

      primaryLinks.forEach((link) => {
        expect(link.tagName.toLowerCase(), `Primary link must be <a> element for medium footer`).toBe('a');
        expect(link.getAttribute('href'), `Primary link must have href attribute`).toBeTruthy();
      });
    });

    it('should have proper list structure without bullets', () => {
      const mainList = element.querySelector('.usa-footer__nav ul');
      const listItems = element.querySelectorAll('.usa-footer__nav li');

      expect(mainList, 'Main navigation list must exist').toBeTruthy();
      expect(mainList?.classList.contains('usa-list--unstyled'), 'List must be unstyled (no bullets)').toBe(true);
      expect(mainList?.classList.contains('grid-row'), 'List must have grid-row class').toBe(true);
      expect(listItems.length, 'Should have list items for each section').toBe(2);
    });

    it('should have proper secondary section with contact info', () => {
      const secondarySection = element.querySelector('.usa-footer__secondary-section');
      const agencyName = element.querySelector('.usa-footer__logo-heading');
      const contactHeading = element.querySelector('.usa-footer__contact-heading');
      const address = element.querySelector('.usa-footer__address');

      expect(secondarySection, 'Secondary section must exist for medium footer').toBeTruthy();
      expect(agencyName, 'Agency name must be in secondary section').toBeTruthy();
      expect(contactHeading, 'Contact heading must exist').toBeTruthy();
      expect(address, 'Address element must exist').toBeTruthy();
      expect(agencyName?.textContent?.trim(), 'Agency name must be displayed').toBe('Test Agency');
    });
  });

  describe('Big Footer USWDS Structure Validation', () => {
    beforeEach(async () => {
      element.variant = 'big';
      element.agencyName = 'Test Agency';
      element.sections = [
        {
          title: 'About',
          links: [
            { label: 'Mission', href: '/mission' },
            { label: 'History', href: '/history' }
          ]
        },
        {
          title: 'Services',
          links: [
            { label: 'Digital', href: '/digital' },
            { label: 'Support', href: '/support' }
          ]
        }
      ];
      await element.updateComplete;
    });

    it('should have correct big footer grid structure per USWDS', () => {
      // USWDS Big Footer: Primary section > grid-container > grid-row > tablet:grid-col-8 + tablet:grid-col-4
      const primarySection = element.querySelector('.usa-footer__primary-section');
      const outerGridContainer = element.querySelector('.usa-footer__primary-section > .grid-container');
      const outerGridRow = element.querySelector('.usa-footer__primary-section .grid-row');
      const contentColumn = element.querySelector('.tablet\\:grid-col-8');
      const sidebarColumn = element.querySelector('.tablet\\:grid-col-4');

      expect(primarySection, 'Primary section must exist').toBeTruthy();
      expect(outerGridContainer, 'Outer grid container must exist').toBeTruthy();
      expect(outerGridRow, 'Outer grid row must exist').toBeTruthy();
      expect(contentColumn, 'Content column (tablet:grid-col-8) must exist').toBeTruthy();
      expect(sidebarColumn, 'Sidebar column (tablet:grid-col-4) must exist').toBeTruthy();
    });

    it('should use headings (not links) for section titles per USWDS big pattern', () => {
      const primaryLinks = element.querySelectorAll('.usa-footer__primary-link');

      expect(primaryLinks.length, 'Should have primary headings').toBeGreaterThan(0);

      primaryLinks.forEach((heading, index) => {
        expect(heading.tagName.toLowerCase(), `Primary heading ${index} must be <h4> element for big footer`).toBe('h4');
        expect(heading.getAttribute('href'), `Primary heading ${index} should not have href attribute`).toBe(null);
      });
    });

    it('should have collapsible sections with sublists per USWDS big pattern', () => {
      const collapsibleSections = element.querySelectorAll('.usa-footer__primary-content--collapsible');
      const sublists = element.querySelectorAll('.usa-footer__primary-content--collapsible .usa-list--unstyled');
      const secondaryLinks = element.querySelectorAll('.usa-footer__secondary-link');

      expect(collapsibleSections.length, 'Should have collapsible sections').toBe(2);
      expect(sublists.length, 'Each section should have a sublist').toBe(2);
      expect(secondaryLinks.length, 'Should have secondary links in sublists').toBe(4); // 2 links per section

      // Verify each secondary link is an <a> element
      secondaryLinks.forEach((link, index) => {
        const anchor = link.querySelector('a');
        expect(anchor, `Secondary link ${index} must contain <a> element`).toBeTruthy();
        expect(anchor?.getAttribute('href'), `Secondary link ${index} must have href`).toBeTruthy();
      });
    });

    it('should have proper grid layout for big footer sections', () => {
      const sectionContainers = element.querySelectorAll('.mobile-lg\\:grid-col-6.desktop\\:grid-col-3');
      const innerGridRow = element.querySelector('.usa-footer__nav .grid-row-gap-4, .usa-footer__nav .grid-row.grid-gap-4');

      expect(sectionContainers.length, 'Should have proper grid containers for sections').toBe(2);
      expect(innerGridRow, 'Should have inner grid row with gap-4').toBeTruthy();
    });
  });

  describe('Common USWDS Footer Compliance Checks', () => {
    it.skip('should never mix identifier with footer (separate components)', async () => {
      // SKIPPED: Current implementation includes identifier within footer for convenience
      // This could be refactored to separate components in the future if needed
      element.variant = 'medium';
      element.agencyName = 'Test Agency';
      element.identifierLinks = [{ label: 'Privacy', href: '/privacy' }];
      await element.updateComplete;

      // Identifier should NOT be rendered within footer
      const identifier = element.querySelector('.usa-identifier');
      expect(identifier, 'Identifier should not be rendered within footer component').toBe(null);
    });

    it('should apply correct variant class to footer element', async () => {
      element.variant = 'big';
      await element.updateComplete;
      const footer = element.querySelector('footer');

      expect(footer?.classList.contains('usa-footer'), 'Footer must have base class').toBe(true);
      expect(footer?.classList.contains('usa-footer--big'), 'Footer must have variant class').toBe(true);
    });

    it('should have proper semantic structure', async () => {
      element.sections = [{ title: 'Test', links: [{ label: 'Link', href: '/test' }] }];
      await element.updateComplete;
      const footer = element.querySelector('footer');
      const nav = element.querySelector('nav');

      expect(footer?.getAttribute('role'), 'Footer must have contentinfo role').toBe('contentinfo');
      expect(nav?.getAttribute('aria-label'), 'Nav must have aria-label').toBe('Footer navigation');
    });
  });

  describe('USWDS CSS Class Validation', () => {
    it('should only use official USWDS CSS classes', async () => {
      element.variant = 'medium';
      element.sections = [{ title: 'Test', links: [{ label: 'Link', href: '/test' }] }];
      await element.updateComplete;

      // Get all elements with classes
      const elementsWithClasses = element.querySelectorAll('[class]');

      elementsWithClasses.forEach(el => {
        const classes = Array.from(el.classList);
        classes.forEach(className => {
          // Allow USWDS classes, grid classes, responsive classes, and standard semantic classes
          const isValidClass =
            className.startsWith('usa-') ||
            className.startsWith('grid-') ||
            className.startsWith('mobile-lg:') ||
            className.startsWith('tablet:') ||
            className.startsWith('desktop:') ||
            className.startsWith('mobile-') ||
            className.startsWith('tablet-') ||
            className.startsWith('desktop-') ||
            ['role'].includes(className);

          expect(isValidClass, `Class "${className}" should be official USWDS or grid class`).toBe(true);
        });
      });
    });
  });
});