/**
 * Identifier Layout Tests
 * Prevents regression of identifier structure and multi-section layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../identifier/index.ts';
import type { USAIdentifier } from './usa-identifier.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USAIdentifier Layout Tests', () => {
  let element: USAIdentifier;

  beforeEach(() => {
    element = document.createElement('usa-identifier') as USAIdentifier;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS identifier structure', async () => {
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const identifierSection = element.querySelector('.usa-identifier__section');
    const identifierContainer = element.querySelector('.usa-identifier__container');

    expect(identifier, 'Identifier should exist').toBeTruthy();
    expect(identifier?.classList.contains('usa-identifier')).toBe(true);

    if (identifierSection) {
      expect(identifier?.contains(identifierSection)).toBe(true);
    }
    if (identifierContainer) {
      expect(identifierSection?.contains(identifierContainer)).toBe(true);
    }
  });

  it('should position masthead section correctly (CRITICAL REGRESSION TEST)', async () => {
    element.domain = 'test.gov';
    element.agency = 'Test Agency';
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const identityElement = element.querySelector('.usa-identifier__identity');
    const logosElement = element.querySelector('.usa-identifier__logos');

    expect(mastheadSection, 'Masthead section should exist').toBeTruthy();
    expect(identityElement, 'Identity element should exist').toBeTruthy();
    expect(logosElement, 'Logos element should exist').toBeTruthy();

    // Verify masthead is inside identifier
    expect(identifier?.contains(mastheadSection), 'Masthead should be inside identifier').toBe(true);

    // Verify proper structure hierarchy within masthead
    const mastheadContainer = mastheadSection?.querySelector('.usa-identifier__container');
    expect(mastheadContainer, 'Masthead should have container').toBeTruthy();
    expect(mastheadContainer?.contains(logosElement), 'Logos should be in masthead container').toBe(true);
    expect(mastheadContainer?.contains(identityElement), 'Identity should be in masthead container').toBe(true);
  });

  it('should position required links section correctly when present', async () => {
    element.showRequiredLinks = true;
    element.requiredLinks = [
      { href: '/test1', text: 'Test Link 1' },
      { href: '/test2', text: 'Test Link 2' }
    ];
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const requiredLinksSection = element.querySelector('.usa-identifier__section--required-links');
    const requiredLinksList = element.querySelector('.usa-identifier__required-links-list');
    const requiredLinksItems = element.querySelectorAll('.usa-identifier__required-links-item');

    expect(requiredLinksSection, 'Required links section should exist').toBeTruthy();
    expect(requiredLinksList, 'Required links list should exist').toBeTruthy();
    expect(requiredLinksItems.length, 'Should have correct number of link items').toBe(2);

    // Verify structure hierarchy
    expect(identifier?.contains(requiredLinksSection), 'Required links should be inside identifier').toBe(true);
    expect(requiredLinksSection?.contains(requiredLinksList), 'List should be inside links section').toBe(true);

    // Verify required links section appears after masthead
    const identifierChildren = Array.from(identifier?.children || []);
    const mastheadIndex = identifierChildren.indexOf(mastheadSection);
    const linksIndex = identifierChildren.indexOf(requiredLinksSection);

    expect(mastheadIndex, 'Should find masthead section').toBeGreaterThan(-1);
    expect(linksIndex, 'Should find required links section').toBeGreaterThan(-1);
    expect(linksIndex, 'Required links should appear after masthead').toBeGreaterThan(mastheadIndex);
  });

  it('should position logos section correctly when present', async () => {
    element.showLogos = true;
    element.logos = [
      { src: '/logo1.png', alt: 'Logo 1' },
      { src: '/logo2.png', alt: 'Logo 2', href: '/logo2-link' }
    ];
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const allSections = element.querySelectorAll('.usa-identifier__section');
    const logosSection = allSections[2]; // Third section should be additional logos
    const logosContainer = logosSection?.querySelector('.usa-identifier__logos');

    // Count logos in the additional logos section only (not masthead)
    const additionalLogos = logosContainer?.querySelectorAll('.usa-identifier__logo');

    expect(logosSection, 'Logos section should exist').toBeTruthy();
    expect(logosContainer, 'Logos container should exist').toBeTruthy();
    expect(additionalLogos?.length, 'Should have correct number of additional logos').toBe(2);

    // Verify structure hierarchy
    expect(identifier?.contains(logosSection), 'Logos section should be inside identifier').toBe(true);
    expect(logosSection?.contains(logosContainer), 'Logos container should be inside logos section').toBe(true);
  });

  it('should handle identifier without required links', async () => {
    element.showRequiredLinks = false;
    element.requiredLinks = [];
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const requiredLinksSection = element.querySelector('.usa-identifier__section--required-links');

    expect(identifier, 'Identifier should exist').toBeTruthy();
    expect(mastheadSection, 'Masthead should exist').toBeTruthy();
    expect(requiredLinksSection, 'Required links section should not exist').toBeFalsy();
  });

  it('should handle identifier without logos', async () => {
    element.showLogos = false;
    element.logos = [];
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const logosSection = element.querySelectorAll('.usa-identifier__section')[2]; // Check if third section exists

    expect(identifier, 'Identifier should exist').toBeTruthy();
    expect(mastheadSection, 'Masthead should exist').toBeTruthy();
    expect(logosSection, 'Logos section should not exist').toBeFalsy();
  });

  it('should maintain proper section ordering in complete identifier', async () => {
    element.domain = 'full.gov';
    element.agency = 'Full Agency';
    element.showRequiredLinks = true;
    element.requiredLinks = [{ href: '/full-link', text: 'Full Link' }];
    element.showLogos = true;
    element.logos = [{ src: '/full-logo.png', alt: 'Full Logo' }];
    await element.updateComplete;

    const identifier = element.querySelector('.usa-identifier');
    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const requiredLinksSection = element.querySelector('.usa-identifier__section--required-links');
    const sections = element.querySelectorAll('.usa-identifier__section');

    expect(sections.length, 'Should have all three sections').toBe(3);

    // Verify proper order: masthead, required-links, logos
    const identifierChildren = Array.from(identifier?.children || []);
    const mastheadIndex = identifierChildren.indexOf(mastheadSection);
    const linksIndex = identifierChildren.indexOf(requiredLinksSection);
    const logosIndex = identifierChildren.indexOf(sections[2]); // Third section (logos)

    expect(mastheadIndex, 'Masthead should be first').toBe(0);
    expect(linksIndex, 'Required links should be second').toBe(1);
    expect(logosIndex, 'Logos should be third').toBe(2);
  });

  it('should handle parent agency link correctly in masthead', async () => {
    element.domain = 'child.gov';
    element.parentAgency = 'Parent Agency';
    element.parentAgencyHref = '/parent';
    await element.updateComplete;

    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const identityDisclaimer = element.querySelector('.usa-identifier__identity-disclaimer');
    const parentLink = identityDisclaimer?.querySelector('a.usa-link');

    expect(mastheadSection, 'Masthead section should exist').toBeTruthy();
    expect(identityDisclaimer, 'Identity disclaimer should exist').toBeTruthy();
    expect(parentLink, 'Parent agency link should exist').toBeTruthy();
    expect(parentLink?.getAttribute('href')).toBe('/parent');
    expect(parentLink?.textContent).toBe('Parent Agency');
  });

  it('should handle masthead logo positioning correctly', async () => {
    element.mastheadLogoSrc = '/custom-logo.png';
    element.mastheadLogoAlt = 'Custom Logo';
    await element.updateComplete;

    const mastheadSection = element.querySelector('.usa-identifier__section--masthead');
    const logosContainer = mastheadSection?.querySelector('.usa-identifier__logos');
    const logoLink = logosContainer?.querySelector('.usa-identifier__logo.usa-link');
    const logoImg = logoLink?.querySelector('.usa-identifier__logo-img');

    expect(logosContainer, 'Logos container should exist in masthead').toBeTruthy();
    expect(logoLink, 'Logo link should exist').toBeTruthy();
    expect(logoImg, 'Logo image should exist').toBeTruthy();
    expect(logoImg?.getAttribute('src')).toBe('/custom-logo.png');
    expect(logoImg?.getAttribute('alt')).toBe('Custom Logo');

    // Verify logos appear before identity section in masthead container
    const mastheadContainer = mastheadSection?.querySelector('.usa-identifier__container');
    const identitySection = mastheadSection?.querySelector('.usa-identifier__identity');
    const containerChildren = Array.from(mastheadContainer?.children || []);

    const logosIndex = containerChildren.indexOf(logosContainer);
    const identityIndex = containerChildren.indexOf(identitySection);

    expect(logosIndex, 'Logos should appear before identity').toBeLessThan(identityIndex);
  });

  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/identifier/usa-identifier.ts`;
      const validation = validateComponentJavaScript(componentPath, 'identifier');

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
    it('should maintain identifier structure integrity', async () => {
      await element.updateComplete;

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier?.classList.contains('usa-identifier')).toBe(true);
    });
  });
});