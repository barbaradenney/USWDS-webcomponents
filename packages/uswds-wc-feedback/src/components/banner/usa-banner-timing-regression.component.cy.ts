/**
 * @fileoverview Banner Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the banner component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in initialization
 * 3. USWDS banner toggle button timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Banner Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (Banner Toggle)', () => {
    it('should toggle banner content on FIRST click of toggle button', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <div class="grid-col-auto">
                <img
                  aria-hidden="true"
                  class="usa-banner__header-flag"
                  src="/img/us_flag_small.png"
                  alt=""
                />
              </div>
              <div class="grid-col-fill tablet:grid-col-auto" aria-hidden="true">
                <p class="usa-banner__header-text">
                  An official website of the United States government
                </p>
                <p class="usa-banner__header-action">Here's how you know</p>
              </div>
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="gov-banner-default"
              >
                <span class="usa-banner__button-text">Here's how you know</span>
              </button>
            </div>
          </header>
          <div
            class="usa-banner__content usa-accordion__content"
            id="gov-banner-default"
            hidden
          >
            <div class="grid-row grid-gap-lg">
              <div class="usa-banner__guidance tablet:grid-col-6">
                <img
                  class="usa-banner__icon usa-media-block__img"
                  src="/img/icon-dot-gov.svg"
                  role="img"
                  alt=""
                  aria-hidden="true"
                />
                <div class="usa-media-block__body">
                  <p>
                    <strong>Official websites use .gov</strong><br />A
                    <strong>.gov</strong> website belongs to an official government
                    organization in the United States.
                  </p>
                </div>
              </div>
              <div class="usa-banner__guidance tablet:grid-col-6">
                <img
                  class="usa-banner__icon usa-media-block__img"
                  src="/img/icon-https.svg"
                  role="img"
                  alt=""
                  aria-hidden="true"
                />
                <div class="usa-media-block__body">
                  <p>
                    <strong>Secure .gov websites use HTTPS</strong><br />A
                    <strong>lock</strong> or <strong>https://</strong> means you've
                    safely connected to the .gov website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </usa-banner>
      `);

      // Wait for component to initialize and USWDS to set up event handlers
      cy.wait(500);

      // Verify banner button exists
      cy.get('.usa-banner__button').should('exist');

      // CRITICAL: First click should immediately work
      cy.get('.usa-banner__button').click();

      // Give USWDS time to toggle content
      cy.wait(200);

      // Banner content should be visible after FIRST click (not second)
      cy.get('.usa-banner__content').should('be.visible');
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'true');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="quick-test"
              >
                <span class="usa-banner__button-text">Quick Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="quick-test" hidden>
            <p>Quick test content</p>
          </div>
        </usa-banner>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(100);

      // Click immediately after initialization
      cy.get('.usa-banner__button').click();

      // Should work on first try
      cy.wait(200);
      cy.get('.usa-banner__content').should('be.visible');
    });

    it('should toggle correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="toggle-test"
              >
                <span class="usa-banner__button-text">Toggle Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="toggle-test" hidden>
            <p>Toggle test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Click 1: Should expand
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'true');

      // Click 2: Should collapse
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('not.be.visible');
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'false');

      // Click 3: Should expand again
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Initialization Verification', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="init-test"
              >
                <span class="usa-banner__button-text">Init Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="init-test" hidden>
            <p>Init test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // After initialization, banner button should have proper attributes
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'false');
      cy.get('.usa-banner__button').should('have.attr', 'aria-controls', 'init-test');
      cy.get('.usa-banner__content').should('have.attr', 'id', 'init-test');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-banner id="rapid-test">
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="rapid-content"
              >
                <span class="usa-banner__button-text">Rapid Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="rapid-content" hidden>
            <p>Rapid test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Rapidly change properties
      cy.get('#rapid-test').then(($banner) => {
        const banner = $banner[0] as any;
        banner.setAttribute('data-test', '1');
        banner.setAttribute('data-test', '2');
        banner.setAttribute('data-test', '3');
      });

      cy.wait(100);

      // Banner toggle should still work correctly (no duplicate handlers)
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');

      // Collapse
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('not.be.visible');

      // Expand again
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');
    });

    it('should handle pre-expanded state correctly', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="true"
                aria-controls="pre-expanded"
              >
                <span class="usa-banner__button-text">Pre-Expanded</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="pre-expanded">
            <p>Pre-expanded content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Content should be visible initially
      cy.get('.usa-banner__content').should('be.visible');
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'true');

      // Click should collapse
      cy.get('.usa-banner__button').click();
      cy.wait(100);
      cy.get('.usa-banner__content').should('not.be.visible');
    });
  });

  describe('Accessibility Validation', () => {
    it('should have correct ARIA attributes', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="a11y-test"
              >
                <span class="usa-banner__button-text">Accessibility Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="a11y-test" hidden>
            <p>Accessibility test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Button should have proper ARIA attributes
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'false');
      cy.get('.usa-banner__button').should('have.attr', 'aria-controls', 'a11y-test');

      // Content should be hidden initially
      cy.get('.usa-banner__content').should('have.attr', 'hidden');

      // Click to expand
      cy.get('.usa-banner__button').click();
      cy.wait(100);

      // ARIA attributes should update
      cy.get('.usa-banner__button').should('have.attr', 'aria-expanded', 'true');
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
    });

    it('should be keyboard navigable', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="keyboard-test"
              >
                <span class="usa-banner__button-text">Keyboard Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="keyboard-test" hidden>
            <p>Keyboard test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Focus banner button with keyboard
      cy.get('.usa-banner__button').focus();
      cy.get('.usa-banner__button').should('have.focus');

      // Press Enter to expand
      cy.get('.usa-banner__button').type('{enter}');
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');

      // Press Enter to collapse
      cy.get('.usa-banner__button').type('{enter}');
      cy.wait(100);
      cy.get('.usa-banner__content').should('not.be.visible');

      // Press Space to expand
      cy.get('.usa-banner__button').type(' ');
      cy.wait(100);
      cy.get('.usa-banner__content').should('be.visible');
    });
  });

  describe('Content Structure', () => {
    it('should maintain proper banner header structure', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <p class="usa-banner__header-text">Official website</p>
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="structure-test"
              >
                <span class="usa-banner__button-text">Structure Test</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="structure-test" hidden>
            <p>Structure test content</p>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Verify structure
      cy.get('.usa-banner__header').should('exist');
      cy.get('.usa-banner__inner').should('exist');
      cy.get('.usa-banner__header-text').should('exist');
      cy.get('.usa-banner__button').should('exist');
      cy.get('.usa-banner__content').should('exist');
    });

    it('should display banner guidance content correctly', () => {
      cy.mount(`
        <usa-banner>
          <header class="usa-banner__header">
            <div class="usa-banner__inner">
              <button
                type="button"
                class="usa-accordion__button usa-banner__button"
                aria-expanded="false"
                aria-controls="guidance-test"
              >
                <span class="usa-banner__button-text">Show Guidance</span>
              </button>
            </div>
          </header>
          <div class="usa-banner__content usa-accordion__content" id="guidance-test" hidden>
            <div class="grid-row grid-gap-lg">
              <div class="usa-banner__guidance tablet:grid-col-6">
                <p><strong>Official websites use .gov</strong></p>
              </div>
              <div class="usa-banner__guidance tablet:grid-col-6">
                <p><strong>Secure .gov websites use HTTPS</strong></p>
              </div>
            </div>
          </div>
        </usa-banner>
      `);

      cy.wait(200);

      // Expand banner
      cy.get('.usa-banner__button').click();
      cy.wait(100);

      // Guidance content should be visible
      cy.get('.usa-banner__guidance').should('have.length', 2);
      cy.get('.usa-banner__guidance').first().should('contain', 'Official websites use .gov');
      cy.get('.usa-banner__guidance').last().should('contain', 'Secure .gov websites use HTTPS');
    });
  });
});
