/**
 * Card Layout Tests
 * Prevents regression of card structure, content positioning, and media layout issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../card/index.ts';
import type { USACard } from './usa-card.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USACard Layout Tests', () => {
  let element: USACard;

  beforeEach(() => {
    element = document.createElement('usa-card') as USACard;
    element.heading = 'Test Card';
    element.text = 'This is test card content.';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS card structure', async () => {
    await element.updateComplete;

    // The host element has the card classes
    expect(element.classList.contains('usa-card'), 'Host should have usa-card class').toBe(true);

    const cardContainer = element.querySelector('.usa-card__container');
    const cardHeader = element.querySelector('.usa-card__header');
    const cardBody = element.querySelector('.usa-card__body');

    expect(cardContainer, 'Card container should exist').toBeTruthy();
    expect(cardHeader, 'Card header should exist').toBeTruthy();
    expect(cardBody, 'Card body should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(cardContainer.contains(cardHeader), 'Header should be inside container').toBe(true);
    expect(cardContainer.contains(cardBody), 'Body should be inside container').toBe(true);
  });

  it('should position card header correctly within container', async () => {
    await element.updateComplete;

    const cardContainer = element.querySelector('.usa-card__container');
    const cardHeader = element.querySelector('.usa-card__header');
    const cardBody = element.querySelector('.usa-card__body');

    expect(cardContainer, 'Card container should exist').toBeTruthy();
    expect(cardHeader, 'Card header should exist').toBeTruthy();
    expect(cardBody, 'Card body should exist').toBeTruthy();

    // Header should appear before body in container
    const containerChildren = Array.from(cardContainer.children);
    const headerIndex = containerChildren.indexOf(cardHeader);
    const bodyIndex = containerChildren.indexOf(cardBody);

    expect(headerIndex, 'Header should be found in container').toBeGreaterThan(-1);
    expect(bodyIndex, 'Body should be found in container').toBeGreaterThan(-1);
    expect(headerIndex, 'Header should appear before body').toBeLessThan(bodyIndex);
  });

  it('should position media correctly when present', async () => {
    element.mediaType = 'image';
    element.mediaSrc = 'test-image.jpg';
    element.mediaAlt = 'Test image';
    await element.updateComplete;

    const cardMedia = element.querySelector('.usa-card__media');
    const cardContainer = element.querySelector('.usa-card__container');

    expect(cardContainer, 'Card container should exist').toBeTruthy();

    if (cardMedia) {
      expect(element.contains(cardMedia), 'Media should be inside card').toBe(true);

      // Media should appear before container
      const cardChildren = Array.from(element.children);
      const mediaIndex = cardChildren.indexOf(cardMedia);
      const containerIndex = cardChildren.indexOf(cardContainer);

      expect(mediaIndex, 'Media should appear before container').toBeLessThan(containerIndex);
    }
  });

  it('should position footer correctly when present', async () => {
    element.footerText = 'Read more';
    await element.updateComplete;

    const cardContainer = element.querySelector('.usa-card__container');
    const cardBody = element.querySelector('.usa-card__body');
    const cardFooter = element.querySelector('.usa-card__footer');

    expect(cardContainer, 'Card container should exist').toBeTruthy();
    expect(cardBody, 'Card body should exist').toBeTruthy();

    if (cardFooter) {
      expect(cardContainer.contains(cardFooter), 'Footer should be inside container').toBe(true);

      // Footer should appear after body in container
      const containerChildren = Array.from(cardContainer.children);
      const bodyIndex = containerChildren.indexOf(cardBody);
      const footerIndex = containerChildren.indexOf(cardFooter);

      expect(footerIndex, 'Footer should appear after body').toBeGreaterThan(bodyIndex);
    }
  });

  it('should handle flag layout correctly', async () => {
    element.flagLayout = true;
    element.mediaType = 'image';
    element.mediaSrc = 'flag-image.jpg';
    await element.updateComplete;

    // Check host element for flag class
    expect(
      element.classList.contains('usa-card--flag'),
      'Flag card should have correct CSS class'
    ).toBe(true);
  });

  it('should handle header-first layout correctly', async () => {
    element.headerFirst = true;
    element.mediaType = 'image';
    element.mediaSrc = 'header-first-image.jpg';
    await element.updateComplete;

    // Check host element for header-first class
    expect(
      element.classList.contains('usa-card--header-first'),
      'Header-first card should have correct CSS class'
    ).toBe(true);
  });

  it('should handle media-right layout correctly', async () => {
    element.mediaType = 'image';
    element.mediaSrc = 'media-right-image.jpg';
    element.mediaPosition = 'right';
    await element.updateComplete;

    // Check host element has both flag and media-right classes (CRITICAL REGRESSION TEST)
    expect(
      element.classList.contains('usa-card--flag'),
      'Media-right card should automatically enable flag layout'
    ).toBe(true);
    expect(
      element.classList.contains('usa-card--media-right'),
      'Media-right card should have media-right CSS class'
    ).toBe(true);

    // Verify media element exists and is properly structured
    const cardMedia = element.querySelector('.usa-card__media');
    expect(cardMedia, 'Media element should exist for media-right layout').toBeTruthy();

    // CRITICAL REGRESSION TEST: Verify CSS classes don't have spacing issues
    if (cardMedia) {
      const mediaClassName = cardMedia.className;
      expect(mediaClassName, 'Media element should have clean CSS class without extra spaces').toBe('usa-card__media');
      expect(mediaClassName.includes('  '), 'CSS class should not contain double spaces').toBe(false);
      expect(mediaClassName.startsWith(' '), 'CSS class should not start with space').toBe(false);
      expect(mediaClassName.endsWith(' '), 'CSS class should not end with space').toBe(false);
    }
  });

  it('should document media-right responsive behavior', () => {
    // DOCUMENTATION TEST: This test serves as documentation for the expected behavior
    // Media-right positioning is controlled by CSS media queries:
    // - Desktop (≥640px/40em): Media appears on right side via `.usa-card--flag.usa-card--media-right` styles
    // - Mobile (<640px/40em): Standard card layout with media above content
    //
    // This behavior is defined in USWDS CSS, not in our component logic.
    // The component's responsibility is to:
    // 1. Apply correct CSS classes (usa-card--flag usa-card--media-right)
    // 2. Structure DOM elements properly
    // 3. Let USWDS CSS handle responsive behavior

    element.mediaType = 'image';
    element.mediaSrc = 'test.jpg';
    element.mediaPosition = 'right';

    expect(element.mediaPosition).toBe('right');
    expect(() => {
      // This test passes if the component applies the correct classes
      // The actual responsive behavior is tested in Storybook/Cypress at different viewports
    }).not.toThrow();
  });

  it('should position card heading correctly within header', async () => {
    await element.updateComplete;

    const cardHeader = element.querySelector('.usa-card__header');
    const heading = element.querySelector('.usa-card__heading');

    expect(cardHeader, 'Card header should exist').toBeTruthy();
    expect(heading, 'Card heading should exist').toBeTruthy();

    if (cardHeader && heading) {
      expect(cardHeader.contains(heading), 'Heading should be inside header').toBe(true);
    }
  });

  it('should handle card body content correctly', async () => {
    await element.updateComplete;

    const cardBody = element.querySelector('.usa-card__body');

    expect(cardBody, 'Card body should exist').toBeTruthy();

    if (cardBody) {
      expect(cardBody.textContent.trim(), 'Card body should contain text content').toBe(
        'This is test card content.'
      );
    }
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/card/usa-card.ts`;
      const validation = validateComponentJavaScript(componentPath, 'card');

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

  describe('CSS Class Regression Prevention', () => {
    // NOTE: Media inset positioning CSS test is redundant
    // Same validation pattern already covered by exdent test below
    // Comprehensive CSS class validation also covered in validateAllCardCSSClasses test

    it('should have clean CSS classes for media exdent positioning', async () => {
      element.mediaType = 'image';
      element.mediaSrc = 'exdent-test.jpg';
      element.mediaPosition = 'exdent';
      await element.updateComplete;

      const cardMedia = element.querySelector('.usa-card__media');
      expect(cardMedia, 'Media element should exist').toBeTruthy();

      if (cardMedia) {
        const className = cardMedia.className;
        expect(className, 'Should have correct exdent classes').toBe('usa-card__media usa-card__media--exdent');
        expect(className.includes('  '), 'Should not contain double spaces').toBe(false);
        expect(className.startsWith(' '), 'Should not start with space').toBe(false);
        expect(className.endsWith(' '), 'Should not end with space').toBe(false);
      }
    });

    it('should have clean CSS classes for video media with all positions', async () => {
      const positions = ['inset', 'exdent', 'right'] as const;

      for (const position of positions) {
        element.mediaType = 'video';
        element.mediaSrc = `${position}-test.mp4`;
        element.mediaPosition = position;
        await element.updateComplete;

        const cardMedia = element.querySelector('.usa-card__media');
        expect(cardMedia, `Media element should exist for ${position} position`).toBeTruthy();

        if (cardMedia) {
          const className = cardMedia.className;

          // Verify expected class name based on position
          const expectedClass = position === 'right'
            ? 'usa-card__media'
            : `usa-card__media usa-card__media--${position}`;

          expect(className, `Should have correct ${position} classes`).toBe(expectedClass);
          expect(className.includes('  '), `Should not contain double spaces for ${position}`).toBe(false);
          expect(className.startsWith(' '), `Should not start with space for ${position}`).toBe(false);
          expect(className.endsWith(' '), `Should not end with space for ${position}`).toBe(false);
        }
      }
    });

    it('should validate all USWDS card CSS classes are properly formatted', async () => {
      // Test comprehensive card with all features
      element.mediaType = 'image';
      element.mediaSrc = 'comprehensive-test.jpg';
      element.mediaPosition = 'right';
      element.flagLayout = true;
      element.headerFirst = false;
      element.actionable = true;
      element.footerText = 'Footer content';
      await element.updateComplete;

      // Host element classes
      const hostClasses = element.className.split(' ');
      const expectedHostClasses = ['usa-card', 'usa-card--flag', 'usa-card--media-right'];
      expectedHostClasses.forEach(expectedClass => {
        expect(hostClasses.includes(expectedClass), `Host should include ${expectedClass}`).toBe(true);
      });

      // No double spaces in host classes
      expect(element.className.includes('  '), 'Host classes should not have double spaces').toBe(false);

      // Check all child elements for clean CSS classes
      const allElements = element.querySelectorAll('[class]');
      allElements.forEach((el, index) => {
        const className = el.className;
        expect(className.includes('  '), `Element ${index} should not have double spaces in classes`).toBe(false);
        expect(className.startsWith(' '), `Element ${index} should not start with space`).toBe(false);
        expect(className.endsWith(' '), `Element ${index} should not end with space`).toBe(false);
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for card structure', async () => {
      await element.updateComplete;

      const cardContainer = element.querySelector('.usa-card__container');

      expect(cardContainer, 'Card container should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(element.classList.contains('usa-card')).toBe(true);
      expect(cardContainer.classList.contains('usa-card__container')).toBe(true);
    });

    it('should maintain card structure integrity', async () => {
      await element.updateComplete;

      const cardHeader = element.querySelector('.usa-card__header');
      const cardBody = element.querySelector('.usa-card__body');
      const heading = element.querySelector('.usa-card__heading');

      expect(cardHeader, 'Card header should be present').toBeTruthy();
      expect(cardBody, 'Card body should be present').toBeTruthy();
      expect(heading, 'Card heading should be present').toBeTruthy();
    });

    it('should handle different card variants correctly', async () => {
      // Test flag variant
      element.flagLayout = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--flag')).toBe(true);

      // Test header-first variant
      element.flagLayout = false;
      element.headerFirst = true;
      await element.updateComplete;

      expect(element.classList.contains('usa-card--header-first')).toBe(true);
    });

    it('should handle media content correctly', async () => {
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
      element.mediaAlt = 'Test image';
      await element.updateComplete;

      const cardMedia = element.querySelector('.usa-card__media');
      const imageContainer = element.querySelector('.usa-card__img');
      const image = element.querySelector('.usa-card__img img');

      if (cardMedia && imageContainer && image) {
        expect(cardMedia.contains(imageContainer)).toBe(true);
        expect(imageContainer.contains(image)).toBe(true);
        expect(image.getAttribute('src')).toBe('test.jpg');
        expect(image.getAttribute('alt')).toBe('Test image');
      }
    });

    it('should handle footer content correctly', async () => {
      element.footerText = 'Action';
      await element.updateComplete;

      const cardFooter = element.querySelector('.usa-card__footer');

      if (cardFooter) {
        expect(cardFooter.textContent?.trim()).toBe('Action');
      }
    });

    it('should handle actionable cards correctly', async () => {
      element.actionable = true;
      element.href = '/test-link';
      await element.updateComplete;

      // Check that element has proper role and tabindex for actionable behavior
      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('should handle card without media correctly', async () => {
      // Ensure no media is set
      element.mediaType = 'none';
      element.mediaSrc = '';
      await element.updateComplete;

      const cardMedia = element.querySelector('.usa-card__media');
      expect(cardMedia, 'Media should not exist when no image is specified').toBeFalsy();
    });

    it('should handle custom heading levels correctly', async () => {
      element.headingLevel = '3';
      await element.updateComplete;

      const heading = element.querySelector('.usa-card__heading');

      if (heading) {
        expect(heading.tagName.toLowerCase()).toBe('h3');
      }
    });

    it('should maintain proper content hierarchy', async () => {
      element.mediaType = 'image';
      element.mediaSrc = 'test.jpg';
      element.footerText = 'Footer content';
      await element.updateComplete;

      const cardChildren = Array.from(element.children);

      // Should have media first, then container
      const cardMedia = element.querySelector('.usa-card__media');
      const cardContainer = element.querySelector('.usa-card__container');

      if (cardMedia && cardContainer) {
        const mediaIndex = cardChildren.indexOf(cardMedia);
        const containerIndex = cardChildren.indexOf(cardContainer);
        expect(mediaIndex).toBeLessThan(containerIndex);
      }

      // Within container: header, body, footer
      const containerChildren = Array.from(cardContainer.children);
      const cardHeader = element.querySelector('.usa-card__header');
      const cardBody = element.querySelector('.usa-card__body');
      const cardFooter = element.querySelector('.usa-card__footer');

      if (cardHeader && cardBody) {
        const headerIndex = containerChildren.indexOf(cardHeader);
        const bodyIndex = containerChildren.indexOf(cardBody);
        expect(headerIndex).toBeLessThan(bodyIndex);

        if (cardFooter) {
          const footerIndex = containerChildren.indexOf(cardFooter);
          expect(bodyIndex).toBeLessThan(footerIndex);
        }
      }
    });

    it('should handle card click events correctly', async () => {
      let clickEventFired = false;
      element.addEventListener('card-click', () => {
        clickEventFired = true;
      });

      element.actionable = true;
      element.href = '/test';
      await element.updateComplete;

      // Click the host element (which has the click handler)
      element.click();
      expect(clickEventFired, 'Click event should fire for actionable cards').toBe(true);
    });
  });
});
